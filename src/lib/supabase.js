// ==============================================================================
// KYAARI JEWELLERY - SUPABASE CLIENT & DATA REPOSITORY
// Provides real Supabase connection with seamless offline / development fallback
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import { PRODUCTS } from '../data/products';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if valid production or sandbox credentials have been configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

// ==============================================================================
// LOCAL REPOSITORY (Fallback for development & zero-dependency testing)
// ==============================================================================

const STORAGE_KEYS = {
  PRODUCTS: 'kyaari_products_db',
  ORDERS: 'kyaari_orders_db',
  USER: 'kyaari_current_user',
  ALL_USERS: 'kyaari_users_db'
};

// Initial Seed for Local Storage
function initializeLocalStore() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    const seeded = PRODUCTS.map((p, idx) => ({
      ...p,
      stockQuantity: p.stockQuantity ?? (10 + (idx % 15)),
      isSample: Boolean(p.isSample),
      inStock: p.inStock ?? true
    }));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(seeded));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    const demoOrders = [
      {
        id: 'ord-demo-901',
        order_number: 'KYA-784920',
        user_id: 'cust-demo-1',
        customer_name: 'Ananya Singhania',
        customer_email: 'customer@kyaarijewellery.com',
        customer_phone: '+91 98201 12345',
        shipping_address: {
          fullName: 'Ananya Singhania',
          addressLine: 'Villa 12, Gulmohar Enclave, Juhu',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400049',
          phone: '+91 98201 12345'
        },
        subtotal: 68500,
        discount: 15000,
        gift_wrap_fee: 250,
        tax: 1605,
        shipping_fee: 0,
        total_amount: 55355,
        payment_method: 'razorpay',
        payment_status: 'completed',
        razorpay_order_id: 'order_DEMO784920',
        razorpay_payment_id: 'pay_DEMO192847',
        order_status: 'processing',
        tracking_number: 'BLUEDART-8829104',
        courier_partner: 'BlueDart Insured Luxury Express',
        created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        items: [
          {
            id: 'ev-101',
            product_name: 'Kyaari 18K Minimalist Gold Ball Studs',
            unit_price: 14800,
            quantity: 1,
            total_price: 14800,
            image: '/everyday-gold.jpg'
          },
          {
            id: 'ev-103',
            product_name: 'Kyaari 18K Delicate Feather Gold Box Chain',
            unit_price: 28900,
            quantity: 1,
            total_price: 28900,
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
          }
        ]
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(demoOrders));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ALL_USERS)) {
    const defaultUsers = [
      {
        id: 'cust-demo-1',
        email: 'customer@kyaarijewellery.com',
        full_name: 'Ananya Singhania',
        phone: '+91 98201 12345',
        role: 'customer'
      },
      {
        id: 'admin-demo-1',
        email: 'admin@kyaarijewellery.com',
        full_name: 'Kyaari Atelier Admin',
        phone: '+91 98111 99999',
        role: 'admin'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(defaultUsers));
  }
}

initializeLocalStore();

// ==============================================================================
// AUTHENTICATION API
// ==============================================================================

export async function signUpUser({ email, password, fullName, phone, role = 'customer' }) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role
        }
      }
    });
    if (error) throw error;
    return data.user;
  }

  // Fallback local auth
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || '[]');
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser = {
    id: 'user-' + Math.random().toString(36).substring(2, 9),
    email,
    full_name: fullName,
    phone,
    role
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  return newUser;
}

export async function signInUser({ email, password }) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;

    // Fetch profile for role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      ...data.user,
      role: profile?.role || 'customer',
      full_name: profile?.full_name || data.user.email
    };
  }

  // Fallback local auth
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || '[]');
  const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!matched) {
    // Convenience auto-register for testing
    const role = email.includes('admin') ? 'admin' : 'customer';
    const newUser = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      email,
      full_name: email.split('@')[0].toUpperCase(),
      phone: '+91 98000 00000',
      role
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    return newUser;
  }

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(matched));
  return matched;
}

export async function signOutUser() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  return stored ? JSON.parse(stored) : null;
}

// ==============================================================================
// PRODUCTS & INVENTORY API
// ==============================================================================

export async function fetchProducts() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('is_bestseller', { ascending: false });

    if (!error && data && data.length > 0) {
      // Map database snake_case columns to camelCase expected by UI
      return data.map((p) => ({
        ...p,
        stockQuantity: p.stock_quantity ?? 10,
        goldWeightGrams: p.gold_weight_grams,
        makingCharges: p.making_charges,
        diamondKt: p.diamond_kt,
        reviewsCount: p.reviews_count,
        isBestseller: p.is_bestseller,
        isNew: p.is_new,
        isSample: p.is_sample,
        inStock: p.in_stock,
        hoverImage: p.hover_image,
        tryOnAvailable: p.try_on_available,
        certifiedBy: p.certified_by
      }));
    }
  }

  // Local storage fallback: sync updated assets & variants while preserving local inventory adjustments
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const parsedMap = new Map(parsed.map((p) => [p.id, p]));
      return PRODUCTS.map((baseProduct) => {
        const cached = parsedMap.get(baseProduct.id);
        if (!cached) return baseProduct;
        return {
          ...baseProduct,
          stockQuantity: cached.stockQuantity !== undefined ? cached.stockQuantity : baseProduct.stockQuantity,
          inStock: cached.inStock !== undefined ? cached.inStock : baseProduct.inStock,
          isSample: cached.isSample !== undefined ? cached.isSample : baseProduct.isSample
        };
      });
    } catch (e) {
      return PRODUCTS;
    }
  }
  return PRODUCTS;
}

