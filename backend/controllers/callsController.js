import callLogModel from '../models/callLogModel.js';
import customerModel from '../models/customerModel.js';
import {assertCallQuota} from '../services/usageService.js';
import {placeOutboundCall, publicTwimlUrl} from '../services/callService.js';

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
 * Worker: dial scheduled calls whose time has passed (invoked by cron).
 */
export async function processDueScheduledCalls() {
  const now = new Date();
  const due = await callLogModel
    .find({
      status: 'scheduled',
      scheduledFor: {$lte: now},
    })
    .limit(30);

  const twimlUrl = publicTwimlUrl();

  for (const log of due) {
    try {
      await assertCallQuota(log.owner);
      const to = toSaPhone(log.toNumber);
      if (!to) {
        log.status = 'failed';
        log.errorMessage = 'Invalid number';
        await log.save();
        continue;
      }
      const call = await placeOutboundCall({toE164: to, twimlUrl});
      log.twilioCallSid = call.sid;
      log.status = 'queued';
      log.lastAttemptAt = new Date();
      await log.save();
    } catch (e) {
      log.retryCount = (log.retryCount || 0) + 1;
      log.lastAttemptAt = new Date();
      log.errorMessage = e.message;
      if (log.retryCount >= 3) {
        log.status = 'failed';
      }
      await log.save();
    }
  }
}
