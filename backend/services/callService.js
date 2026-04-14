/**
 * Call & messaging automation — Twilio adapter with MOCK_MODE simulation.
 *
 * All bulk operations use a concurrency limiter to avoid slamming Twilio's
 * API with hundreds of simultaneous requests (which causes 429 rate-limit
 * errors and connection timeouts).
 */
import crypto from 'crypto';
import twilio from 'twilio';
import dotenv from 'dotenv';
import {isMockMode} from '../config/appMode.js';
import logger from '../utils/logger.js';

dotenv.config();

const accountSid =
  process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SSID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';

let twilioClient = null;

export function getTwilioClient() {
  if (isMockMode()) return null;
  if (!accountSid || !authToken) return null;
  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

export function isTwilioVoiceConfigured() {
  if (isMockMode()) return true;
  return Boolean(accountSid && authToken && process.env.TWILIO_PHONE_NUMBER);
}

export function publicTwimlUrl() {
  const base =
    process.env.PUBLIC_API_BASE_URL ||
    process.env.PUBLIC_BASE_URL ||
    `http://127.0.0.1:${process.env.PORT || 8086}`;
  return `${base.replace(/\/$/, '')}/api/v1/customer/twiml-voice`;
}

function mockCallSidSync() {
  return `CA_mock_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// ── Concurrency limiter ───────────────────────────────────────────────────────
/**
 * Process an array of items with a maximum number of concurrent operations.
 * Prevents hammering external APIs with unbounded Promise.all.
 */
async function runWithConcurrency(items, fn, concurrency = 5) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    // Brief pause between batches to respect Twilio's rate limits
    if (i + concurrency < items.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  return results;
}

// ── Voice calls ───────────────────────────────────────────────────────────────

/**
 * Place a single outbound call.
 * @param {{ toE164: string, twimlUrl: string }} params
 * @returns {Promise<{ sid: string, status?: string }>}
 */
export async function placeOutboundCall({toE164, twimlUrl}) {
  if (isMockMode()) {
    return {sid: mockCallSidSync(), status: 'queued', _mock: true};
  }

  const tw = getTwilioClient();
  if (!tw) {
    const err = new Error('Twilio is not configured');
    err.status = 503;
    throw err;
  }
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    const err = new Error('TWILIO_PHONE_NUMBER is not set');
    err.status = 503;
    throw err;
  }
  return tw.calls.create({
    from,
    to: toE164,
    url: twimlUrl,
    statusCallback: `${publicTwimlUrl().replace('/twiml-voice', '/call-status')}`,
    statusCallbackMethod: 'POST',
    statusCallbackEvent: ['completed', 'failed', 'busy', 'no-answer'],
  });
}

// ── WhatsApp messaging ────────────────────────────────────────────────────────

/**
 * Send a single WhatsApp message with up to `maxRetries` attempts on 429 / 503.
 */
async function sendOneWhatsApp({client, from, toNumber, body, maxRetries = 2}) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const msg = await client.messages.create({
        from: `whatsapp:${from}`,
        to: `whatsapp:+966${toNumber}`,
        body,
      });
      logger.info('WhatsApp sent', {to: toNumber, sid: msg.sid});
      return {ok: true, to: toNumber, sid: msg.sid};
    } catch (err) {
      lastErr = err;
      const status = err.status || err.code;
      const isRetryable =
        status === 429 || status === 503 || status === 'ECONNRESET';
      if (!isRetryable || attempt === maxRetries) break;
      const delay = 1000 * (attempt + 1);
      logger.warn('WhatsApp send retrying', {
        to: toNumber,
        attempt: attempt + 1,
        delay,
        err: err.message,
      });
      await new Promise(r => setTimeout(r, delay));
    }
  }
  logger.error('WhatsApp send failed', {to: toNumber, err: lastErr?.message});
  return {ok: false, to: toNumber, error: lastErr?.message};
}

/**
 * Bulk WhatsApp — real Twilio or mock, with per-message retry and
 * concurrency cap to stay within Twilio rate limits.
 */
export async function sendWhatsAppToCustomers({customers, messageBody}) {
  if (isMockMode()) {
    logger.info('WhatsApp bulk send (mock)', {count: customers.length});
    return {
      success: true,
      sent: customers.filter(c => c.custNumber).length,
      failed: 0,
      _mock: true,
    };
  }

  const client = getTwilioClient();
  if (!client) {
    const err = new Error('Twilio is not configured');
    err.status = 503;
    throw err;
  }
  const fromNum = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNum) {
    const err = new Error('TWILIO_PHONE_NUMBER is not set');
    err.status = 503;
    throw err;
  }

  const body = String(messageBody).trim().slice(0, 4000);
  const eligible = customers.filter(c => c.custNumber);

  const results = await runWithConcurrency(
    eligible,
    c => sendOneWhatsApp({client, from: fromNum, toNumber: c.custNumber, body}),
    5, // max 5 concurrent Twilio API calls
  );

  const sent = results.filter(r => r.ok).length;
  const failed = results.length - sent;

  logger.info('WhatsApp bulk complete', {
    total: eligible.length,
    sent,
    failed,
  });

  return {success: true, sent, failed};
}
