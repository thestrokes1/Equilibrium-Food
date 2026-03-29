import { useState } from 'react';
import { useCart } from '../context/CartContext';
import TopBar from '../components/layout/TopBar';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import MenuSection from '../components/sections/MenuSection';
import DealsSection from '../components/sections/DealsSection';
import Footer from '../components/layout/Footer';
import products from '../features/products/productData';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = useCart();

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(p => {
    const matchesCategory =
      selectedCategory === 'all' || p.category === selectedCategory;
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
        <Hero />
        <MenuSection
          categories={categories}
          products={filteredProducts}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onAddToCart={addItem}
        />
        <DealsSection />
      </main>
      <Footer />
    </div>
  );
}