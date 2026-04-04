import {appEnvironment, isMockMode} from '../config/appMode.js';
import {isBillingConfigured, getPublishableKeyId} from '../services/billingService.js';
import {isTwilioVoiceConfigured} from '../services/callService.js';

export async function getRuntimeConfig(req, res, next) {
  try {
    res.json({
      success: true,
      environment: appEnvironment(),
      mockMode: isMockMode(),
      razorpay: {
        billingConfigured: isBillingConfigured(),
        publishableKeyId: getPublishableKeyId(),
      },
      twilio: {
        voiceReady: isTwilioVoiceConfigured(),
      },
    });
  } catch (e) {
    next(e);
  }
}
