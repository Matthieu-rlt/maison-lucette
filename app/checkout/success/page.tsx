'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    const pendingCheckout = localStorage.getItem('maison_lucette_pending_cart');
    if (pendingCheckout) {
      try {
        setOrderItems(JSON.parse(pendingCheckout));
      } catch (e) {
        setOrderItems([]);
      }
    }

    localStorage.removeItem('maison_lucette_cart');
    window.dispatchEvent(new Event('cart-updated'));
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 py-20 font-sans text-center space-y-8">
      <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          ✓
        </div>
        
        <h1 className="text-3xl font-serif text-anthracite">Merci pour votre commande !</h1>
        
        <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
          Votre paiement a bien été validé. Un e-mail de confirmation vous a été envoyé par Stripe. 
          Votre pièce d'exception de la Maison Lucette sera préparée avec le plus grand soin.
        </p>

        <div className="pt-6">
          <Link 
            href="/"
            className="inline-block bg-anthracite text-white px-8 py-4 text-xs uppercase tracking-widest rounded hover:bg-opacity-90 transition-colors"
          >
            Retourner à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
