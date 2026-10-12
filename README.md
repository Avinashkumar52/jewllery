# KYAARI JEWELLERY — Fine Jewellery Atelier & E-Commerce Store

Official online store and digital flagship for **KYAARI Fine Jewellery**, showcasing BIS-hallmarked 18K, 22K, and 24K gold jewellery, ethically certified diamonds, solitaires, polki, and heritage bridal designs.

---

## 💎 Features & Highlights

- **Apple-Grade Visual Presentation**: Restrained, warm off-white aesthetics (`#F5F3EE`), Imperial Teal brand tones (`#123D4B`), and subtle Antique Gold accents (`#C5A64A`).
- **Comprehensive Mobile Experience**:
  - Native fixed bottom navigation bar (Home, Explore, Wishlist, Bag, Account).
  - Luxury 2-column responsive jewellery grid.
  - Slide-up bottom filter drawer with real-time collection, metal purity, and budget filtering.
  - Sticky purchase action bar in product detail view.
- **Interactive Multi-Variant PDP**:
  - Live 18K Yellow Gold, 18K Rose Gold, and 22K Gold metal selectors.
  - Real-time price, weight, and specifications calculations.
  - Transparent price breakup: Pure Gold Base Value + Craftsmanship / Making Charges + 3% GST.
  - Verified PIN code delivery estimator.
- **Cart & Secure Checkout**:
  - Dynamic cart arithmetic: itemized subtotals, coupon validation, optional luxury gift packaging (+₹250), 3% GST, and free insured transit.
  - Razorpay online payment integration and Cash on Delivery with regulatory threshold checks.
- **Offline & Supabase Sync**:
  - Built-in Supabase PostgreSQL integration with resilient offline local storage synchronization.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Run Standalone Production Server
```bash
node server/index.js
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Lucide Icons, Vanilla CSS Design System
- **Backend / API**: Node.js HTTP Server (`server/index.js`, `server/api-handlers.js`)
- **Database & Auth**: Supabase PostgreSQL (`supabase/`)
- **Testing**: Vitest (`npm test`)

---

© 2026 KYAARI JEWELLERY. All Rights Reserved.
