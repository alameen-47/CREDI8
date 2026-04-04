/**
 * Payment provider abstraction for Razorpay (subscriptions + webhooks + verification).
 * Swap implementations here if you add another provider later.
 */
import crypto from 'crypto';
import Razorpay from 'razorpay';
import {isMockMode} from '../config/appMode.js';
import userModel from '../models/userModel.js';
import billingEventModel from '../models/billingEventModel.js';
import {
  PLAN_IDS,
  getPlanCodeFromRazorpayPlanId,
  getRazorpayPlanIdForTier,
  isPaidPlan,
  normalizePlan,
} from '../config/plans.js';

let razorpaySingleton = null;

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  if (!razorpaySingleton) {
    razorpaySingleton = new Razorpay({key_id: keyId, key_secret: keySecret});
  }
  return razorpaySingleton;
}

export function isBillingConfigured() {
  if (isMockMode()) {
    return true;
  }
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_PLAN_ID_PRO,
  );
}

export function getPublishableKeyId() {
  if (isMockMode()) {
    return process.env.RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER_ADD_KEYS';
  }
  return process.env.RAZORPAY_KEY_ID || null;
}

function timingSafeEqualStr(a, b) {
  try {
    const ba = Buffer.from(String(a), 'utf8');
    const bb = Buffer.from(String(b), 'utf8');
    if (ba.length !== bb.length) {
      return false;
    }
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** Checkout success payload: never trust without this check. */
function mockPaymentSecret() {
  return (
    process.env.MOCK_PAYMENT_SECRET ||
    'cred8-mock-payment-secret-change-in-production'
  );
}

export function verifySubscriptionPaymentSignature(
  paymentId,
  subscriptionId,
  signature,
) {
  if (!paymentId || !subscriptionId || !signature) {
    return false;
  }
  if (isMockMode() && String(paymentId).startsWith('pay_mock_')) {
    const body = `${paymentId}|${subscriptionId}`;
    const expected = crypto
      .createHmac('sha256', mockPaymentSecret())
      .update(body)
      .digest('hex');
    return timingSafeEqualStr(expected, signature);
  }
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return false;
  }
  const body = `${paymentId}|${subscriptionId}`;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return timingSafeEqualStr(expected, signature);
}

/** Server-side only: build a mock payment id + signature for automated tests (never expose secret to clients). */
export function buildMockPaymentProof(subscriptionId) {
  const paymentId = `pay_mock_${crypto.randomBytes(8).toString('hex')}`;
  const sig = crypto
    .createHmac('sha256', mockPaymentSecret())
    .update(`${paymentId}|${subscriptionId}`)
    .digest('hex');
  return {paymentId, signature: sig};
}

/** Raw webhook body bytes as received (before JSON parse). */
export function verifyWebhookSignature(rawBodyBuffer, signatureHeader) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader || !rawBodyBuffer?.length) {
    if (
      isMockMode() &&
      process.env.MOCK_ALLOW_UNSIGNED_WEBHOOKS === '1' &&
      rawBodyBuffer?.length
    ) {
      return true;
    }
    return false;
  }
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBodyBuffer)
    .digest('hex');
  return timingSafeEqualStr(expected, String(signatureHeader).trim());
}

function digitsOnly(s) {
  return String(s || '').replace(/\D/g, '');
}

export async function ensureRazorpayCustomer(user) {
  const rz = getRazorpayClient();
  if (!rz) {
    const err = new Error('Razorpay is not configured');
    err.status = 503;
    throw err;
  }
  if (user.razorpayCustomerId) {
    return user.razorpayCustomerId;
  }
  const contact = digitsOnly(user.phone).slice(-15) || undefined;
  const customer = await rz.customers.create({
    name: user.name,
    email: user.email,
    contact: contact || undefined,
    fail_existing: 0,
    notes: {userId: String(user._id)},
  });
  user.razorpayCustomerId = customer.id;
  await user.save();
  return customer.id;
}

const SUBSCRIPTION_TOTAL_CYCLES = Number(
  process.env.RAZORPAY_SUBSCRIPTION_TOTAL_COUNT || 120,
);

