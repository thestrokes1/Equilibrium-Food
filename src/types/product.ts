export interface Badge {
  type: 'sale' | 'new' | 'popular';
  label: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  deliveryTime: string;
  restaurant: string;
  badge?: Badge;
}

export interface FoodCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  rating?: number;
  deliveryTime?: string;
  restaurant?: string;
  badge?: Badge;
  onAdd: () => void;
}

export interface MenuSectionProps {
  categories: string[];
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onAddToCart: () => void;
}
