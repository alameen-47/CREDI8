/**
 * Call & messaging automation — Twilio adapter with MOCK_MODE simulation.
 * Replace Twilio-specific logic in twilioCallService without touching controllers.
 */
import crypto from 'crypto';
import twilio from 'twilio';
import dotenv from 'dotenv';
import {isMockMode} from '../config/appMode.js';

dotenv.config();

const accountSid =
  process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SSID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';

let twilioClient = null;

export function getTwilioClient() {
  if (isMockMode()) {
    return null;
  }
  if (!accountSid || !authToken) {
    return null;
  }
  if (!twilioClient) {
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

export function isTwilioVoiceConfigured() {
  if (isMockMode()) {
    return true;
  }
  return Boolean(
    accountSid &&
      authToken &&
      process.env.TWILIO_PHONE_NUMBER,
  );
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

/**
 * @param {{ toE164: string, twimlUrl: string }} params
 * @returns {Promise<{ sid: string, status?: string }>}
 */
export async function placeOutboundCall({toE164, twimlUrl}) {
  if (isMockMode()) {
    return {
      sid: mockCallSidSync(),
      status: 'queued',
      _mock: true,
    };
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
  });
}

/**
 * Bulk WhatsApp — real Twilio or mock success (same shape as before).
 */
export async function sendWhatsAppToCustomers({customers, messageBody}) {
  if (isMockMode()) {
    return {
      success: true,
      sent: customers.filter(c => c.custNumber).length,
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

  const sendMessages = customers.map(async customer => {
    try {
      if (customer.custNumber) {
        return client.messages.create({
          from: `whatsapp:${fromNum}`,
          to: `whatsapp:+966${customer.custNumber}`,
          body: messageBody,
        });
      }
    } catch (twilioError) {
      console.error(
        `WhatsApp send failed for ${customer.custNumber}:`,
        twilioError?.message,
      );
    }
  });

  await Promise.all(sendMessages);
  return {success: true, sent: customers.length};
}
