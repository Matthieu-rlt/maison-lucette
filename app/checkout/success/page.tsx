'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  useEffect(() => {
    // 1. On récupère le panier depuis Zustand (sauvegardé en cache ou via le localStorage du store)
    // On vérifie d'abord si on a des articles stockés temporairement pour l'historique
    const pendingCheckout = localStorage.getItem('maison_lucette_pending_cart');
    
    if (pendingCheckout) {
      const cartItems = JSON.parse(pendingCheckout);
      
      // Sécurité anti-duplication (si on rafraîchit la page de succès)
      const alreadySaved = sessionStorage.getItem('order_saved');
      if (!alreadySaved && cartItems.length > 0) {
        const newOrder = {
          id: 'ML-' + Math.floor(100000 + Math.random() * 900000),
          date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
          items: cartItems,
          total: cartItems.reduce((acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0),
          status: 'Validée / En préparation'
        };

        // On enregistre dans l'historique des commandes du compte
        const existingOrders = JSON.parse(localStorage.getItem('maison_lucette_orders') || '[]');
        localStorage.setItem('maison_lucette_orders', JSON.stringify([newOrder, ...existingOrders]));
        
        sessionStorage.setItem('order_saved', 'true');
        // On nettoie le panier temporaire de paiement
        localStorage.removeItem('maison_lucette_pending_cart');
      }
    }
  }, []);

  return (
    <main className="max-w-xl mx-auto px-4 py-24 text-center font-sans space-y-6">
      <h1 className="text-3xl font-serif text-anthracite">Merci pour votre commande !</h1>
      <p className="text-sm text-gray-600">
        Votre paiement a bien été validé par Stripe. Votre commande est officiellement enregistrée et nous la préparons avec soin à La Baule.
      </p>
      <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          href="/compte" 
          className="inline-block border border-anthracite text-anthracite px-6 py-3 text-xs uppercase tracking-widest rounded hover:bg-anthracite hover:text-white transition-colors"
        >
          Voir mes commandes
        </Link>
        <Link 
          href="/boutique" 
          className="inline-block bg-anthracite text-white px-8 py-3 text-xs uppercase tracking-widest rounded hover:bg-opacity-90 transition-colors"
        >
          Retourner à la boutique
        </Link>
      </div>
    </main>
  );
}