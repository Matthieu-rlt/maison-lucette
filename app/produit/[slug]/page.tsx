'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [colors, setColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('38');
  
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const SUPABASE_STORAGE_URL = "https://lujfahankslcpcywiugh.supabase.co/storage/v1/object/public/products";

  const knownSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40', '42', '44', '46', '48', 'Taille Unique'];

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) {
        setProduct(data);
        
        let stockObj = data.stock;
        if (typeof stockObj === 'string') {
          try { stockObj = JSON.parse(stockObj); } catch (e) { stockObj = {}; }
        }

        const keys = Object.keys(stockObj || {});
        const isFlat = keys.length > 0 && knownSizes.includes(keys[0]);

        if (isFlat) {
          setColors([]);
          const firstAvailable = Object.keys(stockObj).find(s => Number(stockObj[s]) > 0) || Object.keys(stockObj)[0];
          if (firstAvailable) setSelectedSize(firstAvailable);
        } else {
          setColors(keys);
          if (keys.length > 0) {
            setSelectedColor(keys[0]);
            const colorStock = stockObj[keys[0]] || {};
            const firstAvailable = Object.keys(colorStock).find(s => Number(colorStock[s]) > 0) || Object.keys(colorStock)[0];
            if (firstAvailable) setSelectedSize(firstAvailable);
          }
        }

        try {
          const favs = JSON.parse(localStorage.getItem('maison_lucette_favorites') || '[]');
          setIsFavorite(favs.some((fav: any) => fav.slug === data.slug));
        } catch (e) {
          setIsFavorite(false);
        }
      }
      setLoading(false);
    }
    if (slug) fetchProduct();

    const savedCart = JSON.parse(localStorage.getItem('maison_lucette_cart') || '[]');
    setCartItems(savedCart);
  }, [slug]);

  useEffect(() => {
    if (!product) return;

    async function loadImages() {
      const validImages: string[] = [];
      const colorSlug = selectedColor && selectedColor !== 'Unique' ? selectedColor.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';

      if (colorSlug) {
        for (let i = 1; i <= 8; i++) {
          const url = `${SUPABASE_STORAGE_URL}/${product.slug}-${colorSlug}-${i}.jpg`;
          const exists = await new Promise<boolean>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
          });
          if (exists) validImages.push(url);
        }
      }

      if (validImages.length === 0) {
        for (let i = 1; i <= 8; i++) {
          const url = `${SUPABASE_STORAGE_URL}/${product.slug}-${i}.jpg`;
          const exists = await new Promise<boolean>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
          });
          if (exists) validImages.push(url);
        }
      }

      if (validImages.length === 0) {
        validImages.push(`${SUPABASE_STORAGE_URL}/${product.slug}-1.jpg`);
      }

      setImages(validImages);
      setCurrentImageIndex(0);
    }

    loadImages();
  }, [selectedColor, product]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    let stockObj = product.stock;
    if (typeof stockObj === 'string') {
      try { stockObj = JSON.parse(stockObj); } catch (e) { stockObj = {}; }
    }
    const colorStock = stockObj[color] || {};
    const firstAvailableSize = Object.keys(colorStock).find(s => Number(colorStock[s]) > 0) || Object.keys(colorStock)[0];
    if (firstAvailableSize) setSelectedSize(firstAvailableSize);
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const toggleFavorite = () => {
    if (!product) return;
    try {
      const favs = JSON.parse(localStorage.getItem('maison_lucette_favorites') || '[]');
      let updatedFavs;
      
      const productObj = {
        slug: product.slug,
        title: product.title,
        price: product.price,
        category: product.category,
        image1: `${SUPABASE_STORAGE_URL}/${product.slug}-1.jpg`,
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

  const handleAddToCart = () => {
    if (!product) return;

    let stockObj = product.stock;
    if (typeof stockObj === 'string') {
      try { stockObj = JSON.parse(stockObj); } catch (e) { stockObj = {}; }
    }

    const keys = Object.keys(stockObj || {});
    const isFlat = keys.length > 0 && knownSizes.includes(keys[0]);
    const currentStock = isFlat ? Number(stockObj[selectedSize] ?? 0) : Number(stockObj[selectedColor]?.[selectedSize] ?? 0);

    if (currentStock <= 0) {
      alert("Cette taille est actuellement épuisée.");
      return;
    }

    const itemLabel = selectedColor && selectedColor !== 'Unique' 
      ? `${product.title} (Couleur : ${selectedColor} / Taille : ${selectedSize})`
      : `${product.title} (Taille : ${selectedSize})`;

    const newItem = {
      name: itemLabel,
      price: product.price,
      image: images[0] || `${SUPABASE_STORAGE_URL}/${product.slug}-1.jpg`,
      quantity: 1,
      color: selectedColor,
      size: selectedSize,
    };

    const currentCart = JSON.parse(localStorage.getItem('maison_lucette_cart') || '[]');
    const existingIndex = currentCart.findIndex((item: any) => item.name === newItem.name);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity = (Number(currentCart[existingIndex].quantity) || 1) + 1;
    } else {
      currentCart.push(newItem);
    }

    localStorage.setItem('maison_lucette_cart', JSON.stringify(currentCart));
    setCartItems(currentCart);
    setCartOpen(true);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cartItems];
    const newQty = (Number(updated[index].quantity) || 1) + delta;
    if (newQty > 0) {
      updated[index].quantity = newQty;
    } else {
      updated.splice(index, 1);
    }
    setCartItems(updated);
    localStorage.setItem('maison_lucette_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-32 text-center text-gray-500">Chargement de la pièce...</div>;
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-32 text-center text-gray-500">Produit introuvable.</div>;
  }

  let stockObj = product.stock;
  if (typeof stockObj === 'string') {
    try { stockObj = JSON.parse(stockObj); } catch (e) { stockObj = {}; }
  }

  const keys = Object.keys(stockObj || {});
  const isFlat = keys.length > 0 && knownSizes.includes(keys[0]);
  const currentSizes = isFlat ? stockObj : (stockObj[selectedColor] || {});
  const isTailleUniqueProduct = currentSizes['Taille Unique'] !== undefined;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
      <div className="grid md:grid-cols-2 gap-12">
        
        {/* COLONNE GAUCHE : GALERIE DE PHOTOS */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-gray-100 rounded overflow-hidden group">
            <img 
              src={images[currentImageIndex] || `${SUPABASE_STORAGE_URL}/${product.slug}-1.jpg`} 
              alt={product.title} 
              className="w-full h-full object-cover transition-all duration-300"
            />

            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
                  aria-label="Image précédente"
                >
                  ❮
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
                  aria-label="Image suivante"
                >
                  ❯
                </button>
              </>
            )}

            <button
              onClick={toggleFavorite}
              className="absolute top-4 right-4 p-2.5 bg-white/80 hover:bg-white rounded-full transition-colors shadow-sm cursor-pointer"
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
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((imgSrc, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative w-20 aspect-[3/4] rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                  currentImageIndex === idx ? 'border-anthracite opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgSrc} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* COLONNE DROITE : INFORMATIONS PRODUIT */}
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-gray-400">{product.category}</span>
            <h1 className="text-3xl font-serif text-anthracite mt-1">{product.title}</h1>
            <p className="text-xl font-semibold text-anthracite mt-4">{Number(product.price).toFixed(2)} €</p>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

          {/* SÉLECTION DES COULEURS (SI MULTI-COULEURS) */}
          {!isFlat && colors.length > 1 && (
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-anthracite font-semibold block">
                Couleur : <span className="font-normal text-gray-600">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={`px-4 py-2 border text-xs transition-colors rounded ${
                      selectedColor === color 
                        ? 'border-anthracite bg-anthracite text-white font-semibold' 
                        : 'border-gray-300 text-anthracite hover:border-anthracite bg-white'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SÉLECTION DES TAILLES SUR DEUX LIGNES */}
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-wider text-anthracite font-semibold block">Taille & Stock</span>
            
            {isTailleUniqueProduct ? (
              <div>
                {(() => {
                  const stockValue = Number(currentSizes['Taille Unique'] || 0);
                  const isOutOfStock = stockValue <= 0;
                  return (
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize('Taille Unique')}
                      className={`px-6 py-3 border text-xs transition-colors rounded flex flex-col items-center gap-1 min-w-[140px] ${
                        isOutOfStock 
                          ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through' 
                          : selectedSize === 'Taille Unique' 
                            ? 'border-anthracite bg-anthracite text-white' 
                            : 'border-gray-300 text-anthracite hover:border-anthracite'
                      }`}
                    >
                      <span className="font-bold">Taille Unique</span>
                      <span className={`text-[10px] ${selectedSize === 'Taille Unique' ? 'text-gray-200' : 'text-gray-400'}`}>
                        {isOutOfStock ? 'Épuisé' : `${stockValue} en stock`}
                      </span>
                    </button>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Ligne 1 : Tailles standard (Lettres incluant XL) */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Tailles standard :</span>
                  <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                      const stockValue = Number(currentSizes[size] || 0);
                      const isOutOfStock = stockValue <= 0;
                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-2 border text-xs transition-colors rounded flex flex-col items-center min-w-[48px] ${
                            isOutOfStock 
                              ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through' 
                              : selectedSize === size 
                                ? 'border-anthracite bg-anthracite text-white' 
                                : 'border-gray-300 text-anthracite hover:border-anthracite'
                          }`}
                        >
                          <span className="font-bold">{size}</span>
                          <span className={`text-[9px] ${selectedSize === size ? 'text-gray-200' : 'text-gray-400'}`}>
                            {isOutOfStock ? 'Épuisé' : stockValue}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ligne 2 : Tailles françaises (34 au 48) */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Tailles françaises :</span>
                  <div className="flex flex-wrap gap-2">
                    {['34', '36', '38', '40', '42', '44', '46', '48'].map((size) => {
                      const stockValue = Number(currentSizes[size] || 0);
                      const isOutOfStock = stockValue <= 0;
                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-2 border text-xs transition-colors rounded flex flex-col items-center min-w-[44px] ${
                            isOutOfStock 
                              ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through' 
                              : selectedSize === size 
                                ? 'border-anthracite bg-anthracite text-white' 
                                : 'border-gray-300 text-anthracite hover:border-anthracite'
                          }`}
                        >
                          <span className="font-bold">{size}</span>
                          <span className={`text-[9px] ${selectedSize === size ? 'text-gray-200' : 'text-gray-400'}`}>
                            {isOutOfStock ? 'Épuisé' : stockValue}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-anthracite text-white py-4 text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors rounded cursor-pointer"
          >
            Ajouter au panier
          </button>
        </div>
      </div>

      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b pb-4">
                  <h2 className="text-sm uppercase tracking-wider font-semibold text-anthracite">Votre Panier</h2>
                  <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-black text-lg">✕</button>
                </div>

                <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-10">Votre panier est vide.</p>
                  ) : (
                    cartItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b pb-4 text-xs">
                        <div className="flex items-center gap-3">
                          {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded border" />}
                          <div>
                            <p className="font-medium text-anthracite">{item.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <button onClick={() => updateQuantity(idx, -1)} className="px-1.5 border rounded">-</button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(idx, 1)} className="px-1.5 border rounded">+</button>
                            </div>
                          </div>
                        </div>
                        <span className="font-semibold">{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)} €</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-sm font-semibold text-anthracite">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <p className="text-[10px] text-gray-400">Taxes et frais de port calculés à l'étape de paiement.</p>
                <Link
                  href="/checkout"
                  className="block text-center w-full bg-anthracite text-white py-4 text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors rounded"
                >
                  Commander
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
