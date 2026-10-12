// ==============================================================================
// KYAARI JEWELLERY - RAZORPAY INTEGRATION CLIENT
// Server-Side Order Generation, Standard Checkout & Signature Verification
// ==============================================================================

/**
 * Loads the official Razorpay Checkout SDK dynamically.
 * @returns {Promise<boolean>}
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);

    if (window.Razorpay) {
      return resolve(true);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Razorpay SDK failed to load. Will fallback to simulated test mode.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Invokes backend server endpoint to create an authorized Razorpay Order with verified pricing.
 */
export async function createServerRazorpayOrder(payload) {
  const response = await fetch('/api/create-razorpay-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || data.errors?.[0] || 'Failed to initialize payment order.');
  }

  return data;
}

/**
 * Invokes backend server endpoint to verify HMAC-SHA256 signature.
 */
export async function verifyServerPaymentSignature(verificationPayload) {
  const response = await fetch('/api/verify-razorpay-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(verificationPayload)
  });

  const data = await response.json();

  if (!response.ok || !data.verified) {
    throw new Error(data.error || 'Payment signature verification failed.');
  }

  return data;
}

/**
 * Launches the Razorpay Standard Checkout UI
 *
 * @param {Object} options
 * @param {Object} options.orderData - Result from /api/create-razorpay-order
 * @param {Object} options.customer - Customer details { name, email, phone }
 * @param {Function} options.onSuccess - Callback receiving payment response
 * @param {Function} options.onFailure - Callback on dismissal or payment error
 */
export async function launchRazorpayPayment({ orderData, customer, onSuccess, onFailure }) {
  const isLoaded = await loadRazorpayScript();

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_KyaariJewelleryDemo';

  // If Razorpay SDK is available and not in mock fallback mode
  if (isLoaded && window.Razorpay && !orderData.isTestMock) {
    const options = {
      key: keyId,
      amount: orderData.amount, // Amount in paise
      currency: orderData.currency || 'INR',
      name: 'KYAARI JEWELLERY',
      description: `Payment for Order #${orderData.orderNumber} (100% Insured Delivery)`,
      image: '/kyaari-logo.jpg',
      order_id: orderData.razorpayOrderId,
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone
      },
      theme: {
        color: '#0d3838' // Luxury emerald teal
      },
      modal: {
        ondismiss: () => {
          onFailure?.({ message: 'Payment window was closed before completion.' });
        }
      },
      handler: async function (response) {
        try {
          // Perform server-side HMAC SHA256 signature verification
          const verification = await verifyServerPaymentSignature({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderNumber: orderData.orderNumber
          });

          onSuccess?.({
            ...response,
            verified: verification.verified,
            orderNumber: orderData.orderNumber
          });
        } catch (err) {
          onFailure?.({ message: err.message || 'Signature verification failed.' });
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      onFailure?.(response.error || { message: 'Transaction declined by bank.' });
    });
    rzp.open();
  } else {
    // Graceful Test Mode Simulator (Active when Razorpay test keys are pending in .env)
    const confirmed = window.confirm(
      `[KYAARI TEST PAYMENT GATEWAY]\n\n` +
      `Amount Payable: ₹${(orderData.amount / 100).toLocaleString('en-IN')}\n` +
      `Order: #${orderData.orderNumber}\n` +
      `Payer: ${customer.name} (${customer.email})\n\n` +
      `Click OK to simulate Successful Payment.\nClick Cancel to simulate Failed/Cancelled Transaction.`
    );

    if (confirmed) {
      const mockPaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 10);
      const mockSignature = 'sig_sim_' + Math.random().toString(36).substring(2, 10);

      // Verify with server endpoint
      const verification = await verifyServerPaymentSignature({
        razorpay_order_id: orderData.razorpayOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
        orderNumber: orderData.orderNumber,
        isTestMock: true
      });

      onSuccess?.({
        razorpay_order_id: orderData.razorpayOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
        verified: verification.verified,
        orderNumber: orderData.orderNumber
      });
    } else {
      onFailure?.({ message: 'Customer cancelled test transaction.' });
    }
  }
}
