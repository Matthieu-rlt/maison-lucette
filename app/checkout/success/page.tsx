'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [selectedRelay, setSelectedRelay] = useState<any>(null);

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

    // 1. Injection du CSS Mondial Relay
    if (!document.getElementById('mr-widget-css')) {
      const link = document.createElement('link');
      link.id = 'mr-widget-css';
      link.rel = 'stylesheet';
      link.href = 'https://widget.mondialrelay.com/parcelshop-picker/v1_0/styles/jquery.plugin.mondialrelay.parcelshoppicker.css';
      document.head.appendChild(link);
    }

    // 2. Chargement de jQuery puis du plugin
    const loadMondialRelayWidget = () => {
      if ((window as any).jQuery && (window as any).jQuery.fn.MR_ParcelShopPicker) {
        initWidget();
      } else {
        if (!document.getElementById('jquery-script')) {
          const jqScript = document.createElement('script');
          jqScript.id = 'jquery-script';
          jqScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
          jqScript.onload = () => loadPlugin();
          document.body.appendChild(jqScript);
        } else {
          loadPlugin();
        }
      }
    };

    const loadPlugin = () => {
      if (!document.getElementById('mr-widget-script')) {
        const script = document.createElement('script');
        script.id = 'mr-widget-script';
        script.src = 'https://widget.mondialrelay.com/parcelshop-picker/v1_0/scripts/jquery.plugin.mondialrelay.parcelshoppicker.min.js';
        script.onload = () => initWidget();
        document.body.appendChild(script);
      } else {
        initWidget();
      }
    };

    const initWidget = () => {
      if ((window as any).jQuery && (window as any).jQuery.fn.MR_ParcelShopPicker) {
        (window as any).jQuery('#Zone_Widget').MR_ParcelShopPicker({
          Target: '#Target_ParcelShop',
          Brand: 'BDTEST', 
          Country: 'FR',
          PostCode: '', 
          Colis_Poids: '1000',
          NbResults: '7',
          OnParcelShopSelected: (data: any) => {
            setSelectedRelay(data);
          }
        });
      }
    };

    // Petit délai pour laisser le DOM se dessiner
    const timer = setTimeout(() => {
      loadMondialRelayWidget();
    }, 500);

    return () => clearTimeout(timer);
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

        {/* SECTION WIDGET MONDIAL RELAY */}
        <div className="border-t border-gray-100 pt-6 mt-6 space-y-4 text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-anthracite text-center">
            📦 Choisissez votre Point Relais Mondial Relay :
          </h2>
          <p className="text-xs text-gray-500 text-center">
            Sélectionnez directement sur la carte ci-dessous le point de retrait souhaité pour votre colis.
          </p>

          <div id="Zone_Widget" className="min-h-[500px] border rounded bg-white p-2"></div>
          
          <input type="hidden" id="Target_ParcelShop" />

          {selectedRelay && (
            <div className="p-4 bg-green-50 border border-green-200 rounded text-xs space-y-1 text-anthracite">
              <p className="font-bold text-green-800">Point relais sélectionné avec succès :</p>
              <p><strong>Nom :</strong> {selectedRelay.Nom}</p>
              <p><strong>Adresse :</strong> {selectedRelay.Adresse1} {selectedRelay.CP} {selectedRelay.Ville}</p>
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
