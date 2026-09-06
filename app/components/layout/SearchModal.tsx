'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const SUPABASE_STORAGE_URL = "https://lujfahankslcpcywiugh.supabase.co/storage/v1/object/public/products";

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-search', handleOpen);
    return () => window.removeEventListener('open-search', handleOpen);
  }, []);

  // Recherche instantanée dans Supabase ciblée sur le titre
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // On cible directement 'title' puisque c'est ce que ton site utilise
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('title', `%${query}%`)
          .limit(5);

        if (error) {
          console.error("Erreur Supabase:", error);
        } else {
          console.log("Produits trouvés :", data);
          setResults(data || []);
        }
      } catch (err) {
        console.error('Erreur technique :', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
      <div className="bg-white w-full max-w-2xl rounded shadow-2xl p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* En-tête de la modale */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <h3 className="text-sm font-serif uppercase tracking-widest text-anthracite">🔍 Rechercher une pièce</h3>
          <button 
            onClick={() => { setIsOpen(false); setQuery(''); setResults([]); }}
            className="text-gray-400 hover:text-anthracite text-lg"
          >
            ✕
          </button>
        </div>

        {/* Champ de saisie */}
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tapez un nom de pièce (ex: veste, robe...)"
            className="w-full text-sm p-4 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:ring-1 focus:ring-anthracite focus:border-anthracite outline-none transition-all"
            autoFocus
          />
        </div>

        {/* Liste des résultats en direct */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          {isLoading && (
            <p className="text-center text-xs text-gray-400 py-4">Recherche en cours...</p>
          )}

          {!isLoading && query.trim() && results.length === 0 && (
            <p className="text-center text-xs text-gray-500 py-4">Aucun produit trouvé pour "{query}".</p>
          )}

          {results.map((product) => {
            const productName = product.title || 'Pièce Maison Lucette';
            const productImage = product.slug 
              ? `${SUPABASE_STORAGE_URL}/${product.slug}-1.jpg` 
              : '/images/Image_magasin.jpeg';
            const productPrice = Number(product.price) || 0;

            return (
              <Link
                key={product.id || product.slug}
                href={`/produit/${product.slug || product.id}`}
                onClick={() => { setIsOpen(false); setQuery(''); setResults([]); }}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded transition-colors border border-transparent hover:border-gray-100 group"
              >
                {/* Miniature du produit */}
                <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e: any) => {
                      // Si l'image Supabase échoue, bascule sur l'image par défaut
                      e.target.src = '/images/Image_magasin.jpeg';
                    }}
                  />
                </div>

                {/* Informations du produit */}
                <div className="flex-grow">
                  <h4 className="text-xs font-semibold text-anthracite uppercase tracking-wide">{productName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{productPrice.toFixed(2)} €</p>
                </div>

                <span className="text-xs text-gray-400 group-hover:text-anthracite transition-colors">Voir →</span>
              </Link>
            );
          })}
        </div>

        {/* Pied de la modale */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <span className="text-[10px] uppercase tracking-widest text-gray-400">Maison Lucette - La Baule</span>
          <button
            onClick={() => { setIsOpen(false); setQuery(''); setResults([]); }}
            className="bg-gray-100 text-anthracite px-6 py-2.5 text-xs uppercase tracking-widest rounded hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}