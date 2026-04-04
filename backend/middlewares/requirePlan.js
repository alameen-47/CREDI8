import {normalizePlan, PLAN_IDS} from '../config/plans.js';

const RANK = {
  [PLAN_IDS.FREE]: 0,
  [PLAN_IDS.PRO]: 1,
  [PLAN_IDS.ENTERPRISE]: 2,
};

/**
 * Require user's normalized plan to be at least `minTier` (free | pro | enterprise).
 */
export function requirePlanAtLeast(minTier) {
  const need = normalizePlan(minTier);
  const needRank = RANK[need] ?? 0;
  return (req, res, next) => {
    const tier = normalizePlan(req.user?.plan);
    const rank = RANK[tier] ?? 0;
    if (rank < needRank) {
      return res.status(403).json({
        success: false,
        code: 'PLAN_UPGRADE_REQUIRED',
        message: `This feature requires ${need} plan or higher`,
      });
    }
    next();
  };
}
