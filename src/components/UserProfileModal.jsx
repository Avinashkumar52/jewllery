import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  ShieldCheck,
  LogOut,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { fetchCustomerOrders, signOutUser } from '../lib/supabase';

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSignOut,
  onOpenAdmin,
  onTrackOrder
}) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadOrders();
    }
  }, [isOpen, currentUser]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchCustomerOrders(currentUser.email, currentUser.id);
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return { color: '#0369a1', bg: '#e0f2fe', label: 'Order Confirmed' };
      case 'processing':
        return { color: '#b45309', bg: '#fef3c7', label: 'In Atelier Processing' };
      case 'shipped':
        return { color: '#4338ca', bg: '#e0e7ff', label: 'Dispatched via BlueDart' };
      case 'delivered':
        return { color: '#15803d', bg: '#dcfce7', label: 'Delivered' };
      default:
        return { color: '#374151', bg: '#f3f4f6', label: status || 'Processing' };
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto', padding: '32px' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Profile Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-gold)',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--teal-gradient)',
                color: 'var(--gold-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 700,
                border: '2px solid var(--gold-accent)'
              }}
            >
              {currentUser.full_name?.charAt(0)?.toUpperCase() || 'K'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-teal)', margin: 0 }}>
                  {currentUser.full_name || 'Valued Patron'}
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: currentUser.role === 'admin' ? '#fef3c7' : '#ecfdf5',
                    color: currentUser.role === 'admin' ? '#92400e' : '#065f46',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  {currentUser.role === 'admin' ? 'Atelier Admin' : 'VIP Patron'}
                </span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#666', marginTop: '2px' }}>
                {currentUser.email} • {currentUser.phone || '+91 Verified'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentUser.role === 'admin' && (
              <button
                type="button"
                className="teal-btn"
                style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                onClick={() => {
                  onClose();
                  onOpenAdmin?.();
                }}
              >
                <ShieldCheck size={15} /> Admin Atelier
              </button>
            )}
            <button
              type="button"
              className="gold-outline-btn"
              style={{ fontSize: '0.8rem', padding: '8px 12px' }}
              onClick={async () => {
                await signOutUser();
                onSignOut?.();
                onClose();
              }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        {/* Order History Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-teal)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} color="var(--gold-accent)" />
              <span>Insured Orders History</span>
            </h4>
            <span style={{ fontSize: '0.82rem', color: '#666' }}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
            </span>
          </div>

          {loadingOrders ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#888' }}>
              Loading order records from maison archive...
            </div>
          ) : orders.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: 'var(--bg-pearl)',
                borderRadius: '8px',
                border: '1px dashed var(--border-gold)'
              }}
            >
              <ShoppingBag size={40} color="var(--gold-accent)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600, color: 'var(--primary-teal)', fontSize: '1rem' }}>
                No Orders Placed Yet
              </p>
              <p style={{ fontSize: '0.85rem', color: '#777', maxWidth: '360px', margin: '4px auto 16px' }}>
                Explore our everyday 18K gold collection, bridal sets, and solitaires with 100% transit insurance.
              </p>
              <button className="teal-btn" onClick={onClose} style={{ fontSize: '0.85rem', padding: '10px 18px' }}>
                Discover Jewellery Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {orders.map((ord) => {
                const badge = getStatusBadge(ord.order_status);
                const isExpanded = expandedOrderId === ord.id;
                const itemsList = ord.items || ord.order_items || [];

                return (
                  <div
                    key={ord.id}
                    style={{
                      border: '1px solid var(--border-gold)',
                      borderRadius: '8px',
                      background: '#fff',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Order summary row */}
                    <div
                      style={{
                        padding: '16px',
                        background: 'var(--bg-pearl)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-teal)', fontSize: '0.96rem' }}>
                            #{ord.order_number}
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: badge.bg,
                              color: badge.color
                            }}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '4px' }}>
                          Placed on {new Date(ord.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {itemsList.length} items • {ord.payment_method?.toUpperCase()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: 'var(--primary-teal)', fontSize: '1rem' }}>
                            ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                            100% Transit Insured
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={18} color="#666" /> : <ChevronDown size={18} color="#666" />}
                      </div>
                    </div>

                    {/* Expandable items and shipping info */}
                    {isExpanded && (
                      <div style={{ padding: '16px', borderTop: '1px solid #f0eae1' }}>
                        {/* Courier and tracking details */}
                        <div
                          style={{
                            background: '#f8fafc',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '14px',
                            fontSize: '0.82rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={16} color="var(--primary-teal)" />
                            <span>
                              Courier: <strong>{ord.courier_partner || 'BlueDart Luxury Express'}</strong> (AWB: {ord.tracking_number || 'BLUEDART-TRANSIT'})
                            </span>
                          </div>
                          <button
                            type="button"
                            className="top-bar-ticker"
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                            onClick={() => {
                              onClose();
                              onTrackOrder?.(ord.order_number);
                            }}
                          >
                            Live Tracking
                          </button>
                        </div>

                        {/* Items list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {itemsList.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                paddingBottom: '10px',
                                borderBottom: idx < itemsList.length - 1 ? '1px solid #f3ede2' : 'none'
                              }}
                            >
                              <img
                                src={item.image || item.product_image || '/everyday-gold.jpg'}
                                alt={item.name || item.product_name}
                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                                  {item.name || item.product_name}
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#777' }}>
                                  Qty: {item.qty || item.quantity} • Unit: ₹{(item.unitPrice || item.unit_price || 0).toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-teal)' }}>
                                ₹{((item.totalPrice || item.total_price || (item.unitPrice || 0) * (item.qty || 1))).toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
