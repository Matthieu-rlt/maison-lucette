'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FavorisPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadFavorites = () => {
      try {
        const favs = JSON.parse(localStorage.getItem('maison_lucette_favorites') || '[]');
        setFavorites(favs);
      } catch (e) {
        setFavorites([]);
      }
    };

    loadFavorites();

    window.addEventListener('favorites-updated', loadFavorites);
    window.addEventListener('storage', loadFavorites);

    return () => {
      window.removeEventListener('favorites-updated', loadFavorites);
      window.removeEventListener('storage', loadFavorites);
    };
  }, []);

  const removeFavorite = (slug: string) => {
    const updated = favorites.filter((item: any) => item.slug !== slug);
    setFavorites(updated);
    localStorage.setItem('maison_lucette_favorites', JSON.stringify(updated));
    window.dispatchEvent(new Event('favorites-updated'));
  };

  if (!mounted) {
    return <div className="max-w-4xl mx-auto px-4 py-32 text-center text-gray-500 font-sans">Chargement de vos favoris...</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 font-sans">
      <h1 className="text-2xl font-light tracking-wide mb-8 uppercase text-center text-anthracite">Mes Favoris</h1>

      {favorites.length === 0 ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">Vous n'avez aucun favori pour le moment.</p>
          <Link href="/boutique" className="inline-block bg-anthracite text-white px-6 py-3 text-xs uppercase tracking-widest rounded">
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {favorites.map((product, idx) => (
            <div key={idx} className="group flex flex-col space-y-4 bg-white p-4 rounded border border-gray-100 shadow-sm">
              <Link href={`/produit/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100 rounded">
                <img 
                  src={product.image1} 
                  alt={product.title} 
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
              </Link>

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">{product.category}</span>
                  <Link href={`/produit/${product.slug}`} className="text-sm font-medium text-anthracite hover:underline">
                    {product.title}
                  </Link>
                </div>
                <span className="text-sm font-semibold text-anthracite">{(Number(product.price) || 0).toFixed(2)} €</span>
              </div>

              <button
                onClick={() => removeFavorite(product.slug)}
                className="w-full border border-anthracite text-anthracite py-2 text-[10px] uppercase tracking-widest hover:bg-anthracite hover:text-white transition-colors rounded cursor-pointer"
              >
                Retirer des favoris
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}