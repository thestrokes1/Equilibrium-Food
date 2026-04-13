import { supabase } from '@/lib/supabase';
import type { DbRestaurant, DbMenuItem, Product } from '@/types/product';

function dbItemToProduct(item: DbMenuItem & { restaurants?: DbRestaurant }): Product {
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

export async function getRestaurants(): Promise<DbRestaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw new Error(error.message);
  return (data as DbRestaurant[]) ?? [];
}

export async function getRestaurantBySlug(slug: string): Promise<DbRestaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as DbRestaurant;
}

export async function getMenuItemsByRestaurant(restaurantId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, restaurants(name)')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('sort_order');

  if (error) throw new Error(error.message);
  return ((data as (DbMenuItem & { restaurants?: DbRestaurant })[]) ?? []).map(dbItemToProduct);
}
