'use client';
import { useCartStore } from '../../store/useCartStore';
import Link from 'next/link';

export default function SideCart() {
  const { isOpen, closeCart, items, total, removeItem } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeCart} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-creme shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
            <h2 className="font-serif text-2xl text-anthracite">Votre Panier</h2>
            <button onClick={closeCart} className="text-anthracite hover:text-sable text-xl font-bold">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-gray-200">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 py-12 font-sans italic">Votre panier est vide.</p>
            ) : (
              items.map((item, index) => (
                <div key={index} className="py-4 flex gap-4 items-center">
                  <img src={item.image} alt={item.title} className="w-16 h-20 object-cover" />
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-anthracite">{item.title}</h4>
                    {item.size && <p className="text-xs text-gray-500">Taille : {item.size}</p>}
                    <p className="font-sans text-sm text-gray-600">{item.price} €</p>
                  </div>
                  <button 
                    onClick={() => removeItem(index)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 px-6 py-6 bg-white">
            <div className="flex justify-between font-serif text-lg text-anthracite mb-4">
              <span>Sous-total</span>
              <span>{total} €</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">Taxes et frais de port calculés à l'étape de paiement.</p>
            <Link 
              href="/checkout"
              onClick={closeCart}
              className="block text-center w-full bg-anthracite text-creme font-bold uppercase tracking-widest py-4 hover:bg-sable hover:text-anthracite transition-colors shadow-md text-xs"
            >
              Commander
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}