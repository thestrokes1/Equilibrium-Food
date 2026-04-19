import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import TopBar from '@/components/layout/TopBar';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import MenuSection from '@/components/sections/MenuSection';
import DealsSection from '@/components/sections/DealsSection';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/ui/Seo';
import { getProducts } from '@/services/productService';
import type { Product, SortOption } from '@/types/product';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { addItem } = useCart();
  const location = useLocation();

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setDataLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [location.hash]);

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
      <Seo />
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
