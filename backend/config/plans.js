/**
 * SaaS plan tiers. Legacy `paid` in DB maps to Pro limits.
 * Razorpay: create one Plan per paid tier in Dashboard → Subscriptions → Plans,
 * then set RAZORPAY_PLAN_ID_PRO and RAZORPAY_PLAN_ID_ENTERPRISE.
 */
export const PLAN_IDS = Object.freeze({
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
});

export function normalizePlan(planId) {
  const p = String(planId || '').toLowerCase();
  if (p === 'enterprise') {
    return PLAN_IDS.ENTERPRISE;
  }
  if (p === 'paid' || p === 'pro') {
    return PLAN_IDS.PRO;
  }
  return PLAN_IDS.FREE;
}

export function getPlanLimits(planId) {
  const id = normalizePlan(planId);
  if (id === PLAN_IDS.ENTERPRISE) {
    return {
      id: PLAN_IDS.ENTERPRISE,
      maxCallsPerMonth: Number.POSITIVE_INFINITY,
      maxCallMinutesPerMonth: Number.POSITIVE_INFINITY,
      maxApiRequestsPerDay: Number.POSITIVE_INFINITY,
    };
  }
  if (id === PLAN_IDS.PRO) {
    return {
      id: PLAN_IDS.PRO,
      maxCallsPerMonth: 500,
      maxCallMinutesPerMonth: 600,
      maxApiRequestsPerDay: 2000,
    };
  }
  return {
    id: PLAN_IDS.FREE,
    maxCallsPerMonth: 50,
    maxCallMinutesPerMonth: 60,
    maxApiRequestsPerDay: 200,
  };
}

/** Razorpay Plan id (plan_...) for subscription checkout */
export function getRazorpayPlanIdForTier(planCode) {
  const p = String(planCode || '').toLowerCase();
  if (p === PLAN_IDS.ENTERPRISE) {
    return process.env.RAZORPAY_PLAN_ID_ENTERPRISE || null;
  }
  if (p === PLAN_IDS.PRO) {
    return process.env.RAZORPAY_PLAN_ID_PRO || null;
  }
  return null;
}

export function getPlanCodeFromRazorpayPlanId(planId) {
  if (!planId) {
    return null;
  }
  if (planId === process.env.RAZORPAY_PLAN_ID_ENTERPRISE) {
    return PLAN_IDS.ENTERPRISE;
  }
  if (planId === process.env.RAZORPAY_PLAN_ID_PRO) {
    return PLAN_IDS.PRO;
  }
  return null;
}

export function isPaidPlan(planId) {
  const n = normalizePlan(planId);
  return n === PLAN_IDS.PRO || n === PLAN_IDS.ENTERPRISE;
}
