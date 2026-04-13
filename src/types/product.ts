// ─── Domain types ────────────────────────────────────────────────────────────

export interface Badge {
  type: 'sale' | 'new' | 'popular';
  label: string;
}

export interface Product {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
  restaurant: string;
  badge?: Badge;
  description?: string;
}

// ─── Supabase DB types ────────────────────────────────────────────────────────

export interface DbRestaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  category: string;
  rating: number;
  delivery_time_min: number;
  delivery_fee: number;
  min_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DbMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  badge_type: 'new' | 'popular' | 'sale' | null;
  badge_label: string | null;
  rating: number;
  delivery_time: string;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  restaurants?: DbRestaurant;
}

export interface DbAddress {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  zip: string | null;
  is_default: boolean;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface DbOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  qty: number;
  unit_price: number;
  item_name: string;
  item_image: string | null;
  created_at: string;
}

export interface DbOrder {
  id: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  address_snapshot: DbAddress | null;
  notes: string | null;
  estimated_minutes: number;
  created_at: string;
  updated_at: string;
  order_items?: DbOrderItem[];
}

export interface DbProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string | undefined;
  profile: DbProfile | null;
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem extends Product {
  qty: number;
  dbId?: string;
}

export interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (id: number | string) => void;
  updateQty: (id: number | string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: number;
  title: string;
  sub?: string;
  icon?: string;
  type: ToastType;
}

export interface AddToastOptions {
  title: string;
  sub?: string;
  icon?: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastContextValue {
  addToast: (options: AddToastOptions) => void;
}

// ─── Component props ─────────────────────────────────────────────────────────

export interface FoodCardProps extends Product {
  onAdd: (product: Product) => void;
}

export interface MenuSectionProps {
  categories: string[];
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  onAddToCart: (product: Product, qty?: number) => void;
  initialLoading?: boolean;
}

export interface DealsSectionProps {
  onSelectCategory: (category: string) => void;
}

export interface HeroProps {
  onSelectCategory: (category: string) => void;
}
