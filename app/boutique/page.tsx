'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

interface Product {
  slug: string;
  title: string;
  category: string;
  price: number;
  discount?: number;
  description?: string;
  stock: any;
}

interface ProductCardProps {
  product: {
    slug: string;
    title: string;
    price: number;
    discount?: number;
    category: string;
    image1: string;
    image2?: string;
  };
}

function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('maison_lucette_favorites') || '[]');
      setIsFavorite(favs.some((fav: any) => fav.slug === product.slug));
    } catch (e) {
      setIsFavorite(false);
    }
  }, [product.slug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const favs = JSON.parse(localStorage.getItem('maison_lucette_favorites') || '[]');
      let updatedFavs;
      
      const discountVal = Number(product.discount || 0);
      const finalPrice = discountVal > 0 ? product.price * (1 - discountVal / 100) : product.price;

      const productObj = {
        slug: product.slug,
        title: product.title,
        price: finalPrice,
        category: product.category,
        image1: product.image1,
      };

      if (isFavorite) {
        updatedFavs = favs.filter((fav: any) => fav.slug !== product.slug);
      } else {
        updatedFavs = [...favs, productObj];
      }

      localStorage.setItem('maison_lucette_favorites', JSON.stringify(updatedFavs));
      setIsFavorite(!isFavorite);
      window.dispatchEvent(new Event('favorites-updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const discountVal = Number(product.discount || 0);
    const finalPrice = discountVal > 0 ? product.price * (1 - discountVal / 100) : product.price;

    const cartItem = {
      name: product.title,
      price: finalPrice,
      image: product.image1,
      quantity: 1,
    };

    const currentCart = JSON.parse(localStorage.getItem('maison_lucette_cart') || '[]');
    const existingIndex = currentCart.findIndex((item: any) => item.name === cartItem.name);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity = (Number(currentCart[existingIndex].quantity) || 1) + 1;
    } else {
      currentCart.push(cartItem);
    }

    localStorage.setItem('maison_lucette_cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cart-updated'));
    alert('Article ajouté au panier avec succès !');
  };

  const discountVal = Number(product.discount || 0);
  const hasDiscount = discountVal > 0;
  const finalPrice = hasDiscount ? product.price * (1 - discountVal / 100) : product.price;

  return (
    <div className="group flex flex-col space-y-4 relative">
      <Link href={`/produit/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100 rounded">
        <img 
          src={product.image1} 
          alt={product.title} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />

        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded">
            -{discountVal}%
          </span>
        )}
        
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-sm cursor-pointer"
          aria-label="Favoris"
        >
          <svg 
            className={`w-5 h-5 transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600 fill-transparent'}`} 
            stroke="currentColor" 
            strokeWidth="1.5" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">{product.category}</span>
          <Link href={`/produit/${product.slug}`} className="text-sm font-medium text-anthracite hover:underline">
            {product.title}
          </Link>
        </div>
        <div className="text-right">
          {hasDiscount ? (
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-red-600">{finalPrice.toFixed(2)} €</span>
              <span className="text-xs text-gray-400 line-through">{product.price.toFixed(2)} €</span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-anthracite">{product.price.toFixed(2)} €</span>
          )}
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full bg-anthracite text-white py-2.5 text-[10px] uppercase tracking-widest hover:bg-opacity-90 transition-colors rounded cursor-pointer"
      >
        Ajouter au panier
      </button>
    </div>
  );
}

export default function BoutiquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const SUPABASE_STORAGE_URL = "https://lujfahankslcpcywiugh.supabase.co/storage/v1/object/public/products";

  const categories = ['Tous', 'Vestes', 'Manteaux', 'Maille', 'Accessoires', 'Chemises', 'Tops', 'Hauts', 'Blouses'];

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error('Erreur chargement produits:', error);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory === 'Tous' 
    ? products 
    : products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-32 text-center font-sans text-gray-500">Chargement de la collection...</div>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">Maison Lucette - La Baule</span>
          <h1 className="text-3xl md:text-4xl font-serif text-anthracite">La Collection</h1>
        </div>
        <p className="text-xs uppercase tracking-widest text-gray-500 mt-4 md:mt-0">
          {filteredProducts.length} pièces disponibles
        </p>
      </div>

      {/* BARRE DE FILTRES DÉFILANTE HORIZONTALE */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 text-xs uppercase tracking-widest whitespace-nowrap transition-colors rounded ${
              selectedCategory === cat 
                ? 'bg-anthracite text-white font-semibold' 
                : 'bg-white text-anthracite border border-gray-200 hover:border-anthracite'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-xs uppercase tracking-widest">
          Aucune pièce disponible dans cette catégorie pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.slug} 
              product={{
                slug: product.slug,
                title: product.title,
                price: product.price,
                discount: product.discount,
                category: product.category,
                image1: `${SUPABASE_STORAGE_URL}/${product.slug}-1.jpg`,
                image2: `${SUPABASE_STORAGE_URL}/${product.slug}-2.jpg`,
              }} 
            />
          ))}
        </div>
      )}
    </main>
  );
}
