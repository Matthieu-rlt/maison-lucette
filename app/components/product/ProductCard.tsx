'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    slug: string;
    title: string;
    price: number;
    category: string;
    image1: string;
    image2?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
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
      
      if (isFavorite) {
        updatedFavs = favs.filter((fav: any) => fav.slug !== product.slug);
      } else {
        updatedFavs = [...favs, product];
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
    
    const cartItem = {
      name: product.title,
      price: product.price,
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

  return (
    <div className="group flex flex-col space-y-4 relative">
      <Link href={`/produit/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100 rounded">
        <img 
          src={product.image1} 
          alt={product.title} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Bouton Cœur Favoris */}
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
        <span className="text-sm font-semibold text-anthracite">{product.price.toFixed(2)} €</span>
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