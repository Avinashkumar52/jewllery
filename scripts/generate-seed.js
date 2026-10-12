import fs from 'fs';
import { PRODUCTS } from '../src/data/products.js';

let sql = `-- ==============================================================================
-- KYAARI JEWELLERY - INITIAL SEED DATA
-- ==============================================================================

INSERT INTO public.products (
  id, name, category, collection, pillar, price, mrp, metal, karat, weight,
  gold_weight_grams, making_charges, diamond_kt, rating, reviews_count,
  is_bestseller, is_new, is_sample, in_stock, stock_quantity, image, hover_image,
  description, try_on_available, certified_by
)
VALUES
`;

const esc = (s) => (s ? `'${String(s).replace(/'/g, "''")}'` : 'NULL');

const rows = PRODUCTS.map((p) => {
  return `  (${esc(p.id)}, ${esc(p.name)}, ${esc(p.category)}, ${esc(p.collection)}, ${esc(p.pillar)}, ${p.price}, ${p.mrp}, ${esc(p.metal)}, ${esc(p.karat)}, ${esc(p.weight)}, ${p.goldWeightGrams || 0}, ${p.makingCharges || 0}, ${esc(p.diamondKt || '0.00')}, ${p.rating || 4.9}, ${p.reviewsCount || 0}, ${p.isBestseller ? 'true' : 'false'}, ${p.isNew ? 'true' : 'false'}, ${p.isSample ? 'true' : 'false'}, ${p.inStock ? 'true' : 'false'}, 12, ${esc(p.image)}, ${esc(p.hoverImage)}, ${esc(p.description)}, ${p.tryOnAvailable ? 'true' : 'false'}, ${esc(p.certifiedBy || 'BIS Hallmark 750')})`;
});

sql += rows.join(',\n') + `
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  stock_quantity = EXCLUDED.stock_quantity,
  in_stock = EXCLUDED.in_stock;
`;

fs.writeFileSync('./supabase/seed.sql', sql);
console.log(`Generated supabase/seed.sql with ${PRODUCTS.length} products.`);
