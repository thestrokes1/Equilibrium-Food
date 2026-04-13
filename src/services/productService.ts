import { supabase } from '@/lib/supabase';
import type { Product, DbMenuItem } from '@/types/product';
import localProducts from '@/features/products/productData';

function dbItemToProduct(item: DbMenuItem): Product {
  return {
    id: item.id as unknown as number,
    name: item.name,
    price: Number(item.price),
    image: item.image_url ?? '/images/smash-burger.jpg',
    category: item.category,
    rating: Number(item.rating),
    deliveryTime: item.delivery_time,
    restaurant: item.restaurants?.name ?? '',
    description: item.description ?? undefined,
    badge: item.badge_type
      ? { type: item.badge_type, label: item.badge_label ?? item.badge_type }
      : undefined,
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, restaurants(name)')
    .eq('is_available', true)
    .order('sort_order');

  if (error) {
    // Real network / auth error — let caller handle it
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    // DB is empty (fresh project) — silently fall back to local seed
    return localProducts;
  }

  return (data as DbMenuItem[]).map(dbItemToProduct);
}

export async function getCategories(): Promise<string[]> {
  const products = await getProducts();
  return Array.from(new Set(products.map((p) => p.category)));
}

export async function getMenuItemById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, restaurants(name)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return dbItemToProduct(data as DbMenuItem);
}
