import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  MapPin,
  Sparkles,
  Calculator,
  ShieldCheck,
  RefreshCw,
  Truck,
  Star,
  X,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Eye,
  SlidersHorizontal,
  PhoneCall,
  Calendar,
  Award,
  CheckCircle2,
  Percent,
  Tag,
  Gift,
  CreditCard,
  Building,
  QrCode,
  PackageCheck,
  Clock,
  Filter,
  User,
  Home,
  Compass
} from 'lucide-react';
import './App.css';
import { LIVE_RATES, CATEGORIES, COLLECTIONS, PRODUCTS, REVIEWS, STORES } from './data/products';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import ProductDetailModal from './components/ProductDetailModal';
import CheckoutModal from './components/CheckoutModal';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import { fetchProducts, getCurrentUser } from './lib/supabase';
import { validateAndCalculateOrder, STORE_POLICIES } from './lib/validation';

export default function App() {
  // Live Products & Auth State
  const [productsList, setProductsList] = useState(PRODUCTS);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('standard');

  // Load products from Supabase / Local Store on mount
  useEffect(() => {
    fetchProducts()
      .then((data) => {
        if (data && data.length > 0) {
          setProductsList(data);
        }
      })
      .catch((err) => console.error('Failed to load products:', err));
  }, []);

  // State Management
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeCollection, setActiveCollection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('kyaari_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('kyaari_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save Cart & Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kyaari_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('kyaari_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // E-Commerce Filters State
  const [priceRange, setPriceRange] = useState('all');
  const [metalFilter, setMetalFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Modals & Drawers State
  const [showGoldCalcModal, setShowGoldCalcModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [showTrackOrderModal, setShowTrackOrderModal] = useState(false);
  const [trackInput, setTrackInput] = useState('KYA-784920');
  const [trackStatus, setTrackStatus] = useState(null);

  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [tryOnMetal, setTryOnMetal] = useState('Yellow Gold');
  const [tryOnGem, setTryOnGem] = useState('Diamond');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState('');

  // Hero Carousel Index
  const [heroIndex, setHeroIndex] = useState(0);

  // Gold Calculator State
  const [calcGrams, setCalcGrams] = useState(10);
  const [calcKarat, setCalcKarat] = useState('22k');


  // Hero Banners Data - Curated Product Collections
  const HERO_SLIDES = [
    {
      id: 1,
      subtitle: 'Collection 01 / Everyday Gold',
      title: 'Lightweight 18K Gold Crafted for Everyday Life',
      desc: 'Featherlight studs, sleek hoops, delicate chains, and slim bracelets designed for college, work, and effortless daily styling.',
      image: '/everyday-gold.jpg',
      badge: 'DAILY ESSENTIALS',
      collectionId: 'everyday'
    },
    {
      id: 2,
      subtitle: 'Collection 02 / Heritage and Festive',
      title: 'Timeless Temple Artistry and Heritage Kundan',
      desc: 'Handcrafted antique-finish necklaces, royal jhumkas, sacred mangalsutras, and filigree bangles for festive celebrations.',
      image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1600&q=80',
      badge: 'HERITAGE & FESTIVE',
      collectionId: 'traditional'
    },
    {
      id: 3,
      subtitle: 'Collection 03 / Bridal and Wedding',
      title: "Bridal Masterpieces in 22K Gold and Polki Diamonds",
      desc: 'Opulent bridal necklace sets, uncut polki designs, emerald-accented creations, and coordinated wedding heirlooms.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80',
      badge: 'ROYAL BRIDAL',
      collectionId: 'bridal'
    },
    {
      id: 4,
      subtitle: 'Collection 04 / Solitaires and Engagement',
      title: 'Certified Solitaires and Custom Handcrafted Bands',
      desc: 'Certified natural diamond engagement rings, eternity wedding bands, and gemstone creations crafted for milestone moments.',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80',
      badge: 'CERTIFIED SOLITAIRES',
      collectionId: 'engagement'
    },
    {
      id: 5,
      subtitle: 'Collection 05 / Keepsakes and Gifting',
      title: 'Pure 24K Gold Coins and Ready Gift Keepsakes',
      desc: 'Swiss-assay certified pure 24K gold coins, baby nazariya bangles, anniversary couple rings, and ribboned gift presentations.',
      image: '/kyaari-gift-box.jpg',
      badge: 'READY TO GIFT',
      collectionId: 'gifting'
    }
  ];

  // Auto Hero Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [HERO_SLIDES.length]);

  // Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Cart Actions
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + quantity } : item
        );
      }
      return [...prevCart, { ...product, qty: quantity }];
    });
    showToast(`Added "${product.name}" to your Shopping Bag!`);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Wishlist Action
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        showToast(`Removed from Wishlist`);
        return prev.filter((item) => item.id !== product.id);
      } else {
        showToast(`Saved "${product.name}" to Wishlist!`);
        return [...prev, product];
      }
    });
  };

  // Apply Promo Coupon
  const applyCouponCode = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (code === 'KYAARIGOLD' || code === 'TANISHQGOLD') {
      setAppliedCoupon({ code: 'KYAARIGOLD', discount: 15000, desc: '10% Off Making Charges' });
      showToast('Coupon "KYAARIGOLD" applied! ₹15,000 saved.');
    } else if (code === 'DIAMOND10') {
      setAppliedCoupon({ code: 'DIAMOND10', discount: 25000, desc: 'Solitaire Special Discount' });
      showToast('Coupon "DIAMOND10" applied! ₹25,000 saved.');
    } else {
      showToast('Invalid Coupon Code. Try KYAARIGOLD or DIAMOND10.');
    }
  };

  // Advanced Filtering & Sorting Logic
  const filteredProducts = productsList.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesCollection = activeCollection === 'all' || p.collection === activeCollection;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.metal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Price Range Filter
    let matchesPrice = true;
    if (priceRange === 'under-50k') matchesPrice = p.price < 50000;
    else if (priceRange === '50k-150k') matchesPrice = p.price >= 50000 && p.price <= 150000;
    else if (priceRange === '150k-300k') matchesPrice = p.price > 150000 && p.price <= 300000;
    else if (priceRange === '300k-plus') matchesPrice = p.price > 300000;

    // Metal Purity Filter
    let matchesMetal = true;
    if (metalFilter === '22k') matchesMetal = p.karat === '22K';
    else if (metalFilter === '18k') matchesMetal = p.karat === '18K';
    else if (metalFilter === '24k') matchesMetal = p.karat === '24K';

    return matchesCategory && matchesCollection && matchesSearch && matchesPrice && matchesMetal;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'discount') return (b.mrp - b.price) - (a.mrp - a.price);
    return 0; // Default featured
  });

  // Calculate Authoritative Cart Totals via Validation Engine
  const orderBreakdown = validateAndCalculateOrder({
    items: cart.map((item) => ({ id: item.id, qty: item.qty })),
    couponCode: appliedCoupon?.code,
    isGiftWrapped,
    shippingMethod,
    paymentMethod,
    catalog: productsList
  });

  const cartSubtotal = orderBreakdown.subtotal;
  const couponDiscount = orderBreakdown.discount;
  const giftWrapFee = orderBreakdown.giftWrapFee;
  const estimatedTax = orderBreakdown.tax;
  const shippingFee = orderBreakdown.shippingFee;
  const cartTotal = orderBreakdown.total;

  // Gold Calculator Calculations
  const calculatedGoldRate = calcKarat === '22k' ? LIVE_RATES.gold22k : LIVE_RATES.gold24k;
  const calculatedGoldBase = Math.round(calcGrams * calculatedGoldRate);
  const calculatedMakingCharges = Math.round(calculatedGoldBase * 0.12);
  const calculatedGST = Math.round((calculatedGoldBase + calculatedMakingCharges) * 0.03);
  const calculatedTotal = calculatedGoldBase + calculatedMakingCharges + calculatedGST;

  // Handle Pincode Check
  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.length >= 6) {
      setPincodeStatus({
        valid: true,
        message: 'Available! Free Insured Courier Delivery by Tomorrow, 5:00 PM.'
      });
    } else {
      setPincodeStatus({
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code.'
      });
    }
  };

  // Handle Track Order
  const handleTrackOrder = (e, orderIdToTrack) => {
    if (e && e.preventDefault) e.preventDefault();
    const idToLook = (orderIdToTrack || trackInput).trim().toUpperCase();
    setTrackInput(idToLook);

    try {
      const ordersInDb = JSON.parse(localStorage.getItem('kyaari_orders_db') || '[]');
      const found = ordersInDb.find(
        (o) => o.order_number?.toUpperCase() === idToLook || o.id?.toUpperCase() === idToLook
      );
      if (found) {
        setTrackStatus({
          orderId: found.order_number,
          status:
            found.order_status === 'delivered'
              ? 'Delivered to Patron'
              : found.order_status === 'shipped'
              ? 'Dispatched & In Transit - Express Insured Courier'
              : 'Processing in Atelier Vault',
          expectedDelivery: '2-3 Business Days (100% Insured)',
          currentLocation: `${found.courier_partner || 'BlueDart Luxury Air Logistics'} (AWB: ${found.tracking_number || 'BLUEDART-8829104'})`,
          stepsCompleted: found.order_status === 'delivered' ? 4 : found.order_status === 'shipped' ? 3 : 2
        });
        setShowTrackOrderModal(true);
        return;
      }
    } catch (err) {}

    setTrackStatus({
      orderId: idToLook,
      status: 'In Transit - Express Insured Courier',
      expectedDelivery: 'Tomorrow, 2:00 PM - 5:00 PM',
      currentLocation: 'Hub 04 (Bandra Logistics, Mumbai)',
      stepsCompleted: 3
    });
    setShowTrackOrderModal(true);
  };

  return (
    <div className="kyaari-app">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--primary-teal)',
            color: '#fef3c7',
            padding: '14px 24px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid var(--gold-accent)',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <Sparkles size={18} color="var(--gold-accent)" />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{toastMessage}</span>
        </div>
      )}

      {/* 0. PROMO OFFER TICKER BAR */}
      <div className="promo-banner-bar">
        <Tag size={14} color="#fde047" />
        <span>FESTIVE EXCLUSIVE: Use Code</span>
        <span className="promo-code-badge" onClick={() => applyCouponCode('KYAARIGOLD')}>
          KYAARIGOLD
        </span>
        <span>for ₹15,000 OFF Making Charges | Or</span>
        <span className="promo-code-badge" onClick={() => applyCouponCode('DIAMOND10')}>
          DIAMOND10
        </span>
        <span>for Solitaire Discounts!</span>
      </div>

      {/* 1. TOP ANNOUNCEMENT & LIVE GOLD RATE BAR */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="top-bar-ticker" onClick={() => setShowGoldCalcModal(true)}>
            <Sparkles size={14} color="#facc15" />
            <span>
              LIVE GOLD RATE: 22K ₹{LIVE_RATES.gold22k.toLocaleString('en-IN')}/g | 24K ₹
              {LIVE_RATES.gold24k.toLocaleString('en-IN')}/g
            </span>
            <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>({LIVE_RATES.change})</span>
          </div>

          <span style={{ opacity: 0.5, color: '#f7e6b8' }} className="desktop-only">
            |
          </span>

          <button className="top-bar-link desktop-only" onClick={() => setShowPincodeModal(true)}>
            <Truck size={14} />
            <span>Delivery PIN: {pincodeStatus?.valid ? pincode : 'Check Express Delivery'}</span>
          </button>
        </div>

        <div className="top-bar-right">
          {currentUser?.role === 'admin' && (
            <button
              className="top-bar-link"
              style={{ color: '#fde047', fontWeight: 700 }}
              onClick={() => setShowAdminModal(true)}
            >
              <ShieldCheck size={14} color="#fde047" />
              <span>Atelier Admin</span>
            </button>
          )}

          <button
            className="top-bar-link"
            onClick={() => (currentUser ? setShowUserProfileModal(true) : setShowAuthModal(true))}
          >
            <User size={14} />
            <span>{currentUser ? `${currentUser.full_name?.split(' ')[0]} (Account)` : 'Sign In / Register'}</span>
          </button>

          <button className="top-bar-link" onClick={() => setShowTrackOrderModal(true)}>
            <PackageCheck size={14} />
            <span>Track Order</span>
          </button>

          <button className="top-bar-link" onClick={() => setShowStoreModal(true)}>
            <MapPin size={14} />
            <span>Find Showroom</span>
          </button>

          <button className="top-bar-link" onClick={() => setShowGoldCalcModal(true)}>
            <Calculator size={14} />
            <span>Gold Rate Calculator</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN BRAND HEADER */}
      <header className="main-header">
        <div className="header-container">
          {/* Logo */}
          <a href="#" className="brand-logo">
            <img 
              src="/kyaari-logo.jpg" 
              alt="Kyaari Jewellery Logo" 
              className="brand-logo-img" 
            />
            <div className="brand-logo-text">
              <span className="brand-title">KYAARI</span>
              <span className="brand-subtitle">JEWELLERY</span>
            </div>
          </a>

          {/* Instant Search Bar */}
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search size={18} color="var(--primary-teal)" />
              <input
                type="text"
                className="search-input"
                placeholder="Search gold necklaces, solitaire rings, Mia, Rivaah bridal..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(e.target.value.length > 0);
                }}
                onFocus={() => searchQuery.length > 0 && setShowSearchDropdown(true)}
              />
              {searchQuery && (
                <X
                  size={16}
                  style={{ cursor: 'pointer', color: '#999' }}
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                />
              )}
            </div>

            {/* Live Autocomplete Dropdown */}
            {showSearchDropdown && (
              <div className="search-dropdown">
                {filteredProducts.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id}
                    className="search-dropdown-item"
                    onClick={() => {
                      setSelectedProductDetail(prod);
                      setShowSearchDropdown(false);
                    }}
                  >
                    <img src={prod.image} alt={prod.name} className="search-dropdown-thumb" />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          color: 'var(--text-dark)'
                        }}
                      >
                        {prod.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>
                        {prod.metal} • {prod.karat}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary-teal)' }}>
                      ₹{prod.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#888' }}>
                    No matching jewellery pieces found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="header-actions">
            {currentUser?.role === 'admin' && (
              <button
                className="header-action-btn"
                onClick={() => setShowAdminModal(true)}
                title="Atelier Admin Console"
              >
                <ShieldCheck size={22} color="var(--gold-accent)" />
                <span style={{ color: 'var(--gold-accent)', fontWeight: 700 }}>Admin</span>
              </button>
            )}

            <button
              className="header-action-btn"
              onClick={() => (currentUser ? setShowUserProfileModal(true) : setShowAuthModal(true))}
              title={currentUser ? 'Customer Account' : 'Sign In to Maison'}
            >
              <User size={22} />
              <span>{currentUser ? currentUser.full_name?.split(' ')[0] || 'Account' : 'Sign In'}</span>
            </button>

            <button
              className="header-action-btn"
              onClick={() => setShowTrackOrderModal(true)}
              title="Track Active Order"
            >
              <PackageCheck size={22} />
              <span>Track Order</span>
            </button>

            <button
              className="header-action-btn"
              onClick={() => setIsWishlistOpen(true)}
              title="Saved Items"
            >
              <Heart size={22} />
              <span>Wishlist</span>
              {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
            </button>

            <button
              className="header-action-btn"
              onClick={() => setIsCartOpen(true)}
              title="Shopping Bag"
            >
              <ShoppingBag size={22} />
              <span>Bag</span>
              {cart.length > 0 && (
                <span className="badge-count">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 3. CORE PRODUCT PILLARS & CATEGORY NAVIGATION BAR */}
        <nav className="category-navbar">
          <div className="category-nav-container">
            <button
              className={`category-nav-item ${activeCollection === 'all' && activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => {
                setActiveCollection('all');
                setActiveCategory('all');
              }}
            >
              All Jewellery
            </button>

            {COLLECTIONS.map((col) => (
              <button
                key={col.id}
                className={`category-nav-item ${activeCollection === col.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveCollection(col.id);
                  setActiveCategory('all');
                  const catEl = document.getElementById('catalog');
                  if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {col.isPriority && <Sparkles size={14} color="var(--gold-accent)" />}
                {col.name}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* 4. HERO SECTION WITH CINEMATIC BACKGROUND VIDEO */}
      <section className="hero-section">
        {/* Background Video Player */}
        <div className="hero-video-wrapper">
          <video
            className="hero-bg-video"
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=80"
          >
            <source src="/kyaari-hero-video.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>

        {/* Hero Slide Typography & Actions */}
        {HERO_SLIDES.map((slide, idx) => (
          <div key={slide.id} className={`hero-slide ${idx === heroIndex ? 'active' : ''}`}>
            <div className="hero-content">
              <span className="gold-badge" style={{ marginBottom: '16px' }}>
                {slide.badge}
              </span>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-desc">{slide.desc}</p>
              <div className="hero-actions">
                <a
                  href="#catalog"
                  className="teal-btn"
                  onClick={() => {
                    setActiveCollection(slide.collectionId || 'all');
                    setActiveCategory('all');
                  }}
                >
                  Explore Collection <ChevronRight size={18} />
                </a>
                <button
                  type="button"
                  className="gold-outline-btn"
                  style={{ color: '#ffffff', borderColor: 'var(--gold-accent)' }}
                  onClick={() => setTryOnProduct(PRODUCTS[0])}
                >
                  <Eye size={18} /> Try On Virtually
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <div
              key={i}
              className={`hero-dot ${i === heroIndex ? 'active' : ''}`}
              onClick={() => setHeroIndex(i)}
            />
          ))}
        </div>
      </section>

      {/* 5. TRUST BADGES ROW */}
      <div className="trust-badges-bar">
        <div className="trust-badges-grid">
          <div className="trust-badge-item">
            <Award size={26} color="var(--primary-teal)" />
            <div>
              <h5>100% Certified Gold</h5>
              <p>BIS 916 Hallmark Purity Guaranteed</p>
            </div>
          </div>

          <div className="trust-badge-item">
            <RefreshCw size={26} color="var(--primary-teal)" />
            <div>
              <h5>100% Exchange Value</h5>
              <p>Exchange Old Gold for New Designs</p>
            </div>
          </div>

          <div className="trust-badge-item">
            <Truck size={26} color="var(--primary-teal)" />
            <div>
              <h5>Free Insured Shipping</h5>
              <p>Tamper-proof transit insurance across India</p>
            </div>
          </div>

          <div className="trust-badge-item">
            <ShieldCheck size={26} color="var(--primary-teal)" />
            <div>
              <h5>Kyaari Guarantee</h5>
              <p>Complete transparency in making charges</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. CATEGORIES SHOWCASE GRID */}
      <section className="section-padding">
        <div className="section-header">
          <p className="section-subhead">DISCOVER LUXURY</p>
          <h2 className="section-title">Shop Jewellery By Category</h2>
          <div className="section-divider"></div>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              onClick={() => {
                setActiveCategory(cat.id);
                document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <div className="category-card-img-wrapper">
                <img src={cat.image} alt={cat.name} className="category-card-img" />
              </div>
              <div className="category-card-body">
                <h3 className="category-card-title">{cat.name}</h3>
                <p className="category-card-subtitle">{cat.subtitle}</p>
                <span className="category-card-count">
                  {cat.count} <span className="category-arrow">→</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. LIVE GOLD RATE & CALCULATOR WIDGET */}
      <section className="gold-calculator-section">
        <div className="gold-calc-container">
          <div>
            <span className="gold-badge">TRANSPARENT PRICING</span>
            <h2
              style={{
                fontSize: '2.2rem',
                margin: '12px 0',
                color: 'var(--primary-teal)'
              }}
            >
              Calculate Your Gold Value Instantly
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.98rem' }}>
              At Kyaari Jewellery, we believe in 100% transparency. Check live daily gold bullion rates and calculate your exact jewellery estimate including gold weight, making charges, and taxes.
            </p>

            <div className="gold-rate-pill-grid">
              <div className="gold-rate-pill">
                <h5>22K GOLD RATE</h5>
                <div className="price">₹{LIVE_RATES.gold22k.toLocaleString('en-IN')}/g</div>
              </div>
              <div className="gold-rate-pill">
                <h5>24K PURE GOLD</h5>
                <div className="price">₹{LIVE_RATES.gold24k.toLocaleString('en-IN')}/g</div>
              </div>
              <div className="gold-rate-pill">
                <h5>PLATINUM</h5>
                <div className="price">₹{LIVE_RATES.platinum.toLocaleString('en-IN')}/g</div>
              </div>
            </div>
          </div>

          <div className="gold-calc-card">
            <h3
              style={{
                fontSize: '1.25rem',
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Calculator color="var(--gold-accent)" />
              Smart Gold Jewellery Estimator
            </h3>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#666',
                    display: 'block',
                    marginBottom: '4px'
                  }}
                >
                  Purity Level
                </label>
                <select
                  value={calcKarat}
                  onChange={(e) => setCalcKarat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-gold)',
                    background: '#ffffff',
                    fontWeight: 600
                  }}
                >
                  <option value="22k">22 Karat (91.6% Pure)</option>
                  <option value="24k">24 Karat (99.9% Pure)</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#666',
                    display: 'block',
                    marginBottom: '4px'
                  }}
                >
                  Weight (in Grams)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={calcGrams}
                  onChange={(e) => setCalcGrams(Math.max(1, Number(e.target.value)))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-gold)',
                    fontWeight: 600
                  }}
                />
              </div>
            </div>

            <div
              style={{
                background: '#faf6ee',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.88rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Gold Value:</span>
                <span style={{ fontWeight: 600 }}>₹{calculatedGoldBase.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Making Charges (~12%):</span>
                <span style={{ fontWeight: 600 }}>₹{calculatedMakingCharges.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>GST (3%):</span>
                <span style={{ fontWeight: 600 }}>₹{calculatedGST.toLocaleString('en-IN')}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  borderTop: '1px solid #e0d0ae',
                  paddingTop: '8px',
                  marginTop: '4px',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: 'var(--primary-teal)'
                }}
              >
                <span>Estimated Total:</span>
                <span>₹{calculatedTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MAIN E-COMMERCE PRODUCTS CATALOG WITH SIDEBAR FILTERS */}
      <section className="section-padding" id="catalog">
        <div className="catalog-container">
          {/* 5 Core Product Pillars Showcase Tabs */}
          <div className="pillars-tabs-bar">
            <button
              className={`pillar-tab-btn ${activeCollection === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCollection('all')}
            >
              <span className="pillar-num-tag">✦</span>
              <span className="pillar-tab-title">All Collections</span>
              <span className="pillar-tab-badge">{PRODUCTS.length}</span>
            </button>
            {COLLECTIONS.map((col) => {
              const colCount = PRODUCTS.filter((p) => p.collection === col.id).length;
              return (
                <button
                  key={col.id}
                  className={`pillar-tab-btn ${activeCollection === col.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCollection(activeCollection === col.id ? 'all' : col.id);
                  }}
                >
                  <span className="pillar-num-tag">{col.num}</span>
                  <span className="pillar-tab-title">{col.name}</span>
                  <span className="pillar-tab-badge">{colCount}</span>
                </button>
              );
            })}
          </div>

          {/* Controls Bar: Search summary, Filter pills & Sort Dropdown */}
          <div className="ecommerce-controls-bar">
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-teal)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {activeCollection !== 'all'
                  ? COLLECTIONS.find((c) => c.id === activeCollection)?.name
                  : activeCategory !== 'all'
                  ? CATEGORIES.find((c) => c.id === activeCategory)?.name
                  : 'All Fine Jewellery'}
                <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 400 }}>
                  ({filteredProducts.length} Designs Available)
                </span>
                {activeCollection !== 'all' && (
                  <button
                    onClick={() => setActiveCollection('all')}
                    style={{ fontSize: '0.78rem', color: 'var(--gold-accent-dark)', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    View All Collections
                  </button>
                )}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="mobile-filter-trigger-btn"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <Filter size={15} />
                <span>Filters</span>
                {(priceRange !== 'all' || metalFilter !== 'all' || activeCollection !== 'all' || activeCategory !== 'all') && (
                  <span className="mobile-filter-active-dot" />
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>
                  Sort:
                </label>
                <select
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="featured">Featured Designs</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="discount">Biggest Savings</option>
                </select>
              </div>
            </div>
          </div>

          <div className="ecommerce-catalog-layout">
            {/* Mobile Filter Overlay */}
            {isMobileFilterOpen && (
              <div
                className="mobile-filter-overlay"
                onClick={() => setIsMobileFilterOpen(false)}
              />
            )}

            {/* E-Commerce Filter Sidebar */}
            <aside className={`filter-sidebar ${isMobileFilterOpen ? 'mobile-open' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1.5px solid var(--border-silver)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Filter size={16} color="var(--primary-teal)" />
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-teal)', fontWeight: 700 }}>Filter Catalogue</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {(priceRange !== 'all' || metalFilter !== 'all' || activeCollection !== 'all' || activeCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setPriceRange('all');
                        setMetalFilter('all');
                        setActiveCategory('all');
                        setActiveCollection('all');
                        setSortBy('featured');
                      }}
                      style={{ fontSize: '0.74rem', color: 'var(--gold-accent-dark)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    className="mobile-filter-close-btn"
                    onClick={() => setIsMobileFilterOpen(false)}
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Product Collections Pillar Filter */}
              <div className="filter-group">
                <div className="filter-group-title">
                  <span>Collections</span>
                </div>
                {[
                  { id: 'all', label: 'All Collections' },
                  ...COLLECTIONS.map((c) => ({ id: c.id, label: `${c.num}. ${c.name}` }))
                ].map((col) => (
                  <label key={col.id} className={`filter-option-label ${activeCollection === col.id ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="collectionFilter"
                      checked={activeCollection === col.id}
                      onChange={() => setActiveCollection(col.id)}
                    />
                    <span className="filter-radio-indicator" />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>

              {/* Price Range Filter */}
              <div className="filter-group">
                <div className="filter-group-title">
                  <span>Price Range</span>
                </div>
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under-50k', label: 'Under ₹50,000' },
                  { id: '50k-150k', label: '₹50,000 - ₹1,50,000' },
                  { id: '150k-300k', label: '₹1,50,000 - ₹3,00,000' },
                  { id: '300k-plus', label: 'Above ₹3,00,000' }
                ].map((range) => (
                  <label key={range.id} className={`filter-option-label ${priceRange === range.id ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="priceRange"
                      checked={priceRange === range.id}
                      onChange={() => setPriceRange(range.id)}
                    />
                    <span className="filter-radio-indicator" />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>

              {/* Metal Purity Filter */}
              <div className="filter-group">
                <div className="filter-group-title">
                  <span>Metal & Purity</span>
                </div>
                {[
                  { id: 'all', label: 'All Metals' },
                  { id: '22k', label: '22K Gold (91.6% Pure)' },
                  { id: '18k', label: '18K Diamond Gold' },
                  { id: '24k', label: '24K Investment Gold' }
                ].map((metal) => (
                  <label key={metal.id} className={`filter-option-label ${metalFilter === metal.id ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="metalFilter"
                      checked={metalFilter === metal.id}
                      onChange={() => setMetalFilter(metal.id)}
                    />
                    <span className="filter-radio-indicator" />
                    <span>{metal.label}</span>
                  </label>
                ))}
              </div>

              {/* Clear All Filters Button */}
              <button
                className="gold-outline-btn"
                style={{ width: '100%', fontSize: '0.8rem', padding: '10px', marginTop: '6px' }}
                onClick={() => {
                  setPriceRange('all');
                  setMetalFilter('all');
                  setActiveCategory('all');
                  setActiveCollection('all');
                  setSortBy('featured');
                  setSearchQuery('');
                }}
              >
                Clear All Filters
              </button>

              {/* Mobile Apply Button */}
              <button
                type="button"
                className="teal-btn mobile-filter-apply-btn"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Show {filteredProducts.length} Results
              </button>
            </aside>

            {/* Products Grid */}
            <main>
              <div className="products-grid">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.some((w) => w.id === product.id);
                  const isOutOfStock = product.inStock === false || product.stockQuantity <= 0;

                  return (
                    <article key={product.id} className="product-card">
                      {/* Discrete Restrained Status Badge */}
                      <div className="product-badge-slot">
                        {isOutOfStock ? (
                          <span className="product-badge product-badge-stockout">Out of Stock</span>
                        ) : product.isBestseller ? (
                          <span className="product-badge product-badge-bestseller">Bestseller</span>
                        ) : product.isNew ? (
                          <span className="product-badge product-badge-new">New Design</span>
                        ) : null}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                        onClick={() => toggleWishlist(product)}
                        aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                      >
                        <Heart size={16} fill={isWishlisted ? 'var(--gold-accent)' : 'none'} color={isWishlisted ? 'var(--gold-accent)' : 'currentColor'} />
                      </button>

                      {/* Image & Quick Action */}
                      <div
                        className="product-img-wrapper"
                        onClick={() => setSelectedProductDetail(product)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedProductDetail(product)}
                        aria-label={`View details for ${product.name}`}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-img"
                          loading="lazy"
                        />
                        {product.hoverImage && (
                          <img
                            src={product.hoverImage}
                            alt=""
                            aria-hidden="true"
                            className="product-img-hover"
                            loading="lazy"
                          />
                        )}
                        <div className="product-quick-actions">
                          <button
                            type="button"
                            className="quick-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProductDetail(product);
                            }}
                          >
                            <Eye size={14} /> Quick View
                          </button>
                          {product.tryOnAvailable && (
                            <button
                              type="button"
                              className="quick-action-btn quick-action-tryon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTryOnProduct(product);
                              }}
                            >
                              <Sparkles size={14} /> Try On
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Body Details */}
                      <div className="product-card-body">
                        <div className="product-metal-tag">
                          {product.metal} · {product.weight}
                        </div>
                        <h4
                          className="product-title"
                          onClick={() => setSelectedProductDetail(product)}
                          title={product.name}
                        >
                          {product.name}
                        </h4>

                        <div className="product-rating-row">
                          <Star size={13} fill="var(--gold-accent)" color="var(--gold-accent)" />
                          <span className="product-rating-val">{product.rating}</span>
                          <span className="product-reviews-val">({product.reviewsCount})</span>
                        </div>

                        <div className="product-price-row">
                          <div className="product-pricing-wrap">
                            <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
                            {product.mrp > product.price && (
                              <span className="product-mrp">MRP ₹{product.mrp.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className="product-add-btn"
                            disabled={isOutOfStock}
                            onClick={() => addToCart(product)}
                          >
                            {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 24px',
                    background: '#ffffff',
                    borderRadius: '12px'
                  }}
                >
                  <Search size={48} color="#ccc" style={{ marginBottom: '12px' }} />
                  <h3>No Jewellery Found</h3>
                  <p style={{ color: '#777', marginTop: '6px' }}>
                    Try adjusting your price range or clearing metal filters.
                  </p>
                  <button
                    className="teal-btn"
                    style={{ marginTop: '16px' }}
                    onClick={() => {
                      setPriceRange('all');
                      setMetalFilter('all');
                      setActiveCategory('all');
                      setActiveCollection('all');
                      setSearchQuery('');
                    }}
                  >
                    Reset Catalogue Filters
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* 9. REVIEWS & TESTIMONIALS SECTION */}
      <section
        className="section-padding"
        id="reviews"
        style={{
          background: 'linear-gradient(135deg, #28040b 0%, #150205 100%)',
          color: '#ffffff'
        }}
      >
        <div className="section-header">
          <p className="section-subhead" style={{ color: 'var(--gold-accent)' }}>
            HEARTFELT STORIES
          </p>
          <h2 className="section-title" style={{ color: '#ffffff' }}>
            Loved by Millions of Indian Families
          </h2>
          <div className="section-divider"></div>
        </div>

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}
        >
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '12px',
                padding: '28px'
              }}
            >
              <div style={{ display: 'flex', gap: '4px', color: '#f59e0b', marginBottom: '12px' }}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" />
                ))}
              </div>
              <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '8px' }}>
                "{rev.title}"
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#d4c7b8', lineHeight: '1.6' }}>
                {rev.comment}
              </p>
              <div
                style={{
                  marginTop: '18px',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: '12px'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--gold-accent)', display: 'block' }}>
                    {rev.author}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#999' }}>{rev.city}</span>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCircle2 size={14} /> Verified Customer
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="modal-overlay" onClick={() => setQuickViewProduct(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '850px' }}
          >
            <button className="modal-close-btn" onClick={() => setQuickViewProduct(null)}>
              <X size={20} />
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px' }}>
              <div style={{ background: '#fbf9f4', borderRadius: '10px', overflow: 'hidden' }}>
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  style={{ width: '100%', height: '380px', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="gold-badge">{quickViewProduct.collection.toUpperCase()}</span>
                  <h3 style={{ fontSize: '1.4rem', margin: '8px 0', color: 'var(--primary-teal)' }}>
                    {quickViewProduct.name}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '16px' }}>
                    {quickViewProduct.description}
                  </p>

                  <div style={{ background: '#f8f4ee', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '0.82rem', color: 'var(--primary-teal)', marginBottom: '6px' }}>
                      TRANSPARENT SPECIFICATIONS
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.82rem' }}>
                      <div><strong>Metal:</strong> {quickViewProduct.metal}</div>
                      <div><strong>Gross Wt:</strong> {quickViewProduct.weight}</div>
                      <div><strong>Diamond Kt:</strong> {quickViewProduct.diamondKt}</div>
                      <div><strong>Certified:</strong> {quickViewProduct.certifiedBy}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-teal)' }}>
                    ₹{quickViewProduct.price.toLocaleString('en-IN')}
                    <span style={{ fontSize: '0.9rem', color: '#888', textDecoration: 'line-through', marginLeft: '10px' }}>
                      ₹{quickViewProduct.mrp.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button
                    className="teal-btn"
                    style={{ flex: 1 }}
                    onClick={() => {
                      addToCart(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                  >
                    <ShoppingBag size={18} /> Add to Bag
                  </button>

                  {quickViewProduct.tryOnAvailable && (
                    <button
                      className="gold-outline-btn"
                      onClick={() => {
                        setTryOnProduct(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                    >
                      <Sparkles size={18} /> Try On
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. VIRTUAL TRY-ON MODAL */}
      {tryOnProduct && (
        <div className="modal-overlay" onClick={() => setTryOnProduct(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '900px' }}
          >
            <button className="modal-close-btn" onClick={() => setTryOnProduct(null)}>
              <X size={20} />
            </button>

            <div className="try-on-grid">
              <div className="try-on-preview-box">
                <span className="gold-badge" style={{ position: 'absolute', top: '16px', left: '16px' }}>
                  3D INTERACTIVE STUDIO
                </span>

                <img
                  src={tryOnProduct.image}
                  alt={tryOnProduct.name}
                  className="try-on-canvas-img"
                  style={{
                    filter:
                      tryOnMetal === 'Rose Gold'
                        ? 'sepia(0.6) hue-rotate(-20deg) saturate(1.8)'
                        : tryOnMetal === 'White Gold / Platinum'
                        ? 'grayscale(1) brightness(1.2)'
                        : 'none'
                  }}
                />

                <div style={{ marginTop: '16px', color: '#fef08a' }}>
                  <p style={{ fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Selected Customization:
                  </p>
                  <h4 style={{ color: '#ffffff', marginTop: '4px' }}>
                    {tryOnMetal} • {tryOnGem} Accent
                  </h4>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-teal)' }}>
                    Virtual Try-On Customizer
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#666', marginBottom: '20px' }}>
                    Customize metal finish and gemstone setting to preview how it looks before ordering.
                  </p>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                      1. Select Metal Color Tone
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[
                        { name: 'Yellow Gold', color: '#C5A64A' },
                        { name: 'Rose Gold', color: '#e0a996' },
                        { name: 'White Gold / Platinum', color: '#d1d5db' }
                      ].map((m) => (
                        <button
                          key={m.name}
                          onClick={() => setTryOnMetal(m.name)}
                          style={{
                            flex: 1,
                            padding: '10px 8px',
                            borderRadius: '8px',
                            border: `2px solid ${tryOnMetal === m.name ? 'var(--primary-teal)' : '#e5e7eb'}`,
                            background: tryOnMetal === m.name ? '#faf6ee' : '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: m.color,
                              display: 'inline-block',
                              border: '1px solid #aaa'
                            }}
                          />
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                      2. Select Accent Gemstone
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {['Natural Diamond (VVS)', 'Zambian Emerald', 'Pigeon Blood Ruby', 'Ceylon Blue Sapphire'].map((gem) => (
                        <button
                          key={gem}
                          onClick={() => setTryOnGem(gem)}
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: `1.5px solid ${tryOnGem === gem ? 'var(--gold-accent)' : '#e5e7eb'}`,
                            background: tryOnGem === gem ? 'var(--gold-light)' : '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            textAlign: 'left'
                          }}
                        >
                          {gem}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button
                    className="teal-btn"
                    style={{ width: '100%' }}
                    onClick={() => {
                      addToCart({
                        ...tryOnProduct,
                        name: `${tryOnProduct.name} (${tryOnMetal}, ${tryOnGem})`
                      });
                      setTryOnProduct(null);
                    }}
                  >
                    Add Custom Piece to Bag →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. ORDER TRACKING MODAL */}
      {showTrackOrderModal && (
        <div className="modal-overlay" onClick={() => setShowTrackOrderModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', padding: '32px' }}
          >
            <button className="modal-close-btn" onClick={() => setShowTrackOrderModal(false)}>
              <X size={20} />
            </button>

            <span className="gold-badge">REAL-TIME INSURED LOGISTICS</span>
            <h3 style={{ fontSize: '1.6rem', color: 'var(--primary-teal)', marginTop: '8px' }}>
              Track Your Kyaari Order
            </h3>

            <form onSubmit={handleTrackOrder} style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter Order ID (e.g. KYA-784920)"
                  value={trackInput}
                  onChange={(e) => setTrackInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '6px'
                  }}
                />
                <button type="submit" className="teal-btn">
                  Track Order
                </button>
              </div>
            </form>

            {trackStatus && (
              <div style={{ marginTop: '24px', background: '#faf6ee', padding: '20px', borderRadius: '10px', border: '1px solid #ebdcae' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0d0ae', paddingBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#666' }}>Order ID:</span>
                    <h5 style={{ fontSize: '1rem', color: 'var(--primary-teal)' }}>{trackStatus.orderId}</h5>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.78rem', color: '#666' }}>Expected Delivery:</span>
                    <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.88rem' }}>{trackStatus.expectedDelivery}</div>
                  </div>
                </div>

                <div className="tracking-timeline">
                  <div className="tracking-step completed">
                    <div className="tracking-step-circle">✓</div>
                    <span>Order Placed</span>
                  </div>
                  <div className="tracking-step completed">
                    <div className="tracking-step-circle">✓</div>
                    <span>BIS Certified</span>
                  </div>
                  <div className="tracking-step completed">
                    <div className="tracking-step-circle">✓</div>
                    <span>Insured Transit</span>
                  </div>
                  <div className="tracking-step">
                    <div className="tracking-step-circle">4</div>
                    <span>Delivered</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#666', textAlign: 'center' }}>
                  Current Status: <strong>{trackStatus.status}</strong> ({trackStatus.currentLocation})
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 13. STORE LOCATOR MODAL */}
      {showStoreModal && (
        <div className="modal-overlay" onClick={() => setShowStoreModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '1000px', padding: '32px' }}
          >
            <button className="modal-close-btn" onClick={() => setShowStoreModal(false)}>
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="gold-badge">500+ BOUTIQUES NATIONWIDE</span>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-teal)', marginTop: '8px' }}>
                Find Your Nearest Kyaari Boutique
              </h2>
            </div>

            <div className="store-list-grid">
              {STORES.map((store) => (
                <div key={store.id} className="store-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="gold-badge">{store.city}</span>
                    <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Star size={12} fill="#f59e0b" /> {store.rating}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', margin: '10px 0 6px 0', color: 'var(--primary-teal)' }}>
                    {store.name}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#666', marginBottom: '12px' }}>{store.address}</p>

                  <div style={{ fontSize: '0.78rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>Phone:</strong> {store.phone}</div>
                    <div><strong>Timing:</strong> {store.timing}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      className="teal-btn"
                      style={{ flex: 1, fontSize: '0.78rem', padding: '8px' }}
                      onClick={() => {
                        showToast(`Appointment booked at ${store.name}!`);
                        setShowStoreModal(false);
                      }}
                    >
                      <Calendar size={14} /> Book Video Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 14. SHOPPING CART SIDE DRAWER WITH PROMO CODE & FREE SHIPPING */}
      {isCartOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setIsCartOpen(false)} />
          <div className="cart-drawer">
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={20} />
                <h3 style={{ color: '#ffffff', fontSize: '1.1rem' }}>
                  Your Shopping Bag ({cart.reduce((a, b) => a + b.qty, 0)})
                </h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={{ color: '#ffffff' }}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Free Shipping Progress Indicator */}
              <div className="shipping-progress-box">
                <div style={{ fontSize: '0.78rem', color: 'var(--primary-teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={14} /> 100% Free Express Insured Shipping Unlocked!
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '100%' }}></div>
                </div>
              </div>

              {cart.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '0.88rem', color: 'var(--text-dark)' }}>{item.name}</h5>
                    <p style={{ fontSize: '0.75rem', color: '#888' }}>{item.metal}</p>
                    <div style={{ fontWeight: 700, color: 'var(--primary-teal)', marginTop: '4px' }}>
                      ₹{item.price.toLocaleString('en-IN')}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        style={{ border: '1px solid #ccc', padding: '2px 6px', borderRadius: '4px' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.qty}</span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        style={{ border: '1px solid #ccc', padding: '2px 6px', borderRadius: '4px' }}
                      >
                        <Plus size={12} />
                      </button>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#e11d48', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
                  <ShoppingBag size={48} color="#ccc" style={{ marginBottom: '12px' }} />
                  <p>Your Shopping Bag is currently empty.</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="drawer-footer">
                {/* Promo Coupon Input */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666', display: 'block', marginBottom: '4px' }}>
                    Have a Promo Code?
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="e.g. KYAARIGOLD"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-gold)',
                        fontSize: '0.82rem',
                        textTransform: 'uppercase'
                      }}
                    />
                    <button
                      className="teal-btn"
                      style={{ padding: '8px 12px', fontSize: '0.78rem' }}
                      onClick={() => applyCouponCode()}
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                      ✓ Coupon {appliedCoupon.code} Applied (-₹{appliedCoupon.discount.toLocaleString('en-IN')})
                    </div>
                  )}
                </div>

                {/* Gift Wrap Checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#444', marginBottom: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isGiftWrapped}
                    onChange={(e) => setIsGiftWrapped(e.target.checked)}
                    style={{ accentColor: 'var(--primary-teal)' }}
                  />
                  <Gift size={14} color="var(--primary-teal)" />
                  Add Luxury Gift Box & Card (+₹250)
                </label>

                {/* Price Breakdown */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem', color: '#16a34a' }}>
                    <span>Coupon Discount:</span>
                    <span style={{ fontWeight: 600 }}>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {isGiftWrapped && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                    <span>Luxury Gift Packaging:</span>
                    <span style={{ fontWeight: 600 }}>+₹250</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                  <span>GST (3%):</span>
                  <span style={{ fontWeight: 600 }}>₹{estimatedTax.toLocaleString('en-IN')}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    borderTop: '1px solid var(--border-gold)',
                    paddingTop: '10px',
                    marginBottom: '16px',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--primary-teal)'
                  }}
                >
                  <span>Total Amount:</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                <button
                  className="teal-btn"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutModalOpen(true);
                  }}
                >
                  Proceed to Secure Checkout →
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 15. WISHLIST SIDE DRAWER */}
      {isWishlistOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setIsWishlistOpen(false)} />
          <div className="cart-drawer">
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Heart size={20} fill="#ffffff" />
                <h3 style={{ color: '#ffffff', fontSize: '1.1rem' }}>
                  Saved Wishlist ({wishlist.length})
                </h3>
              </div>
              <button onClick={() => setIsWishlistOpen(false)} style={{ color: '#ffffff' }}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {wishlist.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '0.88rem' }}>{item.name}</h5>
                    <div style={{ fontWeight: 700, color: 'var(--primary-teal)', marginTop: '4px' }}>
                      ₹{item.price.toLocaleString('en-IN')}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        className="teal-btn"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => {
                          addToCart(item);
                          toggleWishlist(item);
                        }}
                      >
                        Move to Bag
                      </button>
                      <button onClick={() => toggleWishlist(item)} style={{ fontSize: '0.75rem', color: '#999' }}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {wishlist.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
                  <Heart size={48} color="#ccc" style={{ marginBottom: '12px' }} />
                  <p>Your Wishlist is empty.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 16. PRODUCTION CHECKOUT MODAL (RAZORPAY & COD) */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cart={cart}
        appliedCoupon={appliedCoupon}
        isGiftWrapped={isGiftWrapped}
        shippingMethod={shippingMethod}
        setShippingMethod={setShippingMethod}
        calculatedTotals={orderBreakdown}
        currentUser={currentUser}
        showToast={showToast}
        onOrderSuccess={(order) => {
          setConfirmedOrder(order);
          setCart([]);
          setCheckoutModalOpen(false);
        }}
      />

      {/* 16B. ORDER CONFIRMATION MODAL */}
      <OrderConfirmationModal
        isOpen={Boolean(confirmedOrder)}
        onClose={() => setConfirmedOrder(null)}
        order={confirmedOrder}
        onTrackOrder={(orderNum) => {
          setConfirmedOrder(null);
          handleTrackOrder(null, orderNum);
        }}
      />

      {/* 16C. DEDICATED LUXURY PRODUCT DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
        isWishlisted={selectedProductDetail ? wishlist.some((w) => w.id === selectedProductDetail.id) : false}
        onOpenTryOn={(p) => setTryOnProduct(p)}
        onCheckPincode={handleCheckPincode}
        pincodeStatus={pincodeStatus}
        pincode={pincode}
        setPincode={setPincode}
      />

      {/* 16D. CUSTOMER AUTH MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
        showToast={showToast}
      />

      {/* 16E. CUSTOMER ACCOUNT & ORDERS MODAL */}
      <UserProfileModal
        isOpen={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
        currentUser={currentUser}
        onSignOut={() => {
          setCurrentUser(null);
          showToast('Signed out of Kyaari Maison');
        }}
        onOpenAdmin={() => setShowAdminModal(true)}
        onTrackOrder={(orderNum) => {
          handleTrackOrder(null, orderNum);
        }}
      />

      {/* 16F. ADMIN ATELIER DASHBOARD MODAL */}
      <AdminDashboardModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        currentUser={currentUser}
        showToast={showToast}
        onProductsUpdated={() => {
          fetchProducts().then((data) => {
            if (data && data.length > 0) setProductsList(data);
          });
        }}
      />

      {/* 17. PINCODE CHECK MODAL */}
      {showPincodeModal && (
        <div className="modal-overlay" onClick={() => setShowPincodeModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', padding: '28px' }}
          >
            <button className="modal-close-btn" onClick={() => setShowPincodeModal(false)}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-teal)', marginBottom: '12px' }}>
              Check Delivery & Purity Service
            </h3>

            <form onSubmit={handleCheckPincode}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit PIN Code (e.g. 400001)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '6px'
                  }}
                />
                <button type="submit" className="teal-btn">
                  Check
                </button>
              </div>
            </form>

            {pincodeStatus && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '6px',
                  background: pincodeStatus.valid ? '#f0fdf4' : '#fef2f2',
                  color: pincodeStatus.valid ? '#166534' : '#991b1b',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}
              >
                {pincodeStatus.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 18. FOOTER */}
      <footer className="site-footer">
        <div className="footer-container">
          <div>
            <div className="brand-logo" style={{ marginBottom: '16px', color: '#ffffff' }}>
              <img 
                src="/kyaari-logo.jpg" 
                alt="Kyaari Jewellery Logo" 
                className="brand-logo-img footer-logo-img" 
              />
              <div className="brand-logo-text">
                <span className="brand-title" style={{ color: '#ffffff' }}>
                  KYAARI
                </span>
                <span className="brand-subtitle" style={{ color: 'var(--gold-accent)' }}>
                  JEWELLERY
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#c5b7a7', lineHeight: '1.6' }}>
              Kyaari Jewellery is India's premier luxury jewellery maison, celebrated for 100% hallmarked gold, ethically certified solitaires, and royal bridal craftsmanship.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--gold-accent)', marginBottom: '16px' }}>OUR COLLECTIONS</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><a href="#catalog">Rivaah Bridal Jewellery</a></li>
              <li><a href="#catalog">Celeste Solitaires</a></li>
              <li><a href="#catalog">Kyaari Everyday Luxe</a></li>
              <li><a href="#catalog">Dharohar Heritage Gold</a></li>
              <li><a href="#catalog">24K Pure Gold Coins</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--gold-accent)', marginBottom: '16px' }}>CUSTOMER CARE</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <li><a href="#catalog">100% Purity Guarantee</a></li>
              <li><a href="#catalog">Golden Harvest Scheme</a></li>
              <li><a href="#catalog">Old Gold Exchange Policy</a></li>
              <li><a href="#catalog" onClick={() => setShowTrackOrderModal(true)}>Track Your Insured Order</a></li>
              <li><a href="#catalog" onClick={() => setShowStoreModal(true)}>Store Locator</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--gold-accent)', marginBottom: '16px' }}>CONNECT WITH US</h4>
            <p style={{ fontSize: '0.88rem', color: '#c5b7a7', marginBottom: '12px' }}>
              Toll Free: 1800-258-2598 (9 AM - 9 PM)
            </p>
            <p style={{ fontSize: '0.88rem', color: '#c5b7a7', marginBottom: '16px' }}>
              Email: customercare@kyaarijewellery.com
            </p>
            <button
              className="gold-outline-btn"
              style={{ color: '#ffffff', borderColor: 'var(--gold-accent)' }}
              onClick={() => setShowStoreModal(true)}
            >
              <PhoneCall size={16} /> Book Showroom Appointment
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 KYAARI JEWELLERY. All Rights Reserved. Pure Gold & Diamond Jewellery Atelier.</p>
        </div>
      </footer>

      {/* 19. MOBILE FIXED BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          type="button"
          className="mobile-bottom-nav-item"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          type="button"
          className="mobile-bottom-nav-item"
          onClick={() => {
            const cat = document.getElementById('catalog');
            if (cat) cat.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Compass size={20} />
          <span>Explore</span>
        </button>

        <button
          type="button"
          className="mobile-bottom-nav-item"
          onClick={() => setIsWishlistOpen(true)}
          aria-label="Wishlist"
        >
          <div className="mobile-nav-icon-wrap">
            <Heart size={20} />
            {wishlist.length > 0 && <span className="mobile-nav-badge">{wishlist.length}</span>}
          </div>
          <span>Wishlist</span>
        </button>

        <button
          type="button"
          className="mobile-bottom-nav-item"
          onClick={() => setIsCartOpen(true)}
          aria-label="Shopping Bag"
        >
          <div className="mobile-nav-icon-wrap">
            <ShoppingBag size={20} />
            {cart.length > 0 && (
              <span className="mobile-nav-badge">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </div>
          <span>Bag</span>
        </button>

        <button
          type="button"
          className="mobile-bottom-nav-item"
          onClick={() => (currentUser ? setShowUserProfileModal(true) : setShowAuthModal(true))}
          aria-label="Account"
        >
          <User size={20} />
          <span>{currentUser ? 'Account' : 'Sign In'}</span>
        </button>
      </nav>
    </div>
  );
}

