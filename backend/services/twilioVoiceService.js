import twilio from 'twilio';
import {isMockMode} from '../config/appMode.js';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

let clientSingleton = null;

export function getTwilioClient() {
  if (isMockMode()) return null;
  if (!accountSid || !authToken) return null;
  if (!clientSingleton) {
    clientSingleton = twilio(accountSid, authToken);
  }
  return clientSingleton;
}

export function assertTwilioVoiceConfigured() {
  if (isMockMode()) return;
  if (!accountSid || !authToken || !fromNumber) {
    const err = new Error(
      'Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.',
    );
    err.status = 503;
    throw err;
  }
}

export function publicBaseUrl() {
  const base =
    process.env.PUBLIC_API_BASE_URL ||
    process.env.PUBLIC_BASE_URL ||
    `http://127.0.0.1:${process.env.PORT || 8086}`;
  return base.replace(/\/$/, '');
}

export function twimlUrlForOwner(ownerId) {
  return `${publicBaseUrl()}/api/v1/customer/twiml-voice?ownerId=${encodeURIComponent(
    String(ownerId),
  )}`;
}

export function statusCallbackUrl() {
  return `${publicBaseUrl()}/api/v1/customer/call-status`;
}

function normalizeE164(to) {
  const s = String(to || '').trim();
  if (!s) return null;
  if (s.startsWith('+')) return s;
  // fallback: digits only (caller should send +E164 ideally)
  const digits = s.replace(/\D/g, '');
  return digits ? `+${digits}` : null;
}

export async function placeOutboundPstnCall({toNumberE164, ownerId}) {
  assertTwilioVoiceConfigured();
  const to = normalizeE164(toNumberE164);
  if (!to) {
    const err = new Error('Invalid destination phone number');
    err.status = 400;
    throw err;
  }

  if (isMockMode()) {
    return {
      sid: `CA_mock_${Date.now()}`,
      status: 'queued',
      _mock: true,
      to,
    };
  }

  const client = getTwilioClient();
  if (!client) {
    const err = new Error('Twilio client not available');
    err.status = 503;
    throw err;
  }

  const call = await client.calls.create({
    from: fromNumber,
    to,
    url: twimlUrlForOwner(ownerId),
    method: 'GET',
    statusCallback: statusCallbackUrl(),
    statusCallbackMethod: 'POST',
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
  });

  return {sid: call.sid, status: call.status, to};
}

