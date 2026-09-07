'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="w-full bg-white border-b border-gray-100 py-4 sm:py-6 px-4 sm:px-8 font-sans sticky top-0 z-50">
      
      {/* --- VERSION MOBILE --- */}
      <div className="flex items-center justify-between w-full md:hidden">
        <Link href="/" className="text-base tracking-widest uppercase font-serif text-anthracite">
          Maison Lucette
        </Link>

        <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-anthracite">
          <Link href="/checkout" className="relative inline-flex items-center hover:text-gray-500 transition-colors">
            <span>🛍️</span>
            {mounted && cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-anthracite text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          <button 
            onClick={openSearch}
            className="bg-transparent border-none cursor-pointer text-base text-anthracite p-0"
            aria-label="Rechercher"
          >
            <span>🔍</span>
          </button>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-transparent border-none cursor-pointer text-xl text-anthracite p-1 focus:outline-none"
            aria-label="Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* --- VERSION BUREAU (DESKTOP) --- */}
      <div className="hidden md:flex justify-between items-center w-full">
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
      </div>

      {/* --- MENU DÉROULANT MOBILE --- */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3 text-xs uppercase tracking-widest text-anthracite bg-white pb-2">
          <Link 
            href="/boutique" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-gray-500 transition-colors py-2"
          >
            Boutique
          </Link>
          <Link 
            href="/la-boutique" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-gray-500 transition-colors py-2"
          >
            La Boutique (La Baule)
          </Link>
          <Link 
            href="/favoris" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-gray-500 transition-colors py-2 flex items-center justify-between"
          >
            <span>Favoris</span>
            {mounted && favCount > 0 && (
              <span className="bg-anthracite text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {favCount}
              </span>
            )}
          </Link>
          <Link 
            href="/compte" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-gray-500 transition-colors py-2"
          >
            Mon Compte
          </Link>
          <Link 
            href="/contact" 
            onClick={() => setMobileMenuOpen(false)}
            className="hover:text-gray-500 transition-colors py-2"
          >
            Contact
          </Link>
        </nav>
      )}
    </header>
  );
}
