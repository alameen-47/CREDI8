import {appEnvironment, isMockMode} from '../config/appMode.js';
import {isBillingConfigured, getPublishableKeyId} from '../services/billingService.js';

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
    });
  } catch (e) {
    next(e);
  }
}