export async function createHostedSubscription(userId, planCode) {
  const tier = String(planCode || '').toLowerCase();
  if (tier !== PLAN_IDS.PRO && tier !== PLAN_IDS.ENTERPRISE) {
    const err = new Error('Invalid plan');
    err.status = 400;
    throw err;
  }

  const user = await userModel.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  if (
    isPaidPlan(user.plan) &&
    ['active', 'authenticated'].includes(user.subscriptionStatus)
  ) {
    const err = new Error(
      'You already have an active paid subscription. Cancel it before changing plans.',
    );
    err.status = 409;
    throw err;
  }

  if (isMockMode()) {
    const subId = `sub_mock_${crypto.randomBytes(16).toString('hex')}`;
    user.razorpaySubscriptionId = subId;
    user.subscriptionStatus = 'created';
    user.mockPendingPlanCode = tier;
    await user.save();
    const {paymentId, signature} = buildMockPaymentProof(subId);
    return {
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER_ADD_KEYS',
      subscriptionId: subId,
      planCode: tier,
      mock: true,
      mockProof: {
        razorpay_payment_id: paymentId,
        razorpay_subscription_id: subId,
        razorpay_signature: signature,
      },
    };
  }

  const rz = getRazorpayClient();
  if (!rz) {
    const err = new Error('Razorpay is not configured');
    err.status = 503;
    throw err;
  }
  const plan_id = getRazorpayPlanIdForTier(tier);
  if (!plan_id) {
    const err = new Error('Plan is not configured on the server');
    err.status = 503;
    throw err;
  }

  const customerId = await ensureRazorpayCustomer(user);

  const subscription = await rz.subscriptions.create({
    plan_id,
    customer_notify: 1,
    total_count: SUBSCRIPTION_TOTAL_CYCLES,
    quantity: 1,
    customer_id: customerId,
    notify_info: {
      notify_email: user.email,
    },
    notes: {
      userId: String(user._id),
      planCode: tier,
    },
  });

  user.razorpaySubscriptionId = subscription.id;
  user.subscriptionStatus = subscription.status || 'created';
  await user.save();

  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    subscriptionId: subscription.id,
    planCode: tier,
    shortUrl: subscription.short_url || null,
  };
}

export async function applyVerifiedSubscription(userId, subscriptionId) {
  const rz = getRazorpayClient();
  if (!rz) {
    return;
  }
  const sub = await rz.subscriptions.fetch(subscriptionId);
  const noteUserId = sub.notes?.userId;
  if (noteUserId && String(noteUserId) !== String(userId)) {
    const err = new Error('Subscription does not belong to this account');
    err.status = 403;
    throw err;
  }

  const notes = sub.notes || {};
  let planCode =
    notes.planCode && String(notes.planCode).toLowerCase() === PLAN_IDS.ENTERPRISE
      ? PLAN_IDS.ENTERPRISE
      : notes.planCode && String(notes.planCode).toLowerCase() === PLAN_IDS.PRO
        ? PLAN_IDS.PRO
        : null;
  if (!planCode) {
    planCode = getPlanCodeFromRazorpayPlanId(sub.plan_id);
  }
  if (!planCode) {
    planCode = PLAN_IDS.PRO;
  }

  const activeLike = ['active', 'authenticated', 'charged'].includes(sub.status);
  const user = await userModel.findById(userId);
  if (!user) {
    return;
  }

  if (!noteUserId && user.razorpaySubscriptionId !== sub.id) {
    const err = new Error('Subscription does not match your account');
    err.status = 403;
    throw err;
  }

  if (activeLike) {
    user.plan = planCode;
    user.subscriptionStatus = sub.status;
    user.razorpaySubscriptionId = sub.id;
    await user.save();
  }
}

export async function completeMockSubscription(userId, subscriptionId) {
  if (!isMockMode()) {
    const err = new Error('Mock checkout is disabled');
    err.status = 400;
    throw err;
  }
  const user = await userModel.findById(userId);
  if (!user || String(user.razorpaySubscriptionId) !== String(subscriptionId)) {
    const err = new Error('Subscription does not match your account');
    err.status = 403;
    throw err;
  }
  if (!String(subscriptionId).startsWith('sub_mock_')) {
    const err = new Error('Invalid mock subscription id');
    err.status = 400;
    throw err;
  }
  const tier =
    user.mockPendingPlanCode === PLAN_IDS.ENTERPRISE
      ? PLAN_IDS.ENTERPRISE
      : PLAN_IDS.PRO;
  user.plan = tier;
  user.subscriptionStatus = 'active';
  user.mockPendingPlanCode = undefined;
  await user.save();
  await recordBillingEvent({
    providerEventId: `mock_checkout_${subscriptionId}_${Date.now()}`,
    ownerId: user._id,
    type: 'mock.checkout.completed',
    status: 'success',
    currency: 'INR',
    amountCents: 0,
    raw: {plan: tier, subscriptionId},
  });
}

