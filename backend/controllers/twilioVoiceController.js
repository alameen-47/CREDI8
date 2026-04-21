import callLogModel from '../models/callLogModel.js';
import customerModel from '../models/customerModel.js';
import Message from '../models/messageModel.js';
import {assertCallQuota} from '../services/usageService.js';
import {placeOutboundPstnCall} from '../services/twilioVoiceService.js';
import logger from '../utils/logger.js';

function escapeXmlText(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function getLatestMessageForOwner(ownerId) {
  const doc = await Message.findOne({owner: ownerId}).sort({createdAt: -1}).lean();
  return doc?.message || null;
}

/**
 * Auth: call ALL customers for the logged-in user (PSTN).
 * Route: POST /api/v1/customer/make-call
 */
export async function makeBulkCalls(req, res, next) {
  try {
    const ownerId = req.user?._id;
    if (!ownerId) {
      return res.status(401).json({success: false, message: 'Unauthorized'});
    }

    await assertCallQuota(ownerId);

    const customers = await customerModel.find({owner: ownerId}).lean();
    if (!customers.length) {
      return res.status(400).json({success: false, message: 'No customers found'});
    }

    // Dial sequentially (safe default to avoid rate-limit spikes).
    let started = 0;
    let failed = 0;

    for (const c of customers) {
      const log = await callLogModel.create({
        owner: ownerId,
        customerId: c._id,
        toNumber: String(c.custNumber),
        status: 'queued',
        lastAttemptAt: new Date(),
      });
      try {
        const toE164 = String(c.custNumber || '').startsWith('+')
          ? String(c.custNumber)
          : `+${String(c.custNumber || '').replace(/\D/g, '')}`;
        const call = await placeOutboundPstnCall({toNumberE164: toE164, ownerId});
        log.providerCallSid = call.sid;
        log.status = 'queued';
        await log.save();
        started++;
      } catch (e) {
        log.status = 'failed';
        log.errorMessage = e.message;
        log.retryCount = (log.retryCount || 0) + 1;
        await log.save();
        failed++;
        logger.warn('PSTN call failed', {to: c.custNumber, err: e.message});
      }
    }

    res.json({
      success: true,
      message: `Calls processed: ${started} started, ${failed} failed`,
      started,
      failed,
    });
  } catch (e) {
    if (e.status) {
      return res.status(e.status).json({success: false, code: e.code, message: e.message});
    }
    next(e);
  }
}

/**
 * Public TwiML webhook — called by Twilio when the callee answers.
 * Route: GET /api/v1/customer/twiml-voice?ownerId=...
 */
export async function getTwimlVoice(req, res) {
  try {
    const ownerId = req.query?.ownerId;
    const raw = (await getLatestMessageForOwner(ownerId)) ||
      'Hello. This is an automated reminder. Thank you.';
    const msg = escapeXmlText(raw);

    res.type('text/xml');
    res.send(
      `<Response><Say voice="alice" language="en-US">${msg}</Say><Hangup/></Response>`,
    );
  } catch (e) {
    res.type('text/xml');
    res.send('<Response><Hangup/></Response>');
  }
}

/**
 * Public status callback — called by Twilio.
 * Route: POST /api/v1/customer/call-status
 */
export async function handleTwilioStatusCallback(req, res) {
  try {
    const {CallSid, CallStatus, CallDuration} = req.body || {};
    if (!CallSid) return res.status(400).send('Missing CallSid');

    const update = {status: String(CallStatus || 'unknown').toLowerCase()};
    if (CallDuration != null) update.durationSeconds = Number(CallDuration) || 0;

    await callLogModel.findOneAndUpdate(
      {providerCallSid: CallSid},
      {$set: update},
      {new: true},
    );

    res.status(200).send('');
  } catch (e) {
    logger.error('Twilio status callback error', {err: e.message});
    res.status(500).send('');
  }
}

