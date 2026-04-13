import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import TopBar from '@/components/layout/TopBar';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import MenuSection from '@/components/sections/MenuSection';
import DealsSection from '@/components/sections/DealsSection';
import Footer from '@/components/layout/Footer';
import { getProducts } from '@/services/productService';
import type { Product, SortOption } from '@/types/product';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { addItem } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        setDataLoading(false);
      })
      .catch(() => {
        setDataLoading(false);
        addToast({
          title: 'Could not load menu',
          sub: 'Check your connection and try refreshing',
          type: 'error',
          icon: '⚠️',
          duration: 6000,
        });
      });
  }, [addToast]);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.restaurant?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOption === 'rating_desc') return b.rating - a.rating;
      if (sortOption === 'price_asc') return a.price - b.price;
      if (sortOption === 'price_desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="page-root">
      <TopBar />
      <Navbar />
      <main>
        <Hero onSelectCategory={setSelectedCategory} />
        <MenuSection
          categories={categories}
          products={filteredProducts}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          sortOption={sortOption}
          onSort={setSortOption}
          onAddToCart={addItem}
          initialLoading={dataLoading}
        />
        <DealsSection onSelectCategory={setSelectedCategory} />
      </main>
      <Footer />
    </div>
  );
}
