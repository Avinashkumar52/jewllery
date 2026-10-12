import React from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Package,
  Printer,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  order,
  onTrackOrder
}) {
  if (!isOpen || !order) return null;

  const items = order.items || order.order_items || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#f0fdf4',
              border: '2px solid #86efac',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}
          >
            <CheckCircle2 size={44} color="#16a34a" />
          </div>

          <span className="gold-badge">100% VERIFIED & TRANSIT INSURED</span>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-teal)', marginTop: '8px' }}>
            Order Confirmed!
          </h3>
          <p style={{ color: '#555', fontSize: '0.9rem', marginTop: '6px' }}>
            Thank you for selecting Kyaari Jewellery Atelier. Your official order receipt is ready.
          </p>
        </div>

        {/* Order Details Card */}
        <div
          style={{
            background: 'var(--bg-pearl)',
            border: '1px solid var(--border-gold)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-gold)',
              fontSize: '0.84rem'
            }}
          >
            <div>
              <span style={{ color: '#777', display: 'block', fontSize: '0.74rem' }}>Order Reference</span>
              <strong style={{ color: 'var(--primary-teal)', fontSize: '1rem' }}>
                #{order.order_number}
              </strong>
            </div>

            <div>
              <span style={{ color: '#777', display: 'block', fontSize: '0.74rem' }}>Payment Status</span>
              <strong style={{ color: order.payment_status === 'completed' ? '#16a34a' : '#b45309' }}>
                {order.payment_method === 'cod' ? 'Cash on Delivery (Pending)' : 'Verified & Insured (Paid)'}
              </strong>
            </div>

            <div>
              <span style={{ color: '#777', display: 'block', fontSize: '0.74rem' }}>Delivery To</span>
              <strong>{order.customer_name}</strong>
              <div style={{ fontSize: '0.76rem', color: '#666' }}>
                {order.shipping_address?.addressLine}, {order.shipping_address?.city} ({order.shipping_address?.pincode})
              </div>
            </div>

            <div>
              <span style={{ color: '#777', display: 'block', fontSize: '0.74rem' }}>Insured Logistics</span>
              <strong>{order.courier_partner || 'BlueDart Luxury Express'}</strong>
              <div style={{ fontSize: '0.76rem', color: '#666' }}>
                AWB: {order.tracking_number || 'BLUEDART-8829104'}
              </div>
            </div>
          </div>

          {/* Purchased Items */}
          <div style={{ paddingTop: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-teal)', marginBottom: '10px' }}>
              JEWELLERY ITEMS IN TRANSIT:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                  <img
                    src={it.image || it.product_image || '/everyday-gold.jpg'}
                    alt={it.name || it.product_name}
                    style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                      {it.name || it.product_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#777' }}>
                      Qty: {it.qty || it.quantity} • ₹{(it.unitPrice || it.unit_price || 0).toLocaleString('en-IN')} each
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-teal)' }}>
                    ₹{(it.totalPrice || it.total_price || (it.unitPrice || 0) * (it.qty || 1)).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-gold)',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '1.05rem',
                color: 'var(--primary-teal)'
              }}
            >
              <span>Total Paid / Payable</span>
              <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            className="teal-btn"
            style={{ padding: '12px 20px', fontSize: '0.9rem' }}
            onClick={onClose}
          >
            Continue Shopping
          </button>

          <button
            type="button"
            className="gold-outline-btn"
            style={{ padding: '12px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => {
              onClose();
              onTrackOrder?.(order.order_number);
            }}
          >
            <Truck size={16} /> Track Shipment
          </button>

          <button
            type="button"
            className="top-bar-ticker"
            style={{ padding: '12px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => window.print()}
            title="Print Tax Invoice"
          >
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
