import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { handleVerifyPaymentSignature } from '../server/api-handlers.js';

describe('Kyaari Jewellery - Razorpay Cryptographic Signature Verification', () => {
  it('should verify legitimate HMAC-SHA256 signature', async () => {
    const testSecret = 'secret_test_kyaari_123';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_mock_123';
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = 'order_test_999';
    const paymentId = 'pay_test_888';
    const validSignature = crypto
      .createHmac('sha256', testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const result = await handleVerifyPaymentSignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      orderNumber: 'KYA-100200'
    });

    expect(result.status).toBe(200);
    expect(result.data.verified).toBe(true);
  });

  it('should reject tampered or fraudulent signatures', async () => {
    const testSecret = 'secret_test_kyaari_123';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_mock_123';
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    const orderId = 'order_test_999';
    const paymentId = 'pay_test_888';
    const tamperedSignature = 'fraudulent_signature_hash_0000000000000';

    const result = await handleVerifyPaymentSignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: tamperedSignature,
      orderNumber: 'KYA-100200'
    });

    expect(result.status).toBe(400);
    expect(result.data.verified).toBe(false);
    expect(result.data.error).toContain('mismatch');
  });

  it('should pass test mock payloads in test simulation mode', async () => {
    const result = await handleVerifyPaymentSignature({
      razorpay_order_id: 'order_test_mock',
      razorpay_payment_id: 'pay_test_mock',
      razorpay_signature: 'sig_mock',
      isTestMock: true,
      orderNumber: 'KYA-100300'
    });

    expect(result.status).toBe(200);
    expect(result.data.verified).toBe(true);
  });
});
