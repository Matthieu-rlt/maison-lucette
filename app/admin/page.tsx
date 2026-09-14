'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [colorsInput, setColorsInput] = useState('Unique');
  const [isTailleUnique, setIsTailleUnique] = useState(false);
  
  const [stockValues, setStockValues] = useState({
    XS: '0', S: '5', M: '5', L: '2', XL: '0', XXL: '0',
    '34': '0', '36': '0', '38': '5', '40': '5', '42': '2', '44': '0', '46': '0', '48': '0',
    TU: '10'
  });

  const [colorStocks, setColorStocks] = useState<Record<string, { isTU: boolean; values: Record<string, string> }>>({});
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const [newProduct, setNewProduct] = useState({
    title: '',
    slug: '',
    price: '',
    discount: '0',
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

  useEffect(() => {
    const currentColors = colorsInput.split(',').map(c => c.trim()).filter(Boolean);
    const isMulti = currentColors.length > 1 && currentColors[0].toLowerCase() !== 'unique';

    if (isMulti) {
      setColorStocks(prev => {
        const next = { ...prev };
        currentColors.forEach(color => {
          if (!next[color]) {
            next[color] = {
              isTU: false,
              values: {
                XS: '0', S: '5', M: '5', L: '2', XL: '0', XXL: '0',
                '34': '0', '36': '0', '38': '5', '40': '5', '42': '2', '44': '0', '46': '0', '48': '0',
                TU: '10'
              }
            };
          }
        });
        return next;
      });
    }
  }, [colorsInput]);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const allowedEmails = [
      'matthieuriallot@gmail.com',
      'sandrinelelong613@gmail.com',
      'matthieucompte1@gmail.com'
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

  const handleStartEdit = (prod: any) => {
    setEditingProductId(prod.id);
    let stockObj = prod.stock;
    if (typeof stockObj === 'string') {
      try { stockObj = JSON.parse(stockObj); } catch (e) { stockObj = {}; }
    }

    const keys = Object.keys(stockObj || {});
    const knownSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '34', '36', '38', '40', '42', '44', '46', '48', 'Taille Unique'];
    const isFlat = keys.length > 0 && knownSizes.includes(keys[0]);

    setNewProduct({
      title: prod.title || '',
      slug: prod.slug || '',
      price: prod.price?.toString() || '',
      discount: prod.discount?.toString() || '0',
      category: prod.category || 'Vestes',
      description: prod.description || '',
    });

    if (isFlat) {
      setColorsInput('Unique');
      const isTU = stockObj['Taille Unique'] !== undefined;
      setIsTailleUnique(isTU);
      setStockValues({
        XS: stockObj['XS']?.toString() || '0',
        S: stockObj['S']?.toString() || '0',
        M: stockObj['M']?.toString() || '0',
        L: stockObj['L']?.toString() || '0',
        XL: stockObj['XL']?.toString() || '0',
        XXL: stockObj['XXL']?.toString() || '0',
        '34': stockObj['34']?.toString() || '0',
        '36': stockObj['36']?.toString() || '0',
        '38': stockObj['38']?.toString() || '0',
        '40': stockObj['40']?.toString() || '0',
        '42': stockObj['42']?.toString() || '0',
        '44': stockObj['44']?.toString() || '0',
        '46': stockObj['46']?.toString() || '0',
        '48': stockObj['48']?.toString() || '0',
        TU: stockObj['Taille Unique']?.toString() || '10',
      });
      setColorStocks({});
    } else {
      setColorsInput(keys.join(', '));
      const newColorStocks: Record<string, any> = {};
      keys.forEach(c => {
        const cVal = stockObj[c] || {};
        const isTU = cVal['Taille Unique'] !== undefined;
        newColorStocks[c] = {
          isTU,
          values: {
            XS: cVal['XS']?.toString() || '0',
            S: cVal['S']?.toString() || '0',
            M: cVal['M']?.toString() || '0',
            L: cVal['L']?.toString() || '0',
            XL: cVal['XL']?.toString() || '0',
            XXL: cVal['XXL']?.toString() || '0',
            '34': cVal['34']?.toString() || '0',
            '36': cVal['36']?.toString() || '0',
            '38': cVal['38']?.toString() || '0',
            '40': cVal['40']?.toString() || '0',
            '42': cVal['42']?.toString() || '0',
            '44': cVal['44']?.toString() || '0',
            '46': cVal['46']?.toString() || '0',
            '48': cVal['48']?.toString() || '0',
            TU: cVal['Taille Unique']?.toString() || '10',
          }
        };
      });
      setColorStocks(newColorStocks);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setColorsInput('Unique');
    setIsTailleUnique(false);
    setStockValues({
      XS: '0', S: '5', M: '5', L: '2', XL: '0', XXL: '0',
      '34': '0', '36': '0', '38': '5', '40': '5', '42': '2', '44': '0', '46': '0', '48': '0',
      TU: '10'
    });
    setColorStocks({});
    setNewProduct({
      title: '', slug: '', price: '', discount: '0', category: 'Vestes', description: ''
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentColors = colorsInput.split(',').map((c: string) => c.trim()).filter(Boolean);
    const isMulti = currentColors.length > 1 && currentColors[0].toLowerCase() !== 'unique';

    const buildSizeObj = (isTU: boolean, vals: any) => isTU ? { 'Taille Unique': parseInt(vals.TU) || 0 } : {
      XS: parseInt(vals.XS) || 0,
      S: parseInt(vals.S) || 0,
      M: parseInt(vals.M) || 0,
      L: parseInt(vals.L) || 0,
      XL: parseInt(vals.XL) || 0,
      XXL: parseInt(vals.XXL) || 0,
      '34': parseInt(vals['34']) || 0,
      '36': parseInt(vals['36']) || 0,
      '38': parseInt(vals['38']) || 0,
      '40': parseInt(vals['40']) || 0,
      '42': parseInt(vals['42']) || 0,
      '44': parseInt(vals['44']) || 0,
      '46': parseInt(vals['46']) || 0,
      '48': parseInt(vals['48']) || 0,
    };

    let stockObject: Record<string, any> = {};

    if (!isMulti) {
      stockObject = buildSizeObj(isTailleUnique, stockValues);
    } else {
      currentColors.forEach(color => {
        const cData = colorStocks[color] || { isTU: false, values: stockValues };
        stockObject[color] = buildSizeObj(cData.isTU, cData.values);
      });
    }

    const productData = {
      title: newProduct.title,
      slug: newProduct.slug || newProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: parseFloat(newProduct.price),
      discount: parseInt(newProduct.discount) || 0,
      stock: stockObject,
      category: newProduct.category,
      description: newProduct.description,
    };

    let error;
    if (editingProductId) {
      const res = await supabase.from('products').update(productData).eq('id', editingProductId);
      error = res.error;
    } else {
      const res = await supabase.from('products').insert([productData]);
      error = res.error;
    }

    if (error) {
      alert('Erreur : ' + error.message);
    } else {
      alert(editingProductId ? 'Pièce modifiée avec succès !' : 'Pièce ajoutée avec succès !');
      handleCancelEdit();
      fetchData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce produit ?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce message ?')) {
      await supabase.from('messages').delete().eq('id', id);
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
          {/* SECTION 1 : AJOUTER / MODIFIER UN PRODUIT */}
          <section className="bg-white p-8 rounded border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-anthracite">
                {editingProductId ? `Modifier la pièce : ${newProduct.title}` : 'Ajouter une nouvelle pièce'}
              </h2>
              {editingProductId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit} 
                  className="text-xs text-gray-500 hover:text-anthracite underline uppercase"
                >
                  Annuler la modification
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Nom de la pièce</label>
                <input 
                  type="text" placeholder="ex: Veste Écru" value={newProduct.title}
                  onChange={e => setNewProduct({...newProduct, title: e.target.value})} required
                  className="border p-3 rounded w-full bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Slug URL</label>
                <input 
                  type="text" placeholder="ex: veste-ecru" value={newProduct.slug}
                  onChange={e => setNewProduct({...newProduct, slug: e.target.value})}
                  className="border p-3 rounded w-full bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Prix en €</label>
                <input 
                  type="number" step="0.01" placeholder="ex: 190.00" value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})} required
                  className="border p-3 rounded w-full bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-red-600 mb-1">Réduction en % (ex: 20 pour -20%)</label>
                <input 
                  type="number" placeholder="ex: 20" value={newProduct.discount}
                  onChange={e => setNewProduct({...newProduct, discount: e.target.value})}
                  className="border p-3 rounded w-full bg-white border-red-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Catégorie</label>
                <select 
                  value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="border p-3 rounded bg-white w-full"
                >
                  <option value="Vestes">Vestes</option>
                  <option value="Manteaux">Manteaux</option>
                  <option value="Maille">Maille</option>
                  <option value="Accessoires">Accessoires</option>
                  <option value="Chemises">Chemises</option>
                  <option value="Tops">Tops</option>
                  <option value="Hauts">Hauts</option>
                  <option value="Blouses">Blouses</option>
                  <option value="Jeans">Jeans</option>
                  <option value="Pantalon">Pantalon</option>
                </select>
              </div>

              {/* COULEURS ET GESTION DES STOCKS DYNAMIQUE */}
              <div className="md:col-span-2 border p-4 rounded bg-gray-50 space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Couleurs disponibles (séparées par des virgules)</label>
                  <input 
                    type="text" 
                    value={colorsInput} 
                    onChange={e => setColorsInput(e.target.value)} 
                    placeholder="ex: Bleu, Vert ou Unique" 
                    className="border p-2 rounded w-full bg-white" 
                    required 
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Écris "Unique" si le produit n'a pas de déclinaison. Si tu mets plusieurs couleurs (ex: Bleu, Vert), un bloc complet de stock apparaîtra pour chaque couleur.</p>
                </div>

                {(() => {
                  const currentColors = colorsInput.split(',').map(c => c.trim()).filter(Boolean);
                  const isMulti = currentColors.length > 1 && currentColors[0].toLowerCase() !== 'unique';

                  if (!isMulti) {
                    return (
                      <div className="space-y-4 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-3">
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
                              value={stockValues.TU} 
                              onChange={e => setStockValues({...stockValues, TU: e.target.value})} 
                              className="border p-2 rounded w-full md:w-1/3 bg-white" 
                              required 
                            />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <span className="block font-semibold text-gray-700 mb-1">Stocks par taille :</span>
                            <div className="grid grid-cols-6 gap-2">
                              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                                <div key={sz}>
                                  <label className="block text-[10px] text-gray-500 mb-1">{sz}</label>
                                  <input 
                                    type="number" 
                                    value={(stockValues as any)[sz]} 
                                    onChange={e => setStockValues({...stockValues, [sz]: e.target.value})} 
                                    className="border p-2 rounded w-full bg-white" 
                                    required 
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 pt-2 border-t border-gray-200">
                              {['34', '36', '38', '40', '42', '44', '46', '48'].map(sz => (
                                <div key={sz}>
                                  <label className="block text-[10px] text-gray-500 mb-1">{sz}</label>
                                  <input 
                                    type="number" 
                                    value={(stockValues as any)[sz]} 
                                    onChange={e => setStockValues({...stockValues, [sz]: e.target.value})} 
                                    className="border p-2 rounded w-full bg-white" 
                                    required 
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div className="space-y-6 pt-2 border-t border-gray-200">
                        <span className="block font-bold text-anthracite text-xs uppercase tracking-wider">Gestion détaillée des stocks par couleur :</span>
                        {currentColors.map(color => {
                          const cData = colorStocks[color] || { isTU: false, values: stockValues };
                          return (
                            <div key={color} className="border p-4 rounded bg-white space-y-3 shadow-xs">
                              <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="font-serif font-bold text-anthracite text-sm">Couleur : {color}</h3>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="checkbox" 
                                    id={`tu-${color}`} 
                                    checked={cData.isTU} 
                                    onChange={e => {
                                      const next = { ...colorStocks };
                                      next[color] = { ...cData, isTU: e.target.checked };
                                      setColorStocks(next);
                                    }} 
                                    className="w-4 h-4 cursor-pointer"
                                  />
                                  <label htmlFor={`tu-${color}`} className="text-[11px] font-semibold text-gray-700 cursor-pointer">
                                    Taille Unique ({color})
                                  </label>
                                </div>
                              </div>

                              {cData.isTU ? (
                                <div>
                                  <label className="block text-[10px] text-gray-500 mb-1">Stock Taille Unique ({color})</label>
                                  <input 
                                    type="number" 
                                    value={cData.values.TU} 
                                    onChange={e => {
                                      const next = { ...colorStocks };
                                      next[color] = { ...cData, values: { ...cData.values, TU: e.target.value } };
                                      setColorStocks(next);
                                    }} 
                                    className="border p-2 rounded w-full md:w-1/3 bg-white" 
                                    required 
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-6 gap-2">
                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                                      <div key={sz}>
                                        <label className="block text-[9px] text-gray-500 mb-1">{sz}</label>
                                        <input 
                                          type="number" 
                                          value={cData.values[sz]} 
                                          onChange={e => {
                                            const next = { ...colorStocks };
                                            next[color] = { ...cData, values: { ...cData.values, [sz]: e.target.value } };
                                            setColorStocks(next);
                                          }} 
                                          className="border p-1.5 rounded w-full bg-white text-xs" 
                                          required 
                                        />
                                      </div>
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2 pt-2 border-t border-gray-100">
                                    {['34', '36', '38', '40', '42', '44', '46', '48'].map(sz => (
                                      <div key={sz}>
                                        <label className="block text-[9px] text-gray-500 mb-1">{sz}</label>
                                        <input 
                                          type="number" 
                                          value={cData.values[sz]} 
                                          onChange={e => {
                                            const next = { ...colorStocks };
                                            next[color] = { ...cData, values: { ...cData.values, [sz]: e.target.value } };
                                            setColorStocks(next);
                                          }} 
                                          className="border p-1.5 rounded w-full bg-white text-xs" 
                                          required 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                })()}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Description de la pièce</label>
                <textarea 
                  placeholder="Description..." value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className="border p-3 rounded w-full bg-white" rows={3}
                />
              </div>

              <button type="submit" className="md:col-span-2 bg-anthracite text-white py-3 uppercase tracking-widest rounded hover:bg-opacity-90">
                {editingProductId ? 'Mettre à jour la pièce' : 'Enregistrer la pièce'}
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
                    {prod.title} — <strong className="text-anthracite">{prod.price} €</strong> {prod.discount > 0 && <span className="text-red-500 font-bold">(-{prod.discount}%)</span>}
                  </span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleStartEdit(prod)} className="text-blue-600 hover:underline uppercase text-[10px] font-semibold">Modifier</button>
                    <button onClick={() => handleDeleteProduct(prod.id)} className="text-red-500 hover:underline uppercase text-[10px]">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MESSAGES DE CONTACT */}
          <section className="bg-white p-8 rounded border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-anthracite">Messages reçus ({messages.length})</h2>
            {messages.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Aucun message pour le moment.</p>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.id} className="border p-4 rounded text-xs space-y-1 bg-gray-50">
                    <div className="flex justify-between items-center font-semibold text-anthracite">
                      <span>{msg.name} ({msg.email})</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 font-normal">{new Date(msg.created_at).toLocaleDateString('fr-FR')}</span>
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)} 
                          className="text-red-500 hover:underline uppercase text-[10px]"
                        >
                          Supprimer
                        </button>
                      </div>
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
