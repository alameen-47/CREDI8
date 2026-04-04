import userModel from '../models/userModel.js';
import billingEventModel from '../models/billingEventModel.js';
import {
  getPublishableKeyId,
  isBillingConfigured,
  createHostedSubscription,
  verifySubscriptionPaymentSignature,
  applyVerifiedSubscription,
  completeMockSubscription,
  cancelUserSubscription,
  processRazorpayWebhookPayload,
  verifyWebhookSignature,
} from '../services/billingService.js';
import {isMockMode} from '../config/appMode.js';
import {
  getPlanLimits,
  normalizePlan,
  isPaidPlan,
  getRazorpayPlanIdForTier,
} from '../config/plans.js';

export async function getBillingSummary(req, res, next) {
  try {
    const user = await userModel.findById(req.user._id).select('-password');
    const events = await billingEventModel
      .find({owner: user._id})
      .sort({createdAt: -1})
      .limit(24)
      .lean();
    res.json({
      success: true,
      plan: normalizePlan(user.plan),
      subscriptionStatus: user.subscriptionStatus || 'active',
      hasPaidPlan: isPaidPlan(user.plan),
      mockMode: isMockMode(),
      razorpayKeyId: getPublishableKeyId(),
      billingConfigured: isBillingConfigured(),
      enterpriseConfigured:
        isMockMode() || Boolean(getRazorpayPlanIdForTier('enterprise')),
      webhookConfigured:
        isMockMode() || Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
      limits: getPlanLimits(user.plan),
      payments: events.map(i => ({
        id: i._id,
        type: i.type,
        status: i.status,
        amountMinor: i.amountCents,
        currency: i.currency,
        createdAt: i.createdAt,
        hostedInvoiceUrl: i.hostedInvoiceUrl,
        invoicePdf: i.invoicePdf,
      })),
    });
  } catch (e) {
    next(e);
  }
}

const ALLOWED_PLANS = new Set(['pro', 'enterprise']);

export async function startSubscription(req, res, next) {
  try {
    const planCode = String(req.body?.planCode || '').toLowerCase();
    if (!ALLOWED_PLANS.has(planCode)) {
      return res.status(400).json({
        success: false,
        message: 'planCode must be "pro" or "enterprise"',
      });
    }
    if (!isBillingConfigured()) {
      return res.status(503).json({
        success: false,
        message:
          'Billing is not configured. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and plan ids.',
      });
    }
    const data = await createHostedSubscription(req.user._id, planCode);
    res.status(201).json({success: true, data});
  } catch (e) {
    if (e.status) {
      return res.status(e.status).json({success: false, message: e.message});
    }
    next(e);
  }
}

export async function verifySubscription(req, res, next) {
  try {
    if (
      isMockMode() &&
      req.body?.mockConfirm === true &&
      req.body?.subscriptionId
    ) {
      await completeMockSubscription(req.user._id, req.body.subscriptionId);
      const user = await userModel.findById(req.user._id).select('-password');
      return res.json({
        success: true,
        message: 'Mock subscription activated',
        plan: normalizePlan(user.plan),
        subscriptionStatus: user.subscriptionStatus,
      });
    }

    const {razorpay_payment_id, razorpay_subscription_id, razorpay_signature} =
      req.body || {};
    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification fields',
      });
    }
    const ok = verifySubscriptionPaymentSignature(
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    );
    if (!ok) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }
    if (
      isMockMode() &&
      String(razorpay_payment_id).startsWith('pay_mock_')
    ) {
      await completeMockSubscription(
        req.user._id,
        razorpay_subscription_id,
      );
    } else {
      await applyVerifiedSubscription(req.user._id, razorpay_subscription_id);
    }
    const user = await userModel.findById(req.user._id).select('-password');
    res.json({
      success: true,
      message: 'Payment verified',
      plan: normalizePlan(user.plan),
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (e) {
    if (e.status) {
      return res.status(e.status).json({success: false, message: e.message});
    }
    next(e);
  }
}

export async function cancelSubscription(req, res, next) {
  try {
    if (!isBillingConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Billing is not configured',
      });
    }
    const result = await cancelUserSubscription(req.user._id);
    res.json({success: true, ...result});
  } catch (e) {
    if (e.status) {
      return res.status(e.status).json({success: false, message: e.message});
    }
    next(e);
  }
}

export async function handleRazorpayWebhook(req, res) {
  const sig = req.headers['x-razorpay-signature'];
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(String(req.body || ''), 'utf8');

  if (!verifyWebhookSignature(raw, sig)) {
    return res.status(400).json({success: false, message: 'Invalid signature'});
  }

  let event;
  try {
    event = JSON.parse(raw.toString('utf8'));
  } catch {
    return res.status(400).json({success: false, message: 'Invalid JSON'});
  }

  try {
    await processRazorpayWebhookPayload(event);
  } catch (e) {
    console.error('Razorpay webhook handler error', e);
    return res.status(500).json({success: false});
  }

  res.json({success: true});
}
