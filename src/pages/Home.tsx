import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import TopBar from '@/components/layout/TopBar';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import MenuSection from '@/components/sections/MenuSection';
import DealsSection from '@/components/sections/DealsSection';
import Footer from '@/components/layout/Footer';
import { getProducts } from '@/services/productService';
import type { Product } from '@/types/product';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setDataLoading(false);
    });
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.restaurant?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
          onAddToCart={addItem}
          initialLoading={dataLoading}
        />
        <DealsSection onSelectCategory={setSelectedCategory} />
      </main>
      <Footer />
    </div>
  );
}
