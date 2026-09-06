'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateCounts = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('maison_lucette_cart') || '[]');
        setCartCount(cart.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0));

        const favs = JSON.parse(localStorage.getItem('maison_lucette_favorites') || '[]');
        setFavCount(Array.isArray(favs) ? favs.length : 0);
      } catch (e) {
        setCartCount(0);
        setFavCount(0);
      }
    };

    updateCounts();

    window.addEventListener('storage', updateCounts);
    window.addEventListener('cart-updated', updateCounts);
    window.addEventListener('favorites-updated', updateCounts);
    window.addEventListener('focus', updateCounts);

    return () => {
      window.removeEventListener('storage', updateCounts);
      window.removeEventListener('cart-updated', updateCounts);
      window.removeEventListener('favorites-updated', updateCounts);
      window.removeEventListener('focus', updateCounts);
    };
  }, []);

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-search'));
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 py-6 px-8 flex justify-between items-center font-sans">
      <nav className="flex items-center gap-8 text-xs uppercase tracking-widest text-anthracite">
        <Link href="/boutique" className="hover:text-gray-500 transition-colors">Boutique</Link>
        <Link href="/la-boutique" className="hover:text-gray-500 transition-colors">La Boutique (La Baule)</Link>
        <Link href="/contact" className="hover:text-gray-500 transition-colors">Contact</Link>
      </nav>

      <div>
        <Link href="/" className="text-xl tracking-widest uppercase font-serif text-anthracite">
          Maison Lucette
        </Link>
      </div>

      <div className="flex items-center gap-6 text-xs uppercase tracking-widest text-anthracite">
        <button 
          onClick={openSearch}
          className="hover:text-gray-500 transition-colors flex items-center gap-1.5 bg-transparent border-none cursor-pointer uppercase tracking-widest text-xs text-anthracite"
        >
          <span>🔍</span> Rechercher
        </button>
        
        <Link href="/favoris" className="relative inline-flex items-center gap-1.5 hover:text-gray-500 transition-colors">
          <span>❤️</span> Favoris
          {mounted && favCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-anthracite text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {favCount}
            </span>
          )}
        </Link>

        <Link href="/checkout" className="relative inline-flex items-center gap-1.5 hover:text-gray-500 transition-colors">
          <span>🛍️</span> Panier
          {mounted && cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-anthracite text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Link>

        <Link href="/compte" className="hover:text-gray-500 transition-colors flex items-center gap-1.5">
          <span>👤</span> Compte
        </Link>
      </div>
    </header>
  );
}