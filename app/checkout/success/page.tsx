'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const [selectedRelay, setSelectedRelay] = useState<any>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Nettoyage du panier actif
    localStorage.removeItem('maison_lucette_cart');
    window.dispatchEvent(new Event('cart-updated'));

    // 1. Injection du CSS officiel Mondial Relay
    if (!document.getElementById('mr-widget-css')) {
      const link = document.createElement('link');
      link.id = 'mr-widget-css';
      link.rel = 'stylesheet';
      link.href = 'https://widget.mondialrelay.com/parcelshop-picker/v1_0/styles/jquery.plugin.mondialrelay.parcelshoppicker.css';
      document.head.appendChild(link);
    }

    // 2. Chargement séquentiel de jQuery puis du plugin
    const loadScripts = async () => {
      if (!(window as any).jQuery) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      if (!(window as any).jQuery.fn.MR_ParcelShopPicker) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://widget.mondialrelay.com/parcelshop-picker/v1_0/scripts/jquery.plugin.mondialrelay.parcelshoppicker.min.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      setScriptLoaded(true);
    };

    loadScripts();
  }, []);

  useEffect(() => {
    if (scriptLoaded && (window as any).jQuery) {
      const $ = (window as any).jQuery;
      try {
        $('#Zone_Widget').MR_ParcelShopPicker({
          Target: '#Target_ParcelShop',
          Brand: 'BDTEST', // Code enseigne test Mondial Relay
          Country: 'FR',
          PostCode: '',
          Colis_Poids: '1000',
          NbResults: '7',
          EnableGmap: true,
          OnParcelShopSelected: (data: any) => {
            setSelectedRelay(data);
            // Sauvegarde automatique du point relais choisi
            localStorage.setItem('maison_lucette_selected_relay', JSON.stringify(data));
          }
        });
      } catch (err) {
        console.error("Erreur initialisation widget Mondial Relay:", err);
      }
    }
  }, [scriptLoaded]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-20 font-sans text-center space-y-8">
      <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm space-y-6">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          ✓
        </div>
        
        <h1 className="text-3xl font-serif text-anthracite">Merci pour votre commande !</h1>
        
        <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
          Votre paiement a bien été validé. Un e-mail de confirmation vous a été envoyé par Stripe. 
          Votre pièce d'exception de la Maison Lucette sera préparée avec le plus grand soin.
        </p>

        {/* SECTION WIDGET INTÉGRÉ MONDIAL RELAY */}
        <div className="border-t border-gray-100 pt-6 mt-6 space-y-4 text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-anthracite text-center">
            📦 Sélectionnez votre Point Relais de livraison :
          </h2>
          <p className="text-xs text-gray-500 text-center">
            Choisissez directement votre point de retrait interactif sur la carte ci-dessous.
          </p>

          {/* Conteneur officiel du widget */}
          <div id="Zone_Widget" className="min-h-[500px] border rounded bg-white p-4"></div>
          <input type="hidden" id="Target_ParcelShop" />

          {selectedRelay && (
            <div className="p-4 bg-green-50 border border-green-200 rounded text-xs space-y-1 text-anthracite">
              <p className="font-bold text-green-800">✓ Point relais sélectionné avec succès :</p>
              <p><strong>Nom :</strong> {selectedRelay.Nom}</p>
              <p><strong>Adresse :</strong> {selectedRelay.Adresse1} {selectedRelay.CP} {selectedRelay.Ville}</p>
              <p className="text-[10px] text-gray-500 mt-1">ID Point Relais : {selectedRelay.ID}</p>
            </div>
          )}
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
