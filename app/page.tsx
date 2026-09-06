'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from './lib/supabase';
import ProductCard from './components/product/ProductCard';

interface Product {
  slug: string;
  title: string;
  category: string;
  price: number;
  stock: { XS: number; S: number; M: number; L: number; XL: number };
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const SUPABASE_STORAGE_URL = "https://lujfahankslcpcywiugh.supabase.co/storage/v1/object/public/products";

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data);
    }
    fetchProducts();
  }, []);

  return (
    <div className="font-sans bg-creme min-h-screen text-anthracite">
      <section className="relative h-[80vh] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src="/images/ma-boutique.jpeg"
          alt="Maison Lucette La Baule" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="relative z-20 text-center max-w-3xl px-4">
          <span className="text-xs uppercase tracking-[0.3em] mb-4 block text-creme">49 Avenue de Gaulle, La Baule</span>
          <h1 className="text-4xl md:text-6xl font-serif mb-6">L'Élégance Balnéaire</h1>
          <p className="text-sm md:text-base text-gray-200 mb-8 max-w-xl mx-auto font-light tracking-wide">
            Découvrez notre sélection exclusive de pièces d'exception pensées pour le littoral.
          </p>
          <Link 
            href="/boutique"
            className="inline-block bg-creme text-anthracite px-8 py-4 text-xs uppercase tracking-widest font-bold hover:bg-sable hover:text-white transition-colors"
          >
            Découvrir la collection
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-between items-end mb-12 border-b border-gray-200 pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">Nouveautés</span>
            <h2 className="text-3xl font-serif text-anthracite">Les Incontournables</h2>
          </div>
          <Link href="/boutique" className="text-xs uppercase tracking-widest text-sable hover:underline font-bold">
            Voir tout le catalogue →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="mb-4">Aucun produit pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {products.slice(0, 3).map((product) => (
              <ProductCard 
                key={product.slug} 
                product={{
                  slug: product.slug,
                  title: product.title,
                  price: product.price,
                  category: product.category,
                  image1: `${SUPABASE_STORAGE_URL}/${product.slug}-1.jpg`,
                  image2: `${SUPABASE_STORAGE_URL}/${product.slug}-2.jpg`,
                }} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}