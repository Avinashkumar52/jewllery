import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Package,
  Boxes,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  Search,
  Filter,
  Truck,
  RefreshCw,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import {
  fetchProducts,
  saveProduct,
  updateProductStock,
  deleteProduct,
  fetchAllOrdersForAdmin,
  updateOrderStatus
} from '../lib/supabase';

export default function AdminDashboardModal({
  isOpen,
  onClose,
  currentUser,
  showToast,
  onProductsUpdated
}) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    category: 'earrings',
    collection: 'everyday',
    pillar: '01. Everyday Gold Jewellery',
    price: 18000,
    mrp: 20000,
    metal: '18K Yellow Gold',
    karat: '18K',
    weight: '2.2 g',
    goldWeightGrams: 2.2,
    makingCharges: 1800,
    stockQuantity: 10,
    inStock: true,
    isSample: true,
    image: '/everyday-gold.jpg',
    description: 'Exquisite hallmarked jewellery crafted with precision by Kyaari Atelier.'
  });

  // Inline edit state
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockInputVal, setStockInputVal] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsData, ordersData] = await Promise.all([
        fetchProducts(),
        fetchAllOrdersForAdmin()
      ]);
      setProducts(prodsData || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (currentUser?.role !== 'admin') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '36px' }}>
          <AlertTriangle size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-teal)' }}>Restricted Atelier Access</h3>
          <p style={{ color: '#666', marginTop: '8px', fontSize: '0.9rem' }}>
            Only store administrators and atelier inventory managers are authorized to view this console.
          </p>
          <button className="teal-btn" onClick={onClose} style={{ marginTop: '20px', width: '100%' }}>
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  // Inventory Filtering
  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Inventory Stats
  const totalStockCount = products.reduce((acc, p) => acc + (p.stockQuantity ?? 10), 0);
  const lowStockCount = products.filter((p) => (p.stockQuantity ?? 10) < 5).length;
  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);

  // Handle Save Stock
  const handleSaveStock = async (productId) => {
    try {
      const newQty = Math.max(0, parseInt(stockInputVal, 10) || 0);
      await updateProductStock(productId, newQty, newQty > 0);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stockQuantity: newQty, inStock: newQty > 0 } : p))
      );
      setEditingStockId(null);
      showToast?.(`Inventory updated for ${productId}`);
      onProductsUpdated?.();
    } catch (err) {
      showToast?.(err.message || 'Failed to update stock');
    }
  };

  // Handle Toggle InStock
  const handleToggleInStock = async (product) => {
    try {
      const nextStatus = !product.inStock;
      const nextQty = nextStatus && product.stockQuantity === 0 ? 5 : product.stockQuantity;
      await updateProductStock(product.id, nextQty, nextStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: nextStatus, stockQuantity: nextQty } : p))
      );
      showToast?.(`Status changed for ${product.name}`);
      onProductsUpdated?.();
    } catch (err) {
      showToast?.('Failed to toggle stock status');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(`Are you sure you want to remove product ${productId} from the atelier catalog?`)) {
      return;
    }
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast?.(`Product removed from catalog.`);
      onProductsUpdated?.();
    } catch (err) {
      showToast?.(err.message || 'Error removing product.');
    }
  };

  // Handle Add Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const id = newProduct.id.trim() || 'kya-' + Math.random().toString(36).substring(2, 8);
      const productToSave = {
        ...newProduct,
        id,
        price: Number(newProduct.price),
        mrp: Number(newProduct.mrp),
        goldWeightGrams: Number(newProduct.goldWeightGrams),
        makingCharges: Number(newProduct.makingCharges),
        stockQuantity: Number(newProduct.stockQuantity),
        rating: 5.0,
        reviewsCount: 1,
        inStock: Number(newProduct.stockQuantity) > 0
      };

      await saveProduct(productToSave);
      setProducts((prev) => [productToSave, ...prev]);
      setShowAddModal(false);
      showToast?.(`Added '${productToSave.name}' to catalog!`);
      onProductsUpdated?.();
    } catch (err) {
      showToast?.(err.message || 'Failed to add product.');
    }
  };

  // Handle Order Status Change
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );
      showToast?.(`Order ${orderId} updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      showToast?.(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1080px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Admin Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="gold-badge">STORE ATELIER CONSOLE</span>
              <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>● Live Inventory Active</span>
            </div>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-teal)', marginTop: '4px' }}>
              Kyaari Maison Administration
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`top-bar-ticker ${activeTab === 'inventory' ? 'active' : ''}`}
              style={{ padding: '8px 16px', fontWeight: 700 }}
              onClick={() => setActiveTab('inventory')}
            >
              <Boxes size={16} /> Inventory ({products.length})
            </button>
            <button
              className={`top-bar-ticker ${activeTab === 'orders' ? 'active' : ''}`}
              style={{ padding: '8px 16px', fontWeight: 700 }}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={16} /> Orders ({orders.length})
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '24px'
          }}
        >
          <div style={{ background: 'var(--bg-pearl)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-gold)' }}>
            <div style={{ fontSize: '0.78rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Gross Revenue
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-teal)', marginTop: '4px' }}>
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'var(--bg-pearl)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-gold)' }}>
            <div style={{ fontSize: '0.78rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Orders Placed
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-teal)', marginTop: '4px' }}>
              {orders.length} Orders
            </div>
          </div>

          <div style={{ background: 'var(--bg-pearl)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-gold)' }}>
            <div style={{ fontSize: '0.78rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Vault Stock
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-teal)', marginTop: '4px' }}>
              {totalStockCount} units
            </div>
          </div>

          <div style={{ background: lowStockCount > 0 ? '#fef2f2' : 'var(--bg-pearl)', padding: '16px', borderRadius: '8px', border: '1px solid ' + (lowStockCount > 0 ? '#fca5a5' : 'var(--border-gold)') }}>
            <div style={{ fontSize: '0.78rem', color: lowStockCount > 0 ? '#991b1b' : '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Low Stock Alerts (&lt;5 units)
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: lowStockCount > 0 ? '#b91c1c' : 'var(--primary-teal)', marginTop: '4px' }}>
              {lowStockCount} items
            </div>
          </div>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div>
            {/* Filter and Action Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} color="#888" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    type="text"
                    placeholder="Search by jewellery title or SKU ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 32px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-gold)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-gold)',
                    fontSize: '0.85rem',
                    background: '#fff'
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="earrings">Earrings</option>
                  <option value="rings">Rings</option>
                  <option value="necklaces">Necklaces</option>
                  <option value="bangles">Bangles</option>
                  <option value="mangalsutra">Mangalsutra</option>
                  <option value="gifting">Gifting</option>
                </select>
              </div>

              <button
                className="teal-btn"
                style={{ fontSize: '0.85rem', padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} /> Add Jewellery Piece
              </button>
            </div>

            {/* Inventory Table */}
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-gold)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-pearl)', borderBottom: '1px solid var(--border-gold)', color: 'var(--primary-teal)' }}>
                    <th style={{ padding: '12px' }}>Product</th>
                    <th style={{ padding: '12px' }}>Purity & Weight</th>
                    <th style={{ padding: '12px' }}>Selling Price</th>
                    <th style={{ padding: '12px' }}>Vault Stock</th>
                    <th style={{ padding: '12px' }}>In Stock</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => {
                    const currentStock = prod.stockQuantity ?? 10;
                    const isLowStock = currentStock < 5;

                    return (
                      <tr key={prod.id} style={{ borderBottom: '1px solid #f3ece1' }}>
                        {/* Image & Title */}
                        <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={prod.image}
                            alt={prod.name}
                            style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-dark)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {prod.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#888' }}>
                              SKU: {prod.id} {prod.isSample && <span style={{ color: '#b45309', fontWeight: 600 }}>• [SAMPLE]</span>}
                            </div>
                          </div>
                        </td>

                        {/* Purity & Weight */}
                        <td style={{ padding: '12px' }}>
                          <div>{prod.karat} Gold</div>
                          <div style={{ fontSize: '0.74rem', color: '#666' }}>{prod.weight}</div>
                        </td>

                        {/* Price */}
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary-teal)' }}>
                          ₹{Number(prod.price).toLocaleString('en-IN')}
                        </td>

                        {/* Vault Stock Counter */}
                        <td style={{ padding: '12px' }}>
                          {editingStockId === prod.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="number"
                                min="0"
                                value={stockInputVal}
                                onChange={(e) => setStockInputVal(e.target.value)}
                                style={{ width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-gold)' }}
                              />
                              <button
                                className="teal-btn"
                                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                onClick={() => handleSaveStock(prod.id)}
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: isLowStock ? '#dc2626' : 'var(--text-dark)',
                                  background: isLowStock ? '#fee2e2' : 'transparent',
                                  padding: isLowStock ? '2px 6px' : '0',
                                  borderRadius: '4px'
                                }}
                              >
                                {currentStock} units
                              </span>
                              <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                                onClick={() => {
                                  setEditingStockId(prod.id);
                                  setStockInputVal(currentStock);
                                }}
                                title="Edit Stock Count"
                              >
                                <Edit2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* In Stock Toggle */}
                        <td style={{ padding: '12px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleInStock(prod)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              border: 'none',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              background: prod.inStock ? '#dcfce7' : '#fee2e2',
                              color: prod.inStock ? '#166534' : '#991b1b'
                            }}
                          >
                            {prod.inStock ? 'ACTIVE' : 'OUT OF STOCK'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button
                            type="button"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                            onClick={() => handleDeleteProduct(prod.id)}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-gold)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-pearl)', borderBottom: '1px solid var(--border-gold)', color: 'var(--primary-teal)' }}>
                    <th style={{ padding: '12px' }}>Order #</th>
                    <th style={{ padding: '12px' }}>Patron Info</th>
                    <th style={{ padding: '12px' }}>Amount</th>
                    <th style={{ padding: '12px' }}>Payment</th>
                    <th style={{ padding: '12px' }}>Fulfillment Status</th>
                    <th style={{ padding: '12px' }}>Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                        No orders recorded in maison database.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid #f3ece1' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary-teal)' }}>
                          #{ord.order_number}
                          <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 400 }}>
                            {new Date(ord.created_at).toLocaleDateString('en-IN')}
                          </div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600 }}>{ord.customer_name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#666' }}>{ord.customer_email}</div>
                          <div style={{ fontSize: '0.74rem', color: '#666' }}>{ord.customer_phone}</div>
                        </td>

                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--primary-teal)' }}>
                          ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                        </td>

                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '8px',
                              background: ord.payment_method === 'cod' ? '#fef3c7' : '#ecfdf5',
                              color: ord.payment_method === 'cod' ? '#92400e' : '#065f46'
                            }}
                          >
                            {ord.payment_method?.toUpperCase()}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '2px' }}>
                            {ord.payment_status?.toUpperCase()}
                          </div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <select
                            value={ord.order_status || 'confirmed'}
                            onChange={(e) => handleOrderStatusUpdate(ord.id, e.target.value)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--border-gold)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              background: '#fff'
                            }}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td style={{ padding: '12px', fontSize: '0.76rem', color: '#555' }}>
                          <div>{ord.courier_partner || 'BlueDart'}</div>
                          <div style={{ fontWeight: 600 }}>{ord.tracking_number || 'BLUEDART-8829104'}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW PRODUCT */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '580px', padding: '28px' }}
            >
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>

              <h4 style={{ fontSize: '1.3rem', color: 'var(--primary-teal)', marginBottom: '14px' }}>
                Add New Jewellery Piece to Atelier
              </h4>

              <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Jewellery Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kyaari 22K Royal Temple Peacock Choker"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-gold)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Category
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-gold)' }}
                    >
                      <option value="earrings">Earrings & Studs</option>
                      <option value="rings">Finger Rings & Bands</option>
                      <option value="necklaces">Necklaces & Chains</option>
                      <option value="bangles">Bangles & Bracelets</option>
                      <option value="mangalsutra">Mangalsutras</option>
                      <option value="gifting">Jewellery Gifts</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Collection Pillar
                    </label>
                    <select
                      value={newProduct.collection}
                      onChange={(e) => setNewProduct({ ...newProduct, collection: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-gold)' }}
                    >
                      <option value="everyday">Everyday Gold</option>
                      <option value="traditional">Traditional & Festive</option>
                      <option value="bridal">Bridal & Wedding</option>
                      <option value="engagement">Engagement & Solitaires</option>
                      <option value="gifting">Jewellery Gifts</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-gold)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      MRP (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={newProduct.mrp}
                      onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-gold)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      required
                      value={newProduct.stockQuantity}
                      onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-gold)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Gold Karat
                    </label>
                    <select
                      value={newProduct.karat}
                      onChange={(e) => setNewProduct({ ...newProduct, karat: e.target.value, metal: `${e.target.value} Yellow Gold` })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-gold)' }}
                    >
                      <option value="18K">18K Gold (Hallmark 750)</option>
                      <option value="22K">22K Gold (Hallmark 916)</option>
                      <option value="24K">24K Pure Gold (999 Purity)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Gold Weight (Grams)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newProduct.goldWeightGrams}
                      onChange={(e) => setNewProduct({ ...newProduct, goldWeightGrams: e.target.value, weight: `${e.target.value} g` })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-gold)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Image URL or Path
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-gold)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="teal-btn" style={{ flex: 1, padding: '10px' }}>
                    Save & Publish to Store
                  </button>
                  <button type="button" className="gold-outline-btn" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
