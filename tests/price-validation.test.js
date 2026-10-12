import { describe, it, expect } from 'vitest';
import { validateAndCalculateOrder, STORE_POLICIES } from '../src/lib/validation.js';

// Mock catalog for testing
const mockCatalog = [
  {
    id: 'test-gold-ring',
    name: 'Kyaari Solitaire Band',
    price: 30000,
    mrp: 35000,
    stockQuantity: 5,
    inStock: true
  },
  {
    id: 'test-diamond-necklace',
    name: 'Kyaari Royal Emerald Haram',
    price: 120000,
    mrp: 140000,
    stockQuantity: 2,
    inStock: true
  },
  {
    id: 'test-out-of-stock',
    name: 'Kyaari Vintage Jhumkas',
    price: 45000,
    mrp: 50000,
    stockQuantity: 0,
    inStock: false
  }
];

describe('Kyaari Jewellery - Price, Tax & Shipping Validation', () => {
  it('should return error if shopping cart is empty', () => {
    const res = validateAndCalculateOrder({
      items: [],
      catalog: mockCatalog
    });
    expect(res.isValid).toBe(false);
    expect(res.total).toBe(0);
    expect(res.errors[0]).toContain('empty');
  });

  it('should accurately calculate subtotal and 3% jewellery GST with free standard shipping', () => {
    const res = validateAndCalculateOrder({
      items: [{ id: 'test-gold-ring', qty: 1 }],
      shippingMethod: 'standard',
      isGiftWrapped: false,
      catalog: mockCatalog
    });

    expect(res.isValid).toBe(true);
    expect(res.subtotal).toBe(30000);
    expect(res.discount).toBe(0);
    expect(res.shippingFee).toBe(0);
    // 3% of 30,000 = 900
    expect(res.tax).toBe(900);
    expect(res.total).toBe(30900);
  });

  it('should apply express shipping fee of ₹499 and gift wrapping of ₹250', () => {
    const res = validateAndCalculateOrder({
      items: [{ id: 'test-gold-ring', qty: 1 }],
      shippingMethod: 'express',
      isGiftWrapped: true,
      catalog: mockCatalog
    });

    expect(res.isValid).toBe(true);
    expect(res.subtotal).toBe(30000);
    expect(res.shippingFee).toBe(499);
    expect(res.giftWrapFee).toBe(250);
    expect(res.tax).toBe(900);
    expect(res.total).toBe(30000 + 250 + 499 + 900);
  });

  it('should apply valid coupon KYAARIGOLD when threshold >= ₹50,000 is met', () => {
    const res = validateAndCalculateOrder({
      items: [{ id: 'test-gold-ring', qty: 2 }], // 30,000 * 2 = 60,000
      couponCode: 'KYAARIGOLD',
      catalog: mockCatalog
    });

    expect(res.isValid).toBe(true);
    expect(res.subtotal).toBe(60000);
    expect(res.discount).toBe(15000); // flat 15,000 off
    // Taxable amount: 60,000 - 15,000 = 45,000
    // 3% GST on 45,000 = 1350
    expect(res.tax).toBe(1350);
    expect(res.total).toBe(45000 + 1350);
  });

  it('should reject coupon if subtotal is below minimum eligibility requirement', () => {
    const res = validateAndCalculateOrder({
      items: [{ id: 'test-gold-ring', qty: 1 }], // 30,000 < 50,000 threshold
      couponCode: 'KYAARIGOLD',
      catalog: mockCatalog
    });

    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('minimum order value');
  });

  it('should reject out of stock items', () => {
    const res = validateAndCalculateOrder({
      items: [{ id: 'test-out-of-stock', qty: 1 }],
      catalog: mockCatalog
    });

    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('out of stock');
  });

  it('should reject quantity exceeding inventory stock', () => {
    const res = validateAndCalculateOrder({
      items: [{ id: 'test-diamond-necklace', qty: 5 }], // only 2 available
      catalog: mockCatalog
    });

    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('available in inventory');
  });

  it('should disallow Cash on Delivery for orders exceeding luxury threshold ₹50,000', () => {
    const res = validateAndCalculateOrder({
      items: [{ id: 'test-diamond-necklace', qty: 1 }], // 120,000 > 50,000
      paymentMethod: 'cod',
      catalog: mockCatalog
    });

    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('Cash on Delivery');
  });
});
