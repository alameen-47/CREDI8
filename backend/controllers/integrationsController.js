import integrationKeyModel, {
  generateIntegrationKey,
  hashIntegrationKey,
} from '../models/integrationKeyModel.js';

export async function listKeys(req, res, next) {
  try {
    const keys = await integrationKeyModel
      .find({owner: req.user._id, revokedAt: null})
      .sort({createdAt: -1})
      .select('name keyPrefix createdAt lastUsedAt')
      .lean();
    res.json({success: true, data: keys});
  } catch (e) {
    next(e);
  }
}

export async function createKey(req, res, next) {
  try {
    const name = (req.body?.name || 'default').slice(0, 64);
    const raw = generateIntegrationKey();
    const keyHash = hashIntegrationKey(raw);
    const keyPrefix = raw.slice(0, 12);
    await integrationKeyModel.create({
      owner: req.user._id,
      name,
      keyPrefix,
      keyHash,
    });
    res.status(201).json({
      success: true,
      message: 'Store this key securely; it will not be shown again.',
      key: raw,
      keyPrefix,
    });
  } catch (e) {
    next(e);
  }
}

export async function revokeKey(req, res, next) {
  try {
    const {id} = req.params;
    const key = await integrationKeyModel.findOne({
      _id: id,
      owner: req.user._id,
    });
    if (!key) {
      return res.status(404).json({success: false, message: 'Key not found'});
    }
    key.revokedAt = new Date();
    await key.save();
    res.json({success: true, message: 'Key revoked'});
  } catch (e) {
    next(e);
  }
}
