'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  // Les deux e-mails autorisés à voir le lien vers l'admin
  const allowedEmails = [
    'matthieuriallot@gmail.com',
    'sandrinejolly7@yahoo.fr'
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    try {
      const savedOrders = JSON.parse(localStorage.getItem('maison_lucette_orders') || '[]');
      setOrders(savedOrders);
    } catch (e) {
      setOrders([]);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/compte`,
        queryParams: {
          prompt: 'select_account', // Force Google à demander quel compte utiliser à chaque fois
        },
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  const isAdmin = user && user.email && allowedEmails.includes(user.email);

  return (
    <main className="max-w-4xl mx-auto px-4 py-16 font-sans space-y-8">
      <h1 className="text-2xl font-serif uppercase tracking-widest text-anthracite text-center border-b pb-4">
        Mon Compte
      </h1>

      {!user ? (
        <div className="text-center space-y-6 py-12 max-w-md mx-auto bg-white p-8 rounded border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600">Connectez-vous pour suivre vos commandes et retrouver vos avantages baulois.</p>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-anthracite py-3.5 px-6 text-xs uppercase tracking-widest rounded hover:bg-gray-50 transition-colors shadow-sm cursor-pointer font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Se connecter avec Google
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white border border-gray-100 rounded p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Connecté en tant que</p>
              <p className="text-sm font-medium text-anthracite mt-1">{user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="text-xs uppercase tracking-widest text-anthracite hover:underline font-semibold"
                >
                  Accéder à l'Admin →
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="border border-red-500 text-red-500 px-4 py-2 text-xs uppercase tracking-widest rounded hover:bg-red-50 transition-colors cursor-pointer"
              >
                Se déconnecter
              </button>
            </div>
          </div>

          {/* Historique des commandes */}
          <div className="space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-anthracite">Mes Commandes</h2>

            {orders.length === 0 ? (
              <p className="text-xs text-gray-500 bg-white p-6 rounded border border-gray-100 text-center">
                Vous n'avez pas encore passé de commande enregistrée.
              </p>
            ) : (
              orders.map((order, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center text-xs border-b pb-3">
                    <span className="font-bold text-anthracite">Commande du {order.date}</span>
                    <span className="bg-creme text-anthracite px-2.5 py-1 rounded font-medium uppercase text-[10px]">
                      {order.status || 'Payée'}
                    </span>
                    <span className="font-semibold text-anthracite">{Number(order.total || 0).toFixed(2)} €</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Articles commandés :</p>
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-xs text-gray-600 bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img src={item.image} alt={item.title || item.name} className="w-10 h-12 object-cover rounded border" />
                          )}
                          <span>{item.title || item.name} (Qté : {item.quantity || 1})</span>
                        </div>
                        <span className="font-medium">{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </main>
  );
}