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
      '[env] MOCK_MODE is on — billing simulation is enabled; not for real money.'
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
        'PUBLIC_API_BASE_URL is missing — external integrations may require a public HTTPS base',
      );
    }
    if (!isMockMode()) {
      if (
        !process.env.TWILIO_ACCOUNT_SID ||
        !process.env.TWILIO_AUTH_TOKEN ||
        !process.env.TWILIO_PHONE_NUMBER
      ) {
        warnings.push(
          'Twilio Voice env vars missing — PSTN calling will not work (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)',
        );
      }
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
