'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function CheckoutPage() {
  const [items, setItems] = useState<any[]>([]);
  const [shippingMethod, setShippingMethod] = useState('pickup');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('maison_lucette_cart') || '[]');
    setItems(cart);
  }, []);

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...items];
    const newQty = (Number(updated[index].quantity) || 1) + delta;
    if (newQty > 0) {
      updated[index].quantity = newQty;
    } else {
      updated.splice(index, 1);
    }
    setItems(updated);
    localStorage.setItem('maison_lucette_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    localStorage.setItem('maison_lucette_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('maison_lucette_cart');
    window.dispatchEvent(new Event('cart-updated'));
  };

  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  
  // --- LIVRAISON OFFERTE À PARTIR DE 120 € ---
  const isFreeShipping = subtotal >= 120;
  const shippingCost = shippingMethod === 'europe' ? (isFreeShipping ? 0 : 15) : 0;
  const total = subtotal + shippingCost;

  const handleStripeCheckout = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || null;

      localStorage.setItem('maison_lucette_pending_cart', JSON.stringify(items));
      sessionStorage.removeItem('order_saved');

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingOption: shippingMethod,
          userEmail,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(text || 'Erreur serveur inconnue');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session Stripe');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Erreur:', err.message);
      alert('Erreur : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 font-sans">
      <h1 className="text-2xl font-light tracking-wide mb-8 uppercase text-center text-anthracite">Votre Panier</h1>
      
      {items.length === 0 ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">Votre panier est vide.</p>
          <Link href="/boutique" className="inline-block bg-anthracite text-white px-6 py-3 text-xs uppercase tracking-widest rounded">
            Retourner à la boutique
          </Link>
        </div>
      ) : (
        <div className="space-y-8 bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center border-b pb-4">
            <span className="text-xs uppercase tracking-wider text-gray-500">Articles ({items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0)})</span>
            <button 
              onClick={clearCart} 
              className="text-xs text-red-500 hover:text-red-700 uppercase tracking-widest cursor-pointer"
            >
              Vider le panier
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b pb-4 text-xs">
                <div className="flex items-center gap-4">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded border" />
                  )}
                  <div>
                    <p className="font-medium text-anthracite">{item.name || item.title || 'Article'}</p>
                    <p className="text-gray-400 mt-1">Prix unitaire : {Number(item.price || 0).toFixed(2)} €</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border rounded">
                        <button onClick={() => updateQuantity(idx, -1)} className="px-2 py-0.5 hover:bg-gray-100">-</button>
                        <span className="px-3">{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(idx, 1)} className="px-2 py-0.5 hover:bg-gray-100">+</button>
                      </div>
                      <button 
                        onClick={() => removeItem(idx)} 
                        className="text-gray-400 hover:text-red-500 underline uppercase text-[10px]"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
                <p className="font-semibold text-anthracite text-sm">
                  {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)} €
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3 text-xs">
            <p className="font-semibold uppercase tracking-wider text-anthracite mb-2">Mode de livraison</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="shipping" 
                checked={shippingMethod === 'pickup'} 
                onChange={() => setShippingMethod('pickup')} 
              />
              <span>Click & Collect (La Baule) - Gratuit</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="shipping" 
                checked={shippingMethod === 'europe'} 
                onChange={() => setShippingMethod('europe')} 
              />
              <span>
                Livraison à domicile (Europe) - {isFreeShipping ? <strong className="text-green-700">Offerte (dès 120 €)</strong> : '15.00 €'}
              </span>
            </label>
          </div>

          <div className="border-t pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Livraison</span>
              <span>{shippingCost === 0 ? 'Gratuite' : `${shippingCost.toFixed(2)} €`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t text-anthracite">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
          </div>

          <button
            onClick={handleStripeCheckout}
            disabled={loading}
            className="w-full bg-anthracite text-white py-4 text-xs uppercase tracking-widest hover:bg-opacity-90 transition-colors rounded disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Redirection en cours...' : 'Redirection vers Stripe...'}
          </button>
        </div>
      )}
    </main>
  );
}