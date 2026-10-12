import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Building,
  QrCode,
  Truck,
  Gift,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';
import { STORE_POLICIES } from '../lib/validation';
import { createServerRazorpayOrder, launchRazorpayPayment } from '../lib/razorpay';
import { createOrderRecord } from '../lib/supabase';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  appliedCoupon,
  isGiftWrapped,
  shippingMethod,
  setShippingMethod,
  calculatedTotals,
  currentUser,
  onOrderSuccess,
  showToast
}) {
  const [formData, setFormData] = useState({
    fullName: currentUser?.full_name || 'Rajesh Kumar Singhania',
    email: currentUser?.email || 'customer@kyaarijewellery.com',
    phone: currentUser?.phone || '+91 98765 43210',
    addressLine: 'Flat 402, Royal Palms, Turner Road, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050'
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const totalPayable = calculatedTotals?.total || 0;
  const isCodAllowed = totalPayable <= STORE_POLICIES.codMaxLimit;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePayAndSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    // Validation
    if (!formData.fullName.trim() || !formData.addressLine.trim() || !formData.pincode.trim()) {
      setErrorMessage('Please fill in all mandatory delivery address fields.');
      setIsProcessing(false);
      return;
    }

    if (formData.pincode.length < 6) {
      setErrorMessage('Please provide a valid 6-digit Indian PIN Code.');
      setIsProcessing(false);
      return;
    }

    try {
      const orderPayload = {
        items: cart.map((item) => ({ id: item.id, qty: item.qty })),
        couponCode: appliedCoupon?.code || null,
        isGiftWrapped,
        shippingMethod,
        paymentMethod,
        customer: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone
        }
      };

      // 1. Create Server-Authorized Payment Order
      const serverOrderRes = await createServerRazorpayOrder(orderPayload);
      const serverOrderData = serverOrderRes.data;

      // 2. Handle Payment Flow
      if (paymentMethod === 'cod') {
        // Cash on delivery flow
        const confirmedOrder = await createOrderRecord(
          {
            order_number: serverOrderData.orderNumber,
            user_id: currentUser?.id || null,
            customer_name: formData.fullName,
            customer_email: formData.email,
            customer_phone: formData.phone,
            shipping_address: formData,
            subtotal: serverOrderData.calculation.subtotal,
            discount: serverOrderData.calculation.discount,
            gift_wrap_fee: serverOrderData.calculation.giftWrapFee,
            tax: serverOrderData.calculation.tax,
            shipping_fee: serverOrderData.calculation.shippingFee,
            total_amount: serverOrderData.calculation.total,
            payment_method: 'cod',
            payment_status: 'cod_pending',
            order_status: 'confirmed',
            tracking_number: 'BLUEDART-' + Math.floor(1000000 + Math.random() * 9000000)
          },
          serverOrderData.calculation.items
        );

        showToast?.('Order placed successfully with insured Cash on Delivery!');
        onOrderSuccess?.(confirmedOrder);
        onClose();
      } else {
        // Razorpay Online Payment Flow
        await launchRazorpayPayment({
          orderData: serverOrderData,
          customer: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone
          },
          onSuccess: async (paymentResult) => {
            try {
              const confirmedOrder = await createOrderRecord(
                {
                  order_number: serverOrderData.orderNumber,
                  user_id: currentUser?.id || null,
                  customer_name: formData.fullName,
                  customer_email: formData.email,
                  customer_phone: formData.phone,
                  shipping_address: formData,
                  subtotal: serverOrderData.calculation.subtotal,
                  discount: serverOrderData.calculation.discount,
                  gift_wrap_fee: serverOrderData.calculation.giftWrapFee,
                  tax: serverOrderData.calculation.tax,
                  shipping_fee: serverOrderData.calculation.shippingFee,
                  total_amount: serverOrderData.calculation.total,
                  payment_method: 'razorpay',
                  payment_status: 'completed',
                  razorpay_order_id: paymentResult.razorpay_order_id,
                  razorpay_payment_id: paymentResult.razorpay_payment_id,
                  razorpay_signature: paymentResult.razorpay_signature,
                  order_status: 'confirmed',
                  tracking_number: 'BLUEDART-' + Math.floor(1000000 + Math.random() * 9000000)
                },
                serverOrderData.calculation.items
              );

              showToast?.('Payment verified! Insured order confirmed.');
              onOrderSuccess?.(confirmedOrder);
              onClose();
            } catch (recordErr) {
              setErrorMessage('Payment succeeded, but recording order failed: ' + recordErr.message);
            }
          },
          onFailure: (err) => {
            setErrorMessage(err.message || 'Payment was not completed. Please retry.');
            setIsProcessing(false);
          }
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error executing checkout order.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-checkout-title">
      <div
        className="modal-content checkout-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '980px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '36px' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close checkout">
          <X size={18} />
        </button>

        <div style={{ marginBottom: '24px' }}>
          <span className="pdp-badge pdp-badge-gold" style={{ display: 'inline-block', marginBottom: '6px' }}>
            INSURED DIRECT ESCROW
          </span>
          <h3 id="modal-checkout-title" style={{ fontSize: '1.65rem', color: 'var(--primary-teal)', margin: '4px 0 6px 0', fontFamily: 'var(--font-heading)' }}>
            Order Checkout
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Armoured transit by BlueDart / Sequel Logistics with tamper-evident security seal.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '6px',
              background: '#fef2f2',
              border: '1px solid #f87171',
              color: '#991b1b',
              fontSize: '0.88rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePayAndSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }} className="checkout-layout-grid">
            {/* Left Form: Details, Shipping, Payment */}
            <div>
              {/* 1. Patron & Address */}
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-teal)', marginBottom: '10px' }}>
                1. Delivery & Contact Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                <input
                  type="text"
                  required
                  placeholder="Full Name (for delivery verification)"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-gold)', fontSize: '0.88rem' }}
                />

                <div className="checkout-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-gold)', fontSize: '0.88rem' }}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile (+91)"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-gold)', fontSize: '0.88rem' }}
                  />
                </div>

                <input
                  type="text"
                  required
                  placeholder="Address Line (Flat / Building / Street)"
                  value={formData.addressLine}
                  onChange={(e) => handleInputChange('addressLine', e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-gold)', fontSize: '0.88rem' }}
                />

                <div className="checkout-form-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-gold)', fontSize: '0.88rem' }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-gold)', fontSize: '0.88rem' }}
                  />
                  <input
                    type="text"
                    required
                    maxLength="6"
                    placeholder="PIN Code"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-gold)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {/* 2. Configurable Shipping */}
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-teal)', marginBottom: '10px' }}>
                2. Select Insured Courier Speed
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: shippingMethod === 'standard' ? '2px solid var(--gold-accent)' : '1px solid var(--border-gold)',
                    background: shippingMethod === 'standard' ? 'var(--bg-pearl)' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-dark)' }}>
                        Free Insured Priority Delivery (3-5 Days)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#666' }}>
                        100% Transit Insured with Armoured Courier Partner (BlueDart / Sequel)
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.88rem' }}>FREE</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: shippingMethod === 'express' ? '2px solid var(--gold-accent)' : '1px solid var(--border-gold)',
                    background: shippingMethod === 'express' ? 'var(--bg-pearl)' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-dark)' }}>
                        Express Insured Air Transit (24-48 Hours)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#666' }}>
                        Next-flight priority courier with tamper-evident serial security
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--primary-teal)', fontSize: '0.88rem' }}>₹499</span>
                </label>
              </div>

              {/* 3. Payment Method */}
              <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-teal)', marginBottom: '10px' }}>
                3. Choose Verified Payment Method
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div
                  className={`payment-method-card ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('razorpay')}
                >
                  <CreditCard size={20} color="var(--gold-accent)" />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>Razorpay Online</div>
                    <div style={{ fontSize: '0.72rem', color: '#666' }}>UPI (GPay/PhonePe), Cards, NetBanking</div>
                  </div>
                </div>

                <div
                  className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  style={{
                    opacity: isCodAllowed ? 1 : 0.5,
                    cursor: isCodAllowed ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => {
                    if (isCodAllowed) {
                      setPaymentMethod('cod');
                    } else {
                      showToast?.(`COD unavailable for orders above ₹50,000 per Indian precious jewellery transport policy.`);
                    }
                  }}
                >
                  <ShieldCheck size={20} color="var(--gold-accent)" />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>Cash on Delivery</div>
                    <div style={{ fontSize: '0.72rem', color: '#666' }}>
                      {isCodAllowed ? 'Insured COD up to ₹50,000' : 'Exceeds ₹50k limit'}
                    </div>
                  </div>
                </div>
              </div>

              {!isCodAllowed && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.76rem',
                    color: '#92400e',
                    background: '#fffbeb',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '16px'
                  }}
                >
                  <Info size={14} />
                  <span>
                    Orders above ₹50,000 must be prepaid via Razorpay (Cards / UPI) per Indian AML and jewellery courier regulations.
                  </span>
                </div>
              )}
            </div>

            {/* Right Summary Card */}
            <div>
              <div
                style={{
                  background: 'var(--bg-pearl)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '10px',
                  padding: '20px'
                }}
              >
                <h4 style={{ fontSize: '1rem', color: 'var(--primary-teal)', marginBottom: '14px' }}>
                  Order Summary
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', maxHeight: '180px', overflowY: 'auto' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ color: '#777', fontSize: '0.74rem' }}>
                          Qty: {item.qty} × ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary-teal)' }}>
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-gold)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Subtotal</span>
                    <span>₹{calculatedTotals?.subtotal?.toLocaleString('en-IN') || 0}</span>
                  </div>

                  {calculatedTotals?.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-₹{calculatedTotals.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {isGiftWrapped && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#666' }}>Tamper-proof Royal Gift Wrap</span>
                      <span>₹250</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Jewellery GST (3% Standard)</span>
                    <span>₹{calculatedTotals?.tax?.toLocaleString('en-IN') || 0}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Insured Courier Transit</span>
                    <span>{calculatedTotals?.shippingFee > 0 ? `₹${calculatedTotals.shippingFee}` : 'FREE'}</span>
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid var(--border-gold)',
                      paddingTop: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: 'var(--primary-teal)'
                    }}
                  >
                    <span>Total Amount Payable</span>
                    <span>₹{calculatedTotals?.total?.toLocaleString('en-IN') || 0}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="teal-btn"
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1rem',
                    marginTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Lock size={16} />
                  <span>
                    {isProcessing
                      ? 'Verifying with Atelier...'
                      : paymentMethod === 'cod'
                      ? `Confirm COD Order (₹${calculatedTotals?.total?.toLocaleString('en-IN')})`
                      : `Pay with Razorpay (₹${calculatedTotals?.total?.toLocaleString('en-IN')})`}
                  </span>
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#888', marginTop: '12px' }}>
                  🔒 256-Bit SSL Encrypted • PCI-DSS Level 1 Compliant Gateway
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
