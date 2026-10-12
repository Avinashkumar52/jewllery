# KYAARI JEWELLERY — Production Store Setup & Deployment Guide

This guide provides complete instructions for configuring, testing, and deploying the **Kyaari Jewellery** luxury e-commerce maison.

---

## 1. Architecture Overview

- **Frontend Maison:** React 18 + Vite 5 with cinematic video hero, live gold rates, virtual try-on, luxury teal & gold aesthetics (`Cinzel`, `Cormorant Garamond`, `Outfit`).
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS), custom profiles trigger, role-based access (`customer` vs `admin`), and storage buckets for product imagery.
- **Payment Gateway:** Razorpay with **server-side order generation** and **cryptographic HMAC-SHA256 signature verification**.
- **Shipping & Fulfillment:** Configurable shipping (Free Priority Insured Courier vs ₹499 Express Insured Air), Cash on Delivery with regulatory ₹50,000 ceiling, and BlueDart / Sequel Logistics tracking integration.
- **Resilient Fallback:** Seamless in-memory & local fallback mode that works out-of-the-box for evaluation and demo testing before cloud keys are linked.

---

## 2. Quickstart & Local Execution

### 2.1 Install Dependencies
```bash
npm install
```

### 2.2 Configure Environment Variables
Copy `.env.example` to create `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

### 2.3 Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite dev server automatically proxies server-side endpoints (`/api/create-razorpay-order`, `/api/verify-razorpay-payment`, `/api/validate-cart`).

### 2.4 Run Automated Test Suite
```bash
npm test
```
Executes all 11 unit & integration tests validating price calculations, 3% GST, coupons, shipping, COD rules, and HMAC-SHA256 signature checks.

### 2.5 Build for Production
```bash
npm run build
```

### 2.6 Run Standalone Production Server
```bash
node server/index.js
```
Serves the compiled production bundle on [http://localhost:3000](http://localhost:3000).

---

## 3. Supabase Cloud Configuration

### Step 1: Create a Project
1. Log in to [Supabase](https://supabase.com) and click **New Project**.
2. Name your project (e.g., `kyaari-jewellery`) and set your database password.
3. Select your preferred region (e.g., `ap-south-1` Mumbai).

### Step 2: Run Database Migration
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Click **New Query** and paste the contents of [`supabase/migrations/001_initial_schema.sql`](file:///c:/jew/supabase/migrations/001_initial_schema.sql).
3. Click **Run**. This creates:
   - `profiles` table with automatic auth signup trigger
   - `products` table with inventory stock counters
   - `orders` and `order_items` tables
   - Row Level Security (RLS) policies
   - `product-images` storage bucket

### Step 3: Seed Catalogue Data
1. In the **SQL Editor**, open another query and paste the contents of [`supabase/seed.sql`](file:///c:/jew/supabase/seed.sql).
2. Click **Run**. All 29 flagship and sample products will be populated.

### Step 4: Retrieve API Keys
1. Navigate to **Project Settings** -> **API**.
2. Copy your **Project URL** and **anon / public key**.
3. Paste them into your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

### Step 5: Assigning Admin Role
To grant an account store administrator privileges in Supabase:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin-email@kyaarijewellery.com';
```

---

## 4. Razorpay Integration (Test & Live Mode)

### Step 1: Generate Test Keys
1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Switch toggle to **Test Mode** in the top navigation.
3. Go to **Settings** -> **API Keys** -> **Generate Key**.
4. Copy the **Key ID** and **Key Secret**.

### Step 2: Configure Environment
Populate your `.env`:
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret_here
```

### Step 3: Security & Verification Architecture
1. **Cart Validation:** When the customer clicks "Pay with Razorpay", the frontend sends the bag items to `POST /api/create-razorpay-order`.
2. **Server-Side Pricing:** The server computes the authoritative subtotal, validates remaining inventory, checks coupons, adds 3% jewellery GST, and calculates shipping.
3. **Razorpay Order Creation:** The server invokes `razorpay.orders.create({ amount: Math.round(total * 100), currency: 'INR' })`.
4. **Checkout UI:** The official Razorpay Modal opens on the client with the server-authorized `order_id`.
5. **HMAC Signature Check:** On completion, the frontend receives `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` and submits them to `POST /api/verify-razorpay-payment`.
6. **Verification & Record:** The backend verifies:
   $$\text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{KEY\_SECRET}) == \text{signature}$$
   Once verified, the order is stored in Supabase with transit insurance and inventory stock is decremented.

### Step 4: Going Live
When ready to accept real payments:
1. Complete KYC verification in the Razorpay Dashboard.
2. Generate Live Keys (`rzp_live_...`).
3. Replace the keys in production environment variables.

---

## 5. Store Policies & Configurable Rules

| Parameter | Default Value | Description |
| :--- | :--- | :--- |
| **Jewellery GST** | `3%` | Legal standard across India on Gold & Solitaires. |
| **Free Shipping** | `₹0 (Standard)` | Free 100% transit insured BlueDart delivery (3-5 days). |
| **Express Air Shipping** | `₹499` | 24-48 hours expedited air courier with security seal. |
| **COD Max Limit** | `₹50,000` | High-value orders > ₹50,000 require prepaid digital payment per jewellery compliance. |
| **Coupon: KYAARIGOLD** | `₹15,000 OFF` | Valid on gold orders with subtotal $\ge$ ₹50,000. |
| **Coupon: DIAMOND10** | `₹25,000 OFF` | Valid on solitaire diamond orders with subtotal $\ge$ ₹1,00,000. |

---

## 6. Deployment Instructions

### Option A: Vercel (Recommended)
1. Push your repository to GitHub or GitLab.
2. In [Vercel](https://vercel.com), click **Add New** -> **Project** and import your repo.
3. In **Build and Output Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
5. Click **Deploy**.

### Option B: Node.js / Render / Docker
1. Ensure `package.json` contains:
   ```json
   "scripts": {
     "start": "node server/index.js"
   }
   ```
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Configure all environment variables in your hosting provider's dashboard.

---

## 7. Verification & End-to-End Testing Protocol

1. **Guest Browsing & Catalog Navigation:**
   - Browse across the 5 pillars: Everyday Gold, Traditional, Bridal, Solitaires, and Gifts.
   - Filter by Metal (18K, 22K, 24K) and Price Range.
   - Test instant autocomplete search.
2. **Product Details View:**
   - Click any product to view hallmark certification details, gross vs gold net weight, and live PIN code delivery checker.
3. **Cart & Coupons:**
   - Add items to the shopping bag.
   - Enter promo code `KYAARIGOLD` or `DIAMOND10`.
   - Toggle the royal gift packaging checkbox (+₹250).
4. **Checkout & Payment:**
   - Click "Proceed to Secure Checkout".
   - Enter shipping address and select between Standard Insured (Free) and Express Air (₹499).
   - Select Razorpay payment or Cash on Delivery.
   - Complete payment and verify immediate transition to the official **Order Confirmation Receipt**.
5. **Customer Accounts & Order History:**
   - Click **Account** in the header.
   - Use the one-click demo login or sign up with your email.
   - Expand past order details, view line items, and click **Track Shipment**.
6. **Admin Atelier Dashboard:**
   - Click **Atelier Admin** in the header (accessible to admin users).
   - Update vault stock quantities, toggle in-stock / out-of-stock states, and view customer orders.
   - Update order fulfillment status (Confirmed $\rightarrow$ Processing $\rightarrow$ Shipped $\rightarrow$ Delivered).
