import express from 'express';
import {authMiddleware} from '../middlewares/authMiddleware.js';
import {requirePlanAtLeast} from '../middlewares/requirePlan.js';
import {PLAN_IDS} from '../config/plans.js';
import {getRuntimeConfig} from '../controllers/saasMetaController.js';
import {
  getBillingSummary,
  startSubscription,
  verifySubscription,
  cancelSubscription,
} from '../controllers/billingController.js';
import {getUsage} from '../controllers/usageController.js';
import {
  listCallHistory,
  scheduleCalls,
} from '../controllers/callsController.js';
import {
  createKey,
  listKeys,
  revokeKey,
} from '../controllers/integrationsController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/saas/config', getRuntimeConfig);

router.get('/billing/summary', getBillingSummary);
router.post('/billing/subscription/start', startSubscription);
router.post('/billing/verify-subscription', verifySubscription);
router.post('/billing/subscription/cancel', cancelSubscription);

router.get('/usage/summary', getUsage);

router.get('/calls/history', listCallHistory);
router.post('/calls/schedule', scheduleCalls);

router.get('/integrations/keys', listKeys);
router.post(
  '/integrations/keys',
  requirePlanAtLeast(PLAN_IDS.PRO),
  createKey,
);
router.delete('/integrations/keys/:id', revokeKey);

export default router;
