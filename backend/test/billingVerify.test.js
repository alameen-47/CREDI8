import {test} from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';

process.env.RAZORPAY_KEY_ID = 'rzp_test_x';
process.env.RAZORPAY_KEY_SECRET = 'secret_for_sig';
process.env.RAZORPAY_WEBHOOK_SECRET = 'whsec_secret';

const {
  verifySubscriptionPaymentSignature,
  verifyWebhookSignature,
} = await import('../services/billingService.js');

test('verifySubscriptionPaymentSignature accepts valid HMAC', () => {
  const paymentId = 'pay_1';
  const subId = 'sub_1';
  const sig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${paymentId}|${subId}`)
    .digest('hex');
  assert.strictEqual(
    verifySubscriptionPaymentSignature(paymentId, subId, sig),
    true,
  );
});

test('verifySubscriptionPaymentSignature rejects invalid signature', () => {
  assert.strictEqual(
    verifySubscriptionPaymentSignature('pay_a', 'sub_b', 'not_valid_hex_signature'),
    false,
  );
});

test('verifyWebhookSignature accepts valid HMAC over raw body', () => {
  const raw = Buffer.from('{"event":"payment.test"}', 'utf8');
  const sig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(raw)
    .digest('hex');
  assert.strictEqual(verifyWebhookSignature(raw, sig), true);
});

test('verifyWebhookSignature rejects wrong secret', () => {
  const raw = Buffer.from('{}', 'utf8');
  assert.strictEqual(verifyWebhookSignature(raw, 'deadbeef'), false);
});

test('mock pay_ subscription signature validates in MOCK_MODE', async () => {
  process.env.MOCK_MODE = 'true';
  const {verifySubscriptionPaymentSignature} = await import(
    '../services/billingService.js',
  );
  const sub = 'sub_mock_test123';
  const pay = 'pay_mock_abcdef01';
  const secret =
    process.env.MOCK_PAYMENT_SECRET ||
    'cred8-mock-payment-secret-change-in-production';
  const sig = crypto.createHmac('sha256', secret).update(`${pay}|${sub}`).digest('hex');
  assert.strictEqual(verifySubscriptionPaymentSignature(pay, sub, sig), true);
});
