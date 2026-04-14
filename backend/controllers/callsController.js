import callLogModel from '../models/callLogModel.js';
import customerModel from '../models/customerModel.js';
import {assertCallQuota} from '../services/usageService.js';
import {placeOutboundCall, publicTwimlUrl} from '../services/callService.js';
import logger from '../utils/logger.js';

function toSaPhone(num) {
  const s = String(num).replace(/\D/g, '');
  if (!s) return null;
  return `+966${s}`;
}

export async function listCallHistory(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const logs = await callLogModel
      .find({owner: req.user._id})
      .sort({createdAt: -1})
      .limit(limit)
      .lean();
    res.json({success: true, data: logs});
  } catch (e) {
    next(e);
  }
}

export async function scheduleCalls(req, res, next) {
  try {
    const {scheduledFor, customerIds} = req.body;
    if (!scheduledFor) {
      return res
        .status(400)
        .json({success: false, message: 'scheduledFor is required (ISO date)'});
    }
    const when = new Date(scheduledFor);
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({success: false, message: 'Invalid date'});
    }
    if (when.getTime() < Date.now()) {
      return res
        .status(400)
        .json({success: false, message: 'scheduledFor must be in the future'});
    }

    await assertCallQuota(req.user._id);

    const filter = {owner: req.user._id};
    if (Array.isArray(customerIds) && customerIds.length) {
      filter._id = {$in: customerIds};
    }
    const customers = await customerModel.find(filter);
    if (!customers.length) {
      return res.status(400).json({
        success: false,
        message: 'No customers found for this user',
      });
    }

    const docs = await callLogModel.insertMany(
      customers.map(c => ({
        owner: req.user._id,
        customerId: c._id,
        toNumber: String(c.custNumber),
        status: 'scheduled',
        scheduledFor: when,
      })),
    );

    logger.info('Calls scheduled', {
      userId: req.user._id,
      count: docs.length,
      scheduledFor: when,
    });

    res.status(201).json({
      success: true,
      message: 'Calls scheduled',
      count: docs.length,
      ids: docs.map(d => d._id),
    });
  } catch (e) {
    if (e.status) {
      return res.status(e.status).json({
        success: false,
        code: e.code,
        message: e.message,
      });
    }
    next(e);
  }
}

/**
 * Worker: atomically claim and dial scheduled calls.
 *
 * Uses findOneAndUpdate to claim each job by setting status → 'queued'
 * BEFORE dialling it. This prevents duplicate calls when multiple server
 * instances run the same cron schedule simultaneously.
 *
 * Process at most `BATCH_SIZE` calls per tick to bound execution time.
 */
const MAX_RETRIES = 3;
const BATCH_SIZE = 20;

export async function processDueScheduledCalls() {
  const now = new Date();
  const twimlUrl = publicTwimlUrl();
  let processed = 0;

  // eslint-disable-next-line no-constant-condition
  while (processed < BATCH_SIZE) {
    // Atomically claim one due scheduled call
    const log = await callLogModel.findOneAndUpdate(
      {status: 'scheduled', scheduledFor: {$lte: now}},
      {$set: {status: 'queued', lastAttemptAt: now}},
      {new: true},
    );

    // No more due calls — stop
    if (!log) break;
    processed++;

    try {
      await assertCallQuota(log.owner);

      const to = toSaPhone(log.toNumber);
      if (!to) {
        log.status = 'failed';
        log.errorMessage = 'Invalid phone number';
        await log.save();
        logger.warn('Scheduled call skipped — invalid number', {
          logId: log._id,
          toNumber: log.toNumber,
        });
        continue;
      }

      const call = await placeOutboundCall({toE164: to, twimlUrl});
      log.twilioCallSid = call.sid;
      log.status = 'queued';
      log.lastAttemptAt = new Date();
      await log.save();

      logger.info('Scheduled call dialled', {
        logId: log._id,
        to,
        sid: call.sid,
        mock: Boolean(call._mock),
      });
    } catch (e) {
      log.retryCount = (log.retryCount || 0) + 1;
      log.lastAttemptAt = new Date();
      log.errorMessage = e.message;

      if (log.retryCount >= MAX_RETRIES) {
        log.status = 'failed';
        logger.error('Scheduled call permanently failed', {
          logId: log._id,
          toNumber: log.toNumber,
          retries: log.retryCount,
          err: e.message,
        });
      } else {
        // Put back to scheduled so next cron tick will retry
        log.status = 'scheduled';
        logger.warn('Scheduled call will retry', {
          logId: log._id,
          toNumber: log.toNumber,
          attempt: log.retryCount,
          err: e.message,
        });
      }
      await log.save();
    }
  }

  if (processed > 0) {
    logger.info('Cron: processed scheduled calls', {count: processed});
  }
}

/**
 * Twilio status callback — updates call log when Twilio posts back
 * the final status of a call (completed, failed, busy, no-answer).
 * Route: POST /api/v1/customer/call-status (no JWT — called by Twilio)
 */
export async function handleCallStatusCallback(req, res) {
  try {
    const {CallSid, CallStatus, CallDuration} = req.body;

    if (!CallSid) {
      return res.status(400).send('Missing CallSid');
    }

    const update = {status: String(CallStatus || 'unknown').toLowerCase()};
    if (CallDuration) {
      update.durationSeconds = Number(CallDuration) || 0;
    }

    const log = await callLogModel.findOneAndUpdate(
      {twilioCallSid: CallSid},
      {$set: update},
      {new: true},
    );

    if (log) {
      logger.info('Call status updated', {
        sid: CallSid,
        status: update.status,
        durationSeconds: update.durationSeconds,
      });
    } else {
      logger.warn('Call status callback for unknown SID', {sid: CallSid});
    }

    // Twilio expects a 200 with empty body or TwiML
    res.status(200).send('');
  } catch (e) {
    logger.error('Call status callback error', {err: e.message});
    res.status(500).send('');
  }
}
