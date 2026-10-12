// ==============================================================================
// KYAARI JEWELLERY - PRICE & STOCK VALIDATION ENGINE
// Shared between Client & Server to guarantee authoritative pricing & safety
// ==============================================================================

export const STORE_POLICIES = {
  gstRate: 0.03, // 3% GST standard on Indian Gold & Diamond Jewellery
  codMaxLimit: 50000, // Maximum allowed order value for Cash on Delivery (₹50,000)
  giftWrapFee: 250, // ₹250 for tamper-proof royal velvet gift packaging
  shippingRates: {
    standard: {
      id: 'standard',
      name: 'Free Insured Priority Delivery (3-5 Days)',
      cost: 0,
      description: '100% Transit Insured with Armoured Courier Partner (BlueDart / Sequel)'
    },
    express: {
      id: 'express',
      name: 'Express Insured Air Delivery (24-48 Hours)',
      cost: 499,
      description: 'Expedited Priority Air Express with tamper-proof security seal'
    }
  },
  coupons: {
    KYAARIGOLD: {
      code: 'KYAARIGOLD',
      minAmount: 50000,
      discount: 15000,
      type: 'flat',
      description: 'Festive Gold Offer: ₹15,000 off making charges'
    },
    DIAMOND10: {
      code: 'DIAMOND10',
      minAmount: 100000,
      discount: 25000,
      type: 'flat',
      description: 'Solitaire Special: ₹25,000 off diamond orders above ₹1,00,000'
    },
    WELCOME5: {
      code: 'WELCOME5',
      minAmount: 20000,
      discountPercent: 5,
      maxDiscount: 10000,
      type: 'percentage',
      description: 'First Purchase: 5% off up to ₹10,000'
    }
  }
};

/**
 * Validates cart items against an authoritative product catalog and calculates verified totals.
 *
 * @param {Object} options
 * @param {Array} options.items - Cart items [{ id, qty }]
 * @param {string} [options.couponCode] - Optional promo code applied
 * @param {boolean} [options.isGiftWrapped] - Whether gift wrap is selected
 * @param {string} [options.shippingMethod] - 'standard' | 'express'
 * @param {string} [options.paymentMethod] - 'razorpay' | 'cod'
 * @param {Array} options.catalog - Authoritative products list from database or products.js
 * @returns {Object} Validated order calculation with line items and breakdowns
 */
export function validateAndCalculateOrder({
  items = [],
  couponCode = null,
  isGiftWrapped = false,
  shippingMethod = 'standard',
  paymentMethod = 'razorpay',
  catalog = []
}) {
  const errors = [];
  const validatedItems = [];
  let subtotal = 0;

  if (!Array.isArray(items) || items.length === 0) {
    return {
      isValid: false,
      errors: ['Your shopping bag is empty.'],
      subtotal: 0,
      discount: 0,
      giftWrapFee: 0,
      tax: 0,
      shippingFee: 0,
      total: 0,
      items: []
    };
  }

  // 1. Authoritative Price & Stock Check
  for (const item of items) {
    const product = catalog.find((p) => p.id === item.id);

    if (!product) {
      errors.push(`Jewellery piece '${item.id}' is no longer available in the catalogue.`);
      continue;
    }

    const availableStock = typeof product.stockQuantity === 'number' ? product.stockQuantity : (product.inStock ? 10 : 0);

    if (availableStock <= 0 || product.inStock === false) {
      errors.push(`'${product.name}' is currently out of stock.`);
      continue;
    }

    const requestedQty = Math.max(1, parseInt(item.qty, 10) || 1);

    if (requestedQty > availableStock) {
      errors.push(
        `Only ${availableStock} unit(s) of '${product.name}' available in inventory (requested: ${requestedQty}).`
      );
      continue;
    }

    // Use authoritative price from catalog (never trust client price)
    const unitPrice = Number(product.price);
    const itemTotal = unitPrice * requestedQty;
    subtotal += itemTotal;

    validatedItems.push({
      id: product.id,
      name: product.name,
      metal: product.metal,
      karat: product.karat,
      weight: product.weight,
      goldWeightGrams: product.goldWeightGrams,
      unitPrice,
      mrp: Number(product.mrp),
      qty: requestedQty,
      totalPrice: itemTotal,
      image: product.image,
      stockQuantity: availableStock
    });
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      subtotal,
      discount: 0,
      giftWrapFee: 0,
      tax: 0,
      shippingFee: 0,
      total: 0,
      items: validatedItems
    };
  }

  // 2. Coupon Discount Calculation
  let discount = 0;
  let appliedCouponDetails = null;

  if (couponCode) {
    const normalizedCode = String(couponCode).trim().toUpperCase();
    const coupon = STORE_POLICIES.coupons[normalizedCode];

    if (coupon) {
      if (subtotal >= coupon.minAmount) {
        if (coupon.type === 'flat') {
          discount = Math.min(coupon.discount, subtotal);
        } else if (coupon.type === 'percentage') {
          const rawDiscount = Math.round((subtotal * coupon.discountPercent) / 100);
          discount = Math.min(rawDiscount, coupon.maxDiscount, subtotal);
        }
        appliedCouponDetails = {
          code: coupon.code,
          discount,
          description: coupon.description
        };
      } else {
        errors.push(
          `Coupon ${coupon.code} requires a minimum order value of ₹${coupon.minAmount.toLocaleString('en-IN')}.`
        );
      }
    } else {
      errors.push(`Invalid coupon code '${couponCode}'.`);
    }
  }

  // 3. Gift Wrap Fee
  const giftWrapFee = isGiftWrapped ? STORE_POLICIES.giftWrapFee : 0;

  // 4. Shipping Fee
  const selectedShipping = STORE_POLICIES.shippingRates[shippingMethod] || STORE_POLICIES.shippingRates.standard;
  const shippingFee = selectedShipping.cost;

  // 5. Jewellery GST Calculation (3% on taxable subtotal after coupon)
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * STORE_POLICIES.gstRate);

  // 6. Net Total Calculation
  const total = taxableAmount + giftWrapFee + shippingFee + tax;

  // 7. Cash on Delivery Policy Enforcement
  if (paymentMethod === 'cod' && total > STORE_POLICIES.codMaxLimit) {
    errors.push(
      `Orders above ₹${STORE_POLICIES.codMaxLimit.toLocaleString('en-IN')} cannot be processed via Cash on Delivery per regulatory luxury jewellery transport policies. Please choose Razorpay (100% Insured UPI, Card, NetBanking).`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    subtotal,
    discount,
    appliedCoupon: appliedCouponDetails,
    giftWrapFee,
    shippingFee,
    shippingMethod: selectedShipping.id,
    shippingName: selectedShipping.name,
    tax,
    gstRatePercentage: STORE_POLICIES.gstRate * 100,
    total,
    items: validatedItems
  };
}
