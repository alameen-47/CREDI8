import mongoose from 'mongoose';
import crypto from 'crypto';

const integrationKeySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    name: {type: String, trim: true, default: 'default'},
    keyPrefix: {type: String, required: true},
    keyHash: {type: String, required: true},
    lastUsedAt: {type: Date},
    revokedAt: {type: Date},
  },
  {timestamps: true},
);

integrationKeySchema.index({owner: 1, revokedAt: 1});

export function hashIntegrationKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

export function generateIntegrationKey() {
  return `cred8_${crypto.randomBytes(24).toString('base64url')}`;
}

export default mongoose.model('integration_keys', integrationKeySchema);
