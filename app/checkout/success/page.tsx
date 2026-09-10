'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    // 1. On récupère le panier depuis le stockage
    const pendingCheckout = localStorage.getItem('maison_lucette_pending_cart');
    
    if (pendingCheckout) {
      try {
        const cartItems = JSON.parse(pendingCheckout);
        setOrderItems(cartItems);
      } catch (e) {
        setOrderItems([]);
      }
    }

    // Sécurité anti-duplication
    const alreadySaved = sessionStorage.getItem('order_saved');
    if (!alreadySaved) {
      sessionStorage.setItem('order_saved', 'true');
    }

    // Nettoyage du panier actif
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
          Votre paiement a bien été validé. Un e-mail de confirmation vous a été envoyé. 
          Votre pièce d'exception de la Maison Lucette sera préparée avec le plus grand soin.
        </p>

        {/* SECTION MONDIAL RELAY : CHOIX DU POINT RELAIS */}
        <div className="border-t border-gray-100 pt-6 mt-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-anthracite">
            📦 Choisi avec Mondial Relay ? Sélectionnez votre Point Relais :
          </h2>
          <p className="text-xs text-gray-500">
            Si vous avez opté pour la livraison en Point Relais, veuillez cliquer ci-dessous pour choisir l'emplacement de retrait de votre colis.
          </p>

          <div className="min-h-[250px] border rounded bg-gray-50 flex flex-col items-center justify-center p-6 space-y-4">
            <p className="text-xs text-anthracite font-medium">Sélectionnez votre point de retrait favori pour finaliser l'expédition.</p>
            <a 
              href="https://www.mondialrelay.fr/trouver-le-plus-proche-de-chez-moi/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-anthracite text-white px-6 py-3 text-xs uppercase tracking-widest rounded hover:bg-opacity-90 transition-colors"
            >
              Ouvrir la carte des points relais ↗
            </a>
          </div>
        </div>

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