export async function saveProduct(productData) {
  if (isSupabaseConfigured && supabase) {
    const payload = {
      id: productData.id,
      name: productData.name,
      category: productData.category,
      collection: productData.collection,
      pillar: productData.pillar || '01. Everyday Gold Jewellery',
      price: productData.price,
      mrp: productData.mrp,
      metal: productData.metal,
      karat: productData.karat,
      weight: productData.weight,
      gold_weight_grams: productData.goldWeightGrams || 0,
      making_charges: productData.makingCharges || 0,
      diamond_kt: productData.diamondKt || '0.00',
      rating: productData.rating || 5.0,
      reviews_count: productData.reviewsCount || 0,
      is_bestseller: Boolean(productData.isBestseller),
      is_new: Boolean(productData.isNew),
      is_sample: Boolean(productData.isSample),
      in_stock: Boolean(productData.inStock),
      stock_quantity: parseInt(productData.stockQuantity, 10) || 0,
      image: productData.image,
      hover_image: productData.hoverImage || productData.image,
      description: productData.description,
      try_on_available: Boolean(productData.tryOnAvailable),
      certified_by: productData.certifiedBy || 'BIS Hallmark 750'
    };

    const { data, error } = await supabase
      .from('products')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Local storage fallback
  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  const index = products.findIndex((p) => p.id === productData.id);

  if (index >= 0) {
    products[index] = { ...products[index], ...productData };
  } else {
    products.unshift(productData);
  }

  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  return productData;
}

export async function updateProductStock(productId, newQuantity, inStockValue) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('products')
      .update({
        stock_quantity: newQuantity,
        in_stock: inStockValue !== undefined ? inStockValue : newQuantity > 0
      })
      .eq('id', productId);

    if (error) throw error;
  }

  // Local storage fallback
  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  const index = products.findIndex((p) => p.id === productId);
  if (index >= 0) {
    products[index].stockQuantity = newQuantity;
    products[index].inStock = inStockValue !== undefined ? inStockValue : newQuantity > 0;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
}

export async function deleteProduct(productId) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
  }

  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  const filtered = products.filter((p) => p.id !== productId);
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
}

// ==============================================================================
// ORDERS REPOSITORY
// ==============================================================================

export async function createOrderRecord(orderPayload, items) {
  // Deduct stock for each purchased item
  for (const item of items) {
    const currentProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    const p = currentProducts.find((prod) => prod.id === item.id);
    if (p) {
      const nextStock = Math.max(0, (p.stockQuantity ?? 10) - item.qty);
      await updateProductStock(p.id, nextStock, nextStock > 0);
    }
  }

  if (isSupabaseConfigured && supabase) {
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderPayload.order_number,
        user_id: orderPayload.user_id || null,
        customer_name: orderPayload.customer_name,
        customer_email: orderPayload.customer_email,
        customer_phone: orderPayload.customer_phone,
        shipping_address: orderPayload.shipping_address,
        subtotal: orderPayload.subtotal,
        discount: orderPayload.discount,
        gift_wrap_fee: orderPayload.gift_wrap_fee,
        tax: orderPayload.tax,
        shipping_fee: orderPayload.shipping_fee,
        total_amount: orderPayload.total_amount,
        payment_method: orderPayload.payment_method,
        payment_status: orderPayload.payment_status,
        razorpay_order_id: orderPayload.razorpay_order_id,
        razorpay_payment_id: orderPayload.razorpay_payment_id,
        razorpay_signature: orderPayload.razorpay_signature,
        order_status: orderPayload.order_status || 'confirmed',
        tracking_number: orderPayload.tracking_number,
        courier_partner: 'BlueDart Insured Luxury Express'
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // Insert order line items
    const orderItemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      unit_price: item.unitPrice,
      quantity: item.qty,
      total_price: item.totalPrice
    }));

    await supabase.from('order_items').insert(orderItemsPayload);
    return order;
  }

  // Local storage fallback
  const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  const fullOrder = {
    id: 'ord-' + Math.random().toString(36).substring(2, 9),
    ...orderPayload,
    items,
    created_at: new Date().toISOString()
  };
  orders.unshift(fullOrder);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  return fullOrder;
}

export async function fetchCustomerOrders(userEmail, userId) {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (userEmail) {
      query = query.eq('customer_email', userEmail);
    }

    const { data, error } = await query;
    if (!error && data) return data;
  }

  const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  if (!userEmail && !userId) return orders;
  return orders.filter(
    (o) =>
      (userEmail && o.customer_email?.toLowerCase() === userEmail.toLowerCase()) ||
      (userId && o.user_id === userId)
  );
}

export async function fetchAllOrdersForAdmin() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (!error && data) return data;
  }

  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
}

export async function updateOrderStatus(orderId, newStatus, trackingNumber) {
  if (isSupabaseConfigured && supabase) {
    const updatePayload = { order_status: newStatus };
    if (trackingNumber) updatePayload.tracking_number = trackingNumber;

    const { error } = await supabase.from('orders').update(updatePayload).eq('id', orderId);
    if (error) throw error;
  }

  const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
  const target = orders.find((o) => o.id === orderId || o.order_number === orderId);
  if (target) {
    target.order_status = newStatus;
    if (trackingNumber) target.tracking_number = trackingNumber;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }
}
