import userModel from '../models/userModel.js';
import callLogModel from '../models/callLogModel.js';
import {getPlanLimits, PLAN_IDS, normalizePlan} from '../config/plans.js';

function startOfUtcMonth(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export async function getUsageSummaryForUser(userId) {
  const user = await userModel.findById(userId);
  if (!user) return null;
  const plan = user.plan || PLAN_IDS.FREE;
  const limits = getPlanLimits(plan);
  const monthStart = startOfUtcMonth();

  const [callAgg] = await callLogModel.aggregate([
    {
      $match: {
        owner: user._id,
        createdAt: {$gte: monthStart},
        status: {$nin: ['scheduled', 'canceled']},
      },
    },
    {
      $group: {
        _id: null,
        calls: {$sum: 1},
        minutes: {$sum: {$divide: ['$durationSeconds', 60]}},
      },
    },
  ]);

  const callsThisMonth = callAgg?.calls || 0;
  const minutesThisMonth = Math.round((callAgg?.minutes || 0) * 100) / 100;

  return {
    plan: normalizePlan(plan),
    role: user.role || 'user',
    subscriptionStatus: user.subscriptionStatus || 'active',
    limits: {
      maxCallsPerMonth: limits.maxCallsPerMonth,
      maxCallMinutesPerMonth: limits.maxCallMinutesPerMonth,
      maxApiRequestsPerDay: limits.maxApiRequestsPerDay,
    },
    usage: {
      callsThisMonth,
      minutesThisMonth,
      apiRequestsToday: user.apiRequestsToday || 0,
    },
    razorpayCustomerId: user.razorpayCustomerId || null,
  };
}

export async function assertCallQuota(userId) {
  const summary = await getUsageSummaryForUser(userId);
  if (!summary) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const {limits, usage} = summary;
  if (
    Number.isFinite(limits.maxCallsPerMonth) &&
    usage.callsThisMonth >= limits.maxCallsPerMonth
  ) {
    const err = new Error('Monthly call limit reached for your plan');
    err.status = 402;
    err.code = 'PLAN_LIMIT_CALLS';
    throw err;
  }
  if (
    Number.isFinite(limits.maxCallMinutesPerMonth) &&
    usage.minutesThisMonth >= limits.maxCallMinutesPerMonth
  ) {
    const err = new Error('Monthly call minutes limit reached for your plan');
    err.status = 402;
    err.code = 'PLAN_LIMIT_MINUTES';
    throw err;
  }
  return summary;
}

export async function resetMonthlyUsageIfNeeded(user) {
  const now = new Date();
  const start = startOfUtcMonth(now);
  if (!user.usagePeriodStart || user.usagePeriodStart < start) {
    user.usagePeriodStart = start;
    user.usageCallMinutes = 0;
    user.usageCalls = 0;
    await user.save();
  }
}
