'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isTailleUnique, setIsTailleUnique] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    title: '',
    slug: '',
    price: '',
    colors: 'Unique',
    stockXS: '0',
    stockS: '5',
    stockM: '5',
    stockL: '2',
    stockXXL: '0',
    stock34: '0',
    stock36: '0',
    stock38: '5',
    stock40: '5',
    stock42: '2',
    stock44: '0',
    stock46: '0',
    stock48: '0',
    stockTU: '10',
    category: 'Vestes',
    description: '',
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

    const colorList = newProduct.colors.split(',').map((c: string) => c.trim()).filter(Boolean);

    const sizeObject = isTailleUnique ? {
      'Taille Unique': parseInt(newProduct.stockTU) || 0
    } : {
      XS: parseInt(newProduct.stockXS) || 0,
      S: parseInt(newProduct.stockS) || 0,
      M: parseInt(newProduct.stockM) || 0,
      L: parseInt(newProduct.stockL) || 0,
      XXL: parseInt(newProduct.stockXXL) || 0,
      '34': parseInt(newProduct.stock34) || 0,
      '36': parseInt(newProduct.stock36) || 0,
      '38': parseInt(newProduct.stock38) || 0,
      '40': parseInt(newProduct.stock40) || 0,
      '42': parseInt(newProduct.stock42) || 0,
      '44': parseInt(newProduct.stock44) || 0,
      '46': parseInt(newProduct.stock46) || 0,
      '48': parseInt(newProduct.stock48) || 0,
    };

    let stockObject: Record<string, any> = {};
    if (colorList.length <= 1 || colorList[0].toLowerCase() === 'unique') {
      stockObject = sizeObject;
    } else {
      colorList.forEach((color: string) => {
        stockObject[color] = sizeObject;
      });
    }

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
      alert('Produit ajouté avec succès !');
      setNewProduct({ 
        title: '', slug: '', price: '', colors: 'Unique',
        stockXS: '0', stockS: '5', stockM: '5', stockL: '2', stockXXL: '0', 
        stock34: '0', stock36: '0', stock38: '5', stock40: '5', stock42: '2', stock44: '0', stock46: '0', stock48: '0', stockTU: '10',
        category: 'Vestes', description: '' 
      });
      setIsTailleUnique(false);
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

              {/* COULEURS ET GESTION DES STOCKS PAR TAILLE */}
              <div className="md:col-span-2 border p-4 rounded bg-gray-50 space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Couleurs disponibles (séparées par des virgules)</label>
                  <input 
                    type="text" 
                    value={newProduct.colors} 
                    onChange={e => setNewProduct({...newProduct, colors: e.target.value})} 
                    placeholder="ex: Orange, Bleu ou Unique" 
                    className="border p-2 rounded w-full bg-white" 
                    required 
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Écris "Unique" si le produit n'a pas de déclinaison de couleur.</p>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
                  <input 
                    type="checkbox" 
                    id="tuCheckAdmin" 
                    checked={isTailleUnique} 
                    onChange={e => setIsTailleUnique(e.target.checked)} 
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="tuCheckAdmin" className="font-semibold text-gray-700 cursor-pointer text-xs">
                    Ce produit est en <strong className="text-anthracite">Taille Unique</strong>
                  </label>
                </div>

                {isTailleUnique ? (
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Stock Taille Unique</label>
                    <input 
                      type="number" 
                      value={newProduct.stockTU} 
                      onChange={e => setNewProduct({...newProduct, stockTU: e.target.value})} 
                      className="border p-2 rounded w-full md:w-1/3 bg-white" 
                      required 
                    />
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <span className="block font-semibold text-gray-700 mb-1">Stocks par taille :</span>
                    
                    {/* Ligne 1 : Tailles Lettres */}
                    <div className="grid grid-cols-5 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">XS</label>
                        <input type="number" value={newProduct.stockXS} onChange={e => setNewProduct({...newProduct, stockXS: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">S</label>
                        <input type="number" value={newProduct.stockS} onChange={e => setNewProduct({...newProduct, stockS: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">M</label>
                        <input type="number" value={newProduct.stockM} onChange={e => setNewProduct({...newProduct, stockM: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">L</label>
                        <input type="number" value={newProduct.stockL} onChange={e => setNewProduct({...newProduct, stockL: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">XXL</label>
                        <input type="number" value={newProduct.stockXXL} onChange={e => setNewProduct({...newProduct, stockXXL: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                    </div>

                    {/* Ligne 2 : Tailles Françaises du 34 au 48 */}
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2 pt-2 border-t border-gray-200">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">34</label>
                        <input type="number" value={newProduct.stock34} onChange={e => setNewProduct({...newProduct, stock34: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">36</label>
                        <input type="number" value={newProduct.stock36} onChange={e => setNewProduct({...newProduct, stock36: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">38</label>
                        <input type="number" value={newProduct.stock38} onChange={e => setNewProduct({...newProduct, stock38: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">40</label>
                        <input type="number" value={newProduct.stock40} onChange={e => setNewProduct({...newProduct, stock40: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">42</label>
                        <input type="number" value={newProduct.stock42} onChange={e => setNewProduct({...newProduct, stock42: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">44</label>
                        <input type="number" value={newProduct.stock44} onChange={e => setNewProduct({...newProduct, stock44: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">46</label>
                        <input type="number" value={newProduct.stock46} onChange={e => setNewProduct({...newProduct, stock46: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1">48</label>
                        <input type="number" value={newProduct.stock48} onChange={e => setNewProduct({...newProduct, stock48: e.target.value})} className="border p-2 rounded w-full bg-white" required />
                      </div>
                    </div>
                  </div>
                )}
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