export async function cancelUserSubscription(userId) {
  const user = await userModel.findById(userId);
  if (!user?.razorpaySubscriptionId) {
    const err = new Error('No subscription to cancel');
    err.status = 400;
    throw err;
  }

  if (isMockMode()) {
    user.plan = PLAN_IDS.FREE;
    user.subscriptionStatus = 'cancelled';
    user.razorpaySubscriptionId = null;
    user.mockPendingPlanCode = undefined;
    await user.save();
    return {subscriptionStatus: user.subscriptionStatus};
  }

  const rz = getRazorpayClient();
  if (!rz) {
    const err = new Error('Razorpay is not configured');
    err.status = 503;
    throw err;
  }
  await rz.subscriptions.cancel(user.razorpaySubscriptionId, {
    cancel_at_cycle_end: process.env.RAZORPAY_CANCEL_IMMEDIATE === '1' ? 0 : 1,
  });
  user.subscriptionStatus =
    process.env.RAZORPAY_CANCEL_IMMEDIATE === '1' ? 'cancelled' : 'canceling';
  if (process.env.RAZORPAY_CANCEL_IMMEDIATE === '1') {
    user.plan = PLAN_IDS.FREE;
    user.razorpaySubscriptionId = null;
  }
  await user.save();
  return {subscriptionStatus: user.subscriptionStatus};
}

async function recordBillingEvent({
  providerEventId,
  ownerId,
  type,
  amountMinor,
  currency,
  status,
  raw,
}) {
  if (!providerEventId) {
    return;
  }
  await billingEventModel.findOneAndUpdate(
    {providerEventId},
    {
      providerEventId,
      provider: 'razorpay',
      owner: ownerId,
      type,
      amountCents: amountMinor,
      currency: currency || 'INR',
      status,
      raw,
    },
    {upsert: true, new: true},
  );
}

async function findUserBySubscriptionNotes(subEntity) {
  const uid = subEntity?.notes?.userId;
  if (uid) {
    return userModel.findById(uid);
  }
  const sid = subEntity?.id;
  if (sid) {
    return userModel.findOne({razorpaySubscriptionId: sid});
  }
  return null;
}

/**
 * Apply parsed Razorpay webhook JSON (full event object).
 */
export async function processRazorpayWebhookPayload(event) {
  const name = event?.event;
  const payload = event?.payload || {};

  if (name === 'subscription.activated' || name === 'subscription.charged') {
    const sub = payload.subscription?.entity;
    if (!sub) {
      return;
    }
    const user = await findUserBySubscriptionNotes(sub);
    if (!user) {
      return;
    }
    const notes = sub.notes || {};
    let planCode =
      String(notes.planCode || '').toLowerCase() === PLAN_IDS.ENTERPRISE
        ? PLAN_IDS.ENTERPRISE
        : String(notes.planCode || '').toLowerCase() === PLAN_IDS.PRO
          ? PLAN_IDS.PRO
          : getPlanCodeFromRazorpayPlanId(sub.plan_id) || PLAN_IDS.PRO;
    user.plan = planCode;
    user.subscriptionStatus = sub.status || 'active';
    user.razorpaySubscriptionId = sub.id;
    await user.save();

    const pay = payload.payment?.entity;
    const evId = pay?.id || `${name}_${sub.id}_${event.created_at}`;
    await recordBillingEvent({
      providerEventId: evId,
      ownerId: user._id,
      type: name,
      amountMinor: pay?.amount,
      currency: pay?.currency,
      status: pay?.status || sub.status,
      raw: {subscription: sub.id, payment: pay?.id},
    });
  }

  if (name === 'subscription.cancelled' || name === 'subscription.completed') {
    const sub = payload.subscription?.entity;
    if (!sub) {
      return;
    }
    const user = await findUserBySubscriptionNotes(sub);
    if (!user) {
      return;
    }
    user.plan = PLAN_IDS.FREE;
    user.subscriptionStatus =
      name === 'subscription.completed' ? 'completed' : 'cancelled';
    user.razorpaySubscriptionId = null;
    await user.save();

    await recordBillingEvent({
      providerEventId: `${name}_${sub.id}_${event.created_at}`,
      ownerId: user._id,
      type: name,
      raw: {subscription: sub.id},
    });
  }

  if (name === 'subscription.pending' || name === 'subscription.halted') {
    const sub = payload.subscription?.entity;
    if (!sub) {
      return;
    }
    const user = await findUserBySubscriptionNotes(sub);
    if (!user) {
      return;
    }
    user.subscriptionStatus = sub.status || name.split('.')[1];
    await user.save();
  }

  if (name === 'payment.failed') {
    const pay = payload.payment?.entity;
    if (pay?.id) {
      await recordBillingEvent({
        providerEventId: pay.id,
        ownerId: null,
        type: name,
        amountMinor: pay.amount,
        currency: pay.currency,
        status: 'failed',
        raw: pay,
      });
    }
  }
}
