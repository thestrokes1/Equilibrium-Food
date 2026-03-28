import { useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import MenuSection from '../components/sections/MenuSection';
import DealsSection from '../components/sections/DealsSection';
import Footer from '../components/layout/Footer';
import products from '../features/products/productData';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartCount, setCartCount] = useState(0);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(p => p.category === selectedCategory);

  const handleAddToCart = () => setCartCount(c => c + 1);

  return (
    <div className="page-root">
      <TopBar />
      <Navbar cartCount={cartCount} />
      <main>
        <Hero />
        <MenuSection
          categories={categories}
          products={filteredProducts}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddToCart={handleAddToCart}
        />
        <DealsSection />
      </main>
      <Footer />
    </div>
  );
}