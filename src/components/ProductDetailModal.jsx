import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Award,
  Truck,
  Sparkles,
  ShoppingBag,
  Heart,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  Info,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onOpenTryOn,
  pincode,
  pincodeStatus
}) {
  if (!product) return null;

  // Variants & Sizing State
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : null
  );

  // Gallery Images
  const galleryImages = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image, product.hoverImage].filter(Boolean);

  const [activeImage, setActiveImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [localPincode, setLocalPincode] = useState(pincode || '');
  const [localPinMsg, setLocalPinMsg] = useState(pincodeStatus?.message || '');
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'pricing' | 'care'

  const currentPrice = selectedVariant?.price || product.price;
  const currentMrp = selectedVariant?.mrp || product.mrp;
  const currentWeight = selectedVariant?.weight || product.weight;
  const currentMetal = selectedVariant?.name || product.metal;

  const currentStock = product.stockQuantity ?? (product.inStock ? 10 : 0);
  const isOutOfStock = currentStock <= 0 || product.inStock === false;

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (localPincode.trim().length === 6 && /^\d+$/.test(localPincode.trim())) {
      setLocalPinMsg('Insured priority delivery available within 2 to 3 business days.');
    } else {
      setLocalPinMsg('Please enter a valid 6-digit Indian PIN Code.');
    }
  };

  const handleAddProduct = () => {
    const itemToAdd = {
      ...product,
      price: currentPrice,
      mrp: currentMrp,
      metal: currentMetal,
      selectedVariant: selectedVariant?.name || null,
      selectedSize: selectedSize || null
    };
    onAddToCart?.(itemToAdd, quantity);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-pdp-title">
      <div
        className="modal-content product-detail-modal-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close product details"
        >
          <X size={18} />
        </button>

        <div className="pdp-modal-layout">
          {/* Left Column: Visual Presentation */}
          <div className="pdp-gallery-col">
            <div className="pdp-main-image-frame">
              <img
                src={activeImage || product.image}
                alt={product.name}
                className="pdp-main-image"
              />

              {/* Status Badge */}
              {isOutOfStock ? (
                <div className="pdp-badge pdp-badge-stockout">Out of Stock</div>
              ) : product.isBestseller ? (
                <div className="pdp-badge pdp-badge-gold">Bestseller</div>
              ) : product.isNew ? (
                <div className="pdp-badge pdp-badge-new">New Design</div>
              ) : null}
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="pdp-thumbnails-strip">
                {galleryImages.map((imgSrc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`pdp-thumb-btn ${activeImage === imgSrc ? 'active' : ''}`}
                    onClick={() => setActiveImage(imgSrc)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={imgSrc} alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* Certification Assurance */}
            <div className="pdp-trust-bar">
              <div className="pdp-trust-item">
                <ShieldCheck size={16} className="pdp-trust-icon" />
                <div>
                  <strong>{product.certifiedBy || 'BIS Hallmark 750 / 916'}</strong>
                  <span>100% government hallmarked</span>
                </div>
              </div>
              <div className="pdp-trust-item">
                <Truck size={16} className="pdp-trust-icon" />
                <div>
                  <strong>Insured Transit</strong>
                  <span>Armoured delivery with seal</span>
                </div>
              </div>
              <div className="pdp-trust-item">
                <Award size={16} className="pdp-trust-icon" />
                <div>
                  <strong>Lifetime Exchange</strong>
                  <span>Certified buyback value</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Variants & Actions */}
          <div className="pdp-info-col">
            <div className="pdp-header">
              <span className="pdp-collection-tag">
                {product.pillar ? product.pillar.split('.')[1]?.trim() : 'Fine Jewellery'}
              </span>
              <h2 id="modal-pdp-title" className="pdp-title">
                {product.name}
              </h2>

              <div className="pdp-meta-row">
                <div className="pdp-rating">
                  <Star size={13} fill="#B8963D" color="#B8963D" />
                  <span className="pdp-rating-score">{product.rating || '4.9'}</span>
                  <span className="pdp-rating-count">({product.reviewsCount || 140} verified patrons)</span>
                </div>
                <span className="pdp-sku">SKU: {product.id}</span>
              </div>
            </div>

            {/* Price Row */}
            <div className="pdp-price-section">
              <div className="pdp-price-wrap">
                <span className="pdp-price">₹{Number(currentPrice).toLocaleString('en-IN')}</span>
                {currentMrp > currentPrice && (
                  <span className="pdp-mrp">MRP ₹{Number(currentMrp).toLocaleString('en-IN')}</span>
                )}
              </div>
              <span className="pdp-tax-note">Inclusive of all taxes</span>
            </div>

            {/* Short Description */}
            <p className="pdp-desc">{product.description}</p>

            {/* Interactive Metal Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="pdp-selector-group">
                <div className="pdp-selector-label">
                  <span>Metal and Purity:</span>
                  <strong>{selectedVariant?.name}</strong>
                </div>
                <div className="pdp-pills-row">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      className={`pdp-pill-btn ${selectedVariant?.id === variant.id ? 'active' : ''}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <span>{variant.name}</span>
                      <span className="pdp-pill-sub">{variant.purity}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pdp-selector-group">
                <div className="pdp-selector-label">
                  <span>Select Size:</span>
                  <strong>{selectedSize}</strong>
                </div>
                <div className="pdp-sizes-row">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`pdp-size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="pdp-stock-status">
              {isOutOfStock ? (
                <div className="pdp-stock-badge stockout">
                  <AlertCircle size={15} />
                  <span>Currently out of stock in atelier vault</span>
                </div>
              ) : (
                <div className="pdp-stock-badge available">
                  <CheckCircle2 size={15} />
                  <span>Available for immediate insured dispatch</span>
                </div>
              )}
            </div>

            {/* Interactive Tabs: Specifications, Price Transparency & Care */}
            <div className="pdp-tabs-container">
              <div className="pdp-tabs-header">
                <button
                  type="button"
                  className={`pdp-tab-trigger ${activeTab === 'specs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specs')}
                >
                  Specifications
                </button>
                <button
                  type="button"
                  className={`pdp-tab-trigger ${activeTab === 'pricing' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pricing')}
                >
                  Price Breakup
                </button>
                <button
                  type="button"
                  className={`pdp-tab-trigger ${activeTab === 'care' ? 'active' : ''}`}
                  onClick={() => setActiveTab('care')}
                >
                  Care & Warranty
                </button>
              </div>

              <div className="pdp-tab-content">
                {activeTab === 'specs' && (
                  <div className="pdp-specs-grid">
                    <div className="pdp-spec-cell">
                      <span className="pdp-spec-key">Metal</span>
                      <strong className="pdp-spec-val">{currentMetal}</strong>
                    </div>
                    <div className="pdp-spec-cell">
                      <span className="pdp-spec-key">Gross Weight</span>
                      <strong className="pdp-spec-val">{currentWeight}</strong>
                    </div>
                    <div className="pdp-spec-cell">
                      <span className="pdp-spec-key">Net Gold Weight</span>
                      <strong className="pdp-spec-val">
                        {product.goldWeightGrams ? `${product.goldWeightGrams} g` : currentWeight}
                      </strong>
                    </div>
                    <div className="pdp-spec-cell">
                      <span className="pdp-spec-key">Stone / Diamonds</span>
                      <strong className="pdp-spec-val">
                        {product.diamondKt ? `${product.diamondKt}` : 'Solid Gold'}
                      </strong>
                    </div>
                    {product.dimensions && (
                      <div className="pdp-spec-cell">
                        <span className="pdp-spec-key">Dimensions</span>
                        <strong className="pdp-spec-val">{product.dimensions}</strong>
                      </div>
                    )}
                    {product.closure && (
                      <div className="pdp-spec-cell">
                        <span className="pdp-spec-key">Fastening</span>
                        <strong className="pdp-spec-val">{product.closure}</strong>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div className="pdp-pricing-breakup">
                    <div className="pdp-breakup-row">
                      <span>Gold Base Value ({product.goldWeightGrams || 1.8}g)</span>
                      <strong>₹{Math.round((product.price - (product.makingCharges || 1500)) / 1.03).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="pdp-breakup-row">
                      <span>Artisan Making Charges</span>
                      <strong>₹{Number(product.makingCharges || 1500).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="pdp-breakup-row">
                      <span>GST (3% Standard)</span>
                      <strong>₹{Math.round(product.price * 0.03).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="pdp-breakup-total">
                      <span>Final Price</span>
                      <strong>₹{Number(currentPrice).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                )}

                {activeTab === 'care' && (
                  <div className="pdp-care-info">
                    <p>• Store each piece individually in the provided Kyaari velvet box to prevent abrasions.</p>
                    <p>• Apply lotions, perfumes, and hairsprays before putting on jewellery.</p>
                    <p>• Clean gently with warm water, mild soap, and a soft-bristled brush.</p>
                    <p>• Covered under Kyaari Lifetime Exchange and Buyback at current gold rates.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery PIN Code Checker */}
            <div className="pdp-pincode-box">
              <label htmlFor="pdp-pin-input" className="pdp-pincode-label">
                Check delivery availability:
              </label>
              <form onSubmit={handlePincodeSubmit} className="pdp-pincode-form">
                <input
                  id="pdp-pin-input"
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN"
                  value={localPincode}
                  onChange={(e) => setLocalPincode(e.target.value)}
                  className="pdp-pincode-input"
                />
                <button type="submit" className="pdp-pincode-submit">
                  Verify
                </button>
              </form>
              {localPinMsg && <p className="pdp-pincode-feedback">{localPinMsg}</p>}
            </div>

            {/* Purchase Action Bar */}
            <div className="pdp-action-bar">
              {/* Quantity */}
              <div className="pdp-quantity-control">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="pdp-quantity-value">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock || isOutOfStock}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Bag */}
              <button
                type="button"
                className="pdp-add-btn"
                disabled={isOutOfStock}
                onClick={handleAddProduct}
              >
                <ShoppingBag size={18} />
                <span>{isOutOfStock ? 'Currently Unavailable' : 'Add to Shopping Bag'}</span>
              </button>

              {/* Wishlist */}
              <button
                type="button"
                className={`pdp-wishlist-toggle ${isWishlisted ? 'active' : ''}`}
                onClick={() => onToggleWishlist?.(product)}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={19} fill={isWishlisted ? '#C5A64A' : 'none'} color="#C5A64A" />
              </button>

              {/* Virtual Try-On if available */}
              {product.tryOnAvailable && (
                <button
                  type="button"
                  className="pdp-tryon-toggle"
                  onClick={() => {
                    onClose();
                    onOpenTryOn?.(product);
                  }}
                  title="Virtual Try-On"
                  aria-label="Open Virtual Try-On"
                >
                  <Sparkles size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
