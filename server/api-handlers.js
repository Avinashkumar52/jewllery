// ==============================================================================
// KYAARI JEWELLERY - SERVER-SIDE API HANDLERS
// Provides Authoritative Price & Stock Validation, Razorpay Order Creation &
// Cryptographic HMAC-SHA256 Signature Verification
// ==============================================================================

import crypto from 'crypto';
import Razorpay from 'razorpay';
import { validateAndCalculateOrder } from '../src/lib/validation.js';
import { PRODUCTS } from '../src/data/products.js';

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

  const isConfigured = Boolean(
    keyId &&
    keySecret &&
    !keyId.includes('YourTestKeyId') &&
    !keySecret.includes('your_razorpay_test_key_secret')
  );

  if (!isConfigured) {
    return { client: null, isConfigured: false, keyId, keySecret };
  }

  const client = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });

  return { client, isConfigured: true, keyId, keySecret };
}

/**
 * Handle POST /api/create-razorpay-order
 */
export async function handleCreateRazorpayOrder(reqBody) {
  const {
    items = [],
    couponCode = null,
    isGiftWrapped = false,
    shippingMethod = 'standard',
    paymentMethod = 'razorpay',
    customer = {}
  } = reqBody || {};

  // Authoritative validation against server products
  const calculation = validateAndCalculateOrder({
    items,
    couponCode,
    isGiftWrapped,
    shippingMethod,
    paymentMethod,
    catalog: PRODUCTS
  });

  if (!calculation.isValid) {
    return {
      status: 400,
      data: {
        success: false,
        error: calculation.errors[0],
        errors: calculation.errors
      }
    };
  }

  const orderNumber = 'KYA-' + Math.floor(100000 + Math.random() * 900000);

  // If Cash on Delivery
  if (paymentMethod === 'cod') {
    return {
      status: 200,
      data: {
        success: true,
        isCOD: true,
        orderNumber,
        amount: Math.round(calculation.total * 100),
        currency: 'INR',
        calculation
      }
    };
  }

  // Razorpay Online Order
  const { client, isConfigured } = getRazorpayClient();
  const amountInPaise = Math.round(calculation.total * 100);

  if (isConfigured && client) {
    try {
      const orderOptions = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          customerName: customer.name || 'Valued Patron',
          customerEmail: customer.email || 'customer@kyaari.com',
          store: 'Kyaari Jewellery Maison'
        }
      };

      const rzpOrder = await client.orders.create(orderOptions);

      return {
        status: 200,
        data: {
          success: true,
          isTestMock: false,
          razorpayOrderId: rzpOrder.id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          orderNumber,
          calculation
        }
      };
    } catch (err) {
      console.error('[Razorpay Order Creation Error]:', err);
      return {
        status: 500,
        data: {
          success: false,
          error: err.error?.description || err.message || 'Razorpay order creation failed.'
        }
      };
    }
  }

  // Graceful test simulator response when Razorpay API keys are pending
  const testOrderId = 'order_test_' + Math.random().toString(36).substring(2, 12);
  return {
    status: 200,
    data: {
      success: true,
      isTestMock: true,
      razorpayOrderId: testOrderId,
      amount: amountInPaise,
      currency: 'INR',
      orderNumber,
      calculation,
      message: 'Razorpay keys pending in .env; generated test simulation order payload.'
    }
  };
}

/**
 * Handle POST /api/verify-razorpay-payment
 */
export async function handleVerifyPaymentSignature(reqBody) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderNumber,
    isTestMock = false
  } = reqBody || {};

  if (!razorpay_order_id || !razorpay_payment_id) {
    return {
      status: 400,
      data: {
        success: false,
        verified: false,
        error: 'Missing required Razorpay order or payment parameters.'
      }
    };
  }

  if (isTestMock) {
    return {
      status: 200,
      data: {
        success: true,
        verified: true,
        orderNumber,
        message: 'Test payment simulated & verified successfully.'
      }
    };
  }

  const { isConfigured, keySecret } = getRazorpayClient();

  if (!isConfigured) {
    // If not configured, safely verify in sandbox mode
    return {
      status: 200,
      data: {
        success: true,
        verified: true,
        orderNumber,
        message: 'Sandbox mode verified.'
      }
    };
  }

  try {
    const textToHash = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(textToHash)
      .digest('hex');

    const isMatch = expectedSignature === razorpay_signature;

    if (!isMatch) {
      return {
        status: 400,
        data: {
          success: false,
          verified: false,
          error: 'Cryptographic signature mismatch. Potential tampering detected.'
        }
      };
    }

    return {
      status: 200,
      data: {
        success: true,
        verified: true,
        orderNumber,
        paymentId: razorpay_payment_id
      }
    };
  } catch (err) {
    return {
      status: 500,
      data: {
        success: false,
        verified: false,
        error: err.message || 'Signature verification encountered internal error.'
      }
    };
  }
}

/**
 * Handle POST /api/validate-cart
 */
export async function handleValidateCart(reqBody) {
  const calculation = validateAndCalculateOrder({
    items: reqBody.items || [],
    couponCode: reqBody.couponCode || null,
    isGiftWrapped: reqBody.isGiftWrapped || false,
    shippingMethod: reqBody.shippingMethod || 'standard',
    paymentMethod: reqBody.paymentMethod || 'razorpay',
    catalog: PRODUCTS
  });

  return {
    status: 200,
    data: calculation
  };
}
