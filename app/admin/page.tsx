'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [newProduct, setNewProduct] = useState({
    title: '',
    slug: '',
    price: '',
    colors: 'Unique', // Ex: "Orange, Bleu" ou "Unique"
    isTailleUnique: false,
    category: 'Vestes',
    description: '',
    // Stocks par défaut (on gérera dynamiquement par couleur)
    defaultStock: '5'
  });

  useEffect(() => {
    checkAdmin();

    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => { fetchData(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => { fetchData(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const allowedEmails = [
      'matthieuriallot@gmail.com',
      'sandrinelelong613@gmail.com'
    ];

    if (user && user.email && allowedEmails.includes(user.email)) {
      setUser(user);
      fetchData();
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    const { data: msgData } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (msgData) setMessages(msgData);

    const { data: prodData } = await supabase.from('products').select('*').order('title');
    if (prodData) setProducts(prodData);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Découpage des couleurs (ex: "Orange, Bleu" -> ["Orange", "Bleu"])
    const colorList = newProduct.colors.split(',').map(c => c.trim()).filter(Boolean);
    
    const stockObject: Record<string, any> = {};

    colorList.forEach(color => {
      if (newProduct.isTailleUnique) {
        stockObject[color] = {
          'Taille Unique': parseInt(newProduct.defaultStock) || 0
        };
      } else {
        stockObject[color] = {
          XS: parseInt(newProduct.defaultStock) || 0,
          S: parseInt(newProduct.defaultStock) || 0,
          M: parseInt(newProduct.defaultStock) || 0,
          L: parseInt(newProduct.defaultStock) || 0,
          XXL: parseInt(newProduct.defaultStock) || 0,
          '34': parseInt(newProduct.defaultStock) || 0,
          '36': parseInt(newProduct.defaultStock) || 0,
          '38': parseInt(newProduct.defaultStock) || 0,
          '40': parseInt(newProduct.defaultStock) || 0,
          '42': parseInt(newProduct.defaultStock) || 0,
          '44': parseInt(newProduct.defaultStock) || 0,
          '46': parseInt(newProduct.defaultStock) || 0,
          '48': parseInt(newProduct.defaultStock) || 0,
        };
      }
    });

    const { error } = await supabase.from('products').insert([
      {
        title: newProduct.title,
        slug: newProduct.slug || newProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        price: parseFloat(newProduct.price),
        stock: stockObject,
        category: newProduct.category,
        description: newProduct.description,
      }
    ]);

    if (error) {
      alert('Erreur lors de l\'ajout : ' + error.message);
    } else {
      alert('Produit ajouté avec succès ! Tu pourras affiner les stocks précis par taille dans Supabase si besoin.');
      setNewProduct({ 
        title: '', slug: '', price: '', colors: 'Unique', isTailleUnique: false, 
        category: 'Vestes', description: '', defaultStock: '5' 
      });
      fetchData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div className="text-center py-24 text-xs uppercase tracking-widest">Chargement...</div>;

  return (
    <main className="max-w-5xl mx-auto px-4 py-16 font-sans space-y-12">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-serif uppercase tracking-widest text-anthracite">Administration — Maison Lucette</h1>
        <Link href="/" className="text-xs uppercase tracking-wider text-gray-500 hover:text-anthracite">← Retour au site</Link>
      </div>

      {!user ? (
        <div className="bg-white p-8 rounded border border-gray-100 text-center space-y-4 max-w-md mx-auto">
          <p className="text-xs text-gray-600">Accès restreint. Veuillez vous connecter avec un compte administrateur autorisé.</p>
          <Link href="/compte" className="inline-block bg-anthracite text-white px-6 py-3 text-xs uppercase tracking-widest rounded">
            Se connecter
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {/* SECTION 1 : AJOUTER UN PRODUIT */}
          <section className="bg-white p-8 rounded border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-anthracite">Ajouter une nouvelle pièce</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <input 
                type="text" placeholder="Nom de la pièce (ex: Veste Écru)" value={newProduct.title}
                onChange={e => setNewProduct({...newProduct, title: e.target.value})} required
                className="border p-3 rounded"
              />
              <input 
                type="text" placeholder="Slug (ex: veste-ecru)" value={newProduct.slug}
                onChange={e => setNewProduct({...newProduct, slug: e.target.value})}
                className="border p-3 rounded"
              />
              <input 
                type="number" step="0.01" placeholder="Prix en € (ex: 145.00)" value={newProduct.price}
                onChange={e => setNewProduct({...newProduct, price: e.target.value})} required
                className="border p-3 rounded"
              />
              <select 
                value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                className="border p-3 rounded bg-white"
              >
                <option value="Vestes">Vestes</option>
                <option value="Manteaux">Manteaux</option>
                <option value="Maille">Maille</option>
                <option value="Accessoires">Accessoires</option>
              </select>

              {/* GESTION DES COULEURS ET DU STOCK */}
              <div className="md:col-span-2 border p-4 rounded bg-gray-50 space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Couleurs disponibles (séparées par des virgules)</label>
                  <input 
                    type="text" 
                    value={newProduct.colors} 
                    onChange={e => setNewProduct({...newProduct, colors: e.target.value})} 
                    placeholder="ex: Orange, Bleu, Écru" 
                    className="border p-2 rounded w-full bg-white" 
                    required 
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Pour une seule couleur sans choix particulier, écris simplement "Unique" ou la couleur (ex: "Ecru").</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="tuCheckAdmin" 
                    checked={newProduct.isTailleUnique} 
                    onChange={e => setNewProduct({...newProduct, isTailleUnique: e.target.checked})} 
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="tuCheckAdmin" className="font-semibold text-gray-700 cursor-pointer text-xs">
                    Ce produit est en <strong className="text-anthracite">Taille Unique</strong> pour ces couleurs
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Stock initial par défaut pour chaque taille/couleur</label>
                  <input 
                    type="number" 
                    value={newProduct.defaultStock} 
                    onChange={e => setNewProduct({...newProduct, defaultStock: e.target.value})} 
                    className="border p-2 rounded w-full md:w-1/3 bg-white" 
                    required 
                  />
                </div>
              </div>

              <textarea 
                placeholder="Description de la pièce..." value={newProduct.description}
                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                className="border p-3 rounded md:col-span-2" rows={3}
              />
              <button type="submit" className="md:col-span-2 bg-anthracite text-white py-3 uppercase tracking-widest rounded hover:bg-opacity-90">
                Enregistrer la pièce
              </button>
            </form>
          </section>

          {/* SECTION 2 : LISTE DES PRODUITS */}
          <section className="bg-white p-8 rounded border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-anthracite">Catalogue actuel ({products.length} pièces)</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {products.map(prod => (
                <div key={prod.id} className="flex justify-between items-center text-xs border-b pb-2">
                  <span>
                    {prod.title} — <strong className="text-anthracite">{prod.price} €</strong>
                  </span>
                  <button onClick={() => handleDeleteProduct(prod.id)} className="text-red-500 hover:underline uppercase text-[10px]">Supprimer</button>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 3 : MESSAGES DE CONTACT */}
          <section className="bg-white p-8 rounded border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-anthracite">Messages reçus ({messages.length})</h2>
            {messages.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Aucun message pour le moment.</p>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.id} className="border p-4 rounded text-xs space-y-1 bg-gray-50">
                    <div className="flex justify-between font-semibold text-anthracite">
                      <span>{msg.name} ({msg.email})</span>
                      <span className="text-gray-400 font-normal">{new Date(msg.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {msg.phone && <p className="text-gray-500">Tél : {msg.phone}</p>}
                    <p className="text-gray-700 mt-2">{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
