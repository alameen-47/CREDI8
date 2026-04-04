import colors from 'colors';
import {isMockMode} from './appMode.js';

const PRODUCTION = process.env.NODE_ENV === 'production';

export function validateEnv() {
  const errors = [];
  const warnings = [];

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    errors.push('JWT_SECRET must be set (min 16 characters)');
  }

  if (!process.env.MONGO_URL && !process.env.MONGO_URI) {
    errors.push('MONGO_URL or MONGO_URI must be set');
  }

  if (isMockMode()) {
    console.warn(
      '[env] MOCK_MODE is on — Razorpay & Twilio use simulations; not for real money or PSTN.'
        .yellow,
    );
  }

  if (PRODUCTION) {
    if (isMockMode()) {
      warnings.push(
        'MOCK_MODE is enabled in production — disable unless you intend simulation-only traffic',
      );
    }
    if (!process.env.PUBLIC_API_BASE_URL && !process.env.PUBLIC_BASE_URL) {
      warnings.push(
        'PUBLIC_API_BASE_URL: Twilio cannot reach your TwiML URL without a public HTTPS base',
      );
    }
    const tw =
      process.env.TWILIO_ACCOUNT_SID ||
      process.env.TWILIO_SSID ||
      process.env.TWILIO_AUTH_TOKEN;
    if (!tw && !isMockMode()) {
      warnings.push('Twilio env vars missing — calling/WhatsApp will not work');
    }
    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      if (!isMockMode()) {
        warnings.push(
          'RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing — use MOCK_MODE=true for local dev without keys',
        );
      }
    } else {
      if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        warnings.push(
          'RAZORPAY_WEBHOOK_SECRET missing — subscription lifecycle sync may be incomplete',
        );
      }
      if (!process.env.RAZORPAY_PLAN_ID_PRO) {
        warnings.push('RAZORPAY_PLAN_ID_PRO missing — Pro checkout unavailable');
      }
      if (!process.env.RAZORPAY_PLAN_ID_ENTERPRISE) {
        warnings.push(
          'RAZORPAY_PLAN_ID_ENTERPRISE missing — Enterprise checkout unavailable',
        );
      }
    }
  }

  errors.forEach(e => console.error(`[env] ${e}`.red));
  warnings.forEach(w => console.warn(`[env] ${w}`.yellow));

  if (errors.length && PRODUCTION) {
    console.error('[env] Fix the above errors before serving production traffic.'.red);
    process.exit(1);
  }
}
