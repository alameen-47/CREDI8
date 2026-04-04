import {getUsageSummaryForUser} from '../services/usageService.js';

export async function getUsage(req, res, next) {
  try {
    const summary = await getUsageSummaryForUser(req.user._id);
    if (!summary) {
      return res.status(404).json({success: false, message: 'User not found'});
    }
    res.json({success: true, data: summary});
  } catch (e) {
    next(e);
  }
}
