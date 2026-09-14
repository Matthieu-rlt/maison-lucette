'use client'; // Important car c'est un composant interactif

import { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from './../lib/supabase';

// Définir le type pour le formulaire
interface ContactFormData {
  nom: string;
  email: string;
  telephone: string;
  message: string;
}

export default function ContactPage() {
  // État pour les données du formulaire
  const [formData, setFormData] = useState<ContactFormData>({
    nom: '',
    email: '',
    telephone: '',
    message: '',
  });

  // États pour les messages de succès et d'erreur
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // État de chargement
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour gérer les changements dans les champs
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      // Validation de base
      if (!formData.email || !formData.message) {
        throw new Error('Veuillez remplir au moins votre e-mail et votre message.');
      }

      // Envoyer les données à Supabase
      const { error } = await supabase.from('messages').insert([
        {
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone,
          message: formData.message,
        },
      ]);

      if (error) {
        throw error;
      }

      // En cas de succès
      setStatus({
        type: 'success',
        message: '✨ Votre message a bien été envoyé. Merci de nous avoir contactés !',
      });
      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        message: '',
      });

    } catch (err: any) {
      console.error("Erreur lors de l'envoi du message:", err);
      // En cas d'erreur
      setStatus({
        type: 'error',
        message:
          "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer plus tard ou nous contacter directement.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-20">
      
      {/* En-tête de la page */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-gray-400">✨ Maison Lucette - La Baule</span>
        <h1 className="text-3xl md:text-4xl font-serif text-anthracite">Parlons de vous</h1>
        <p className="text-sm text-gray-600">
          Une question sur une collection, une taille ou un conseil ? Notre équipe vous répond avec attention.
        </p>
      </div>

      {/* Grille principale : Infos & Formulaire */}
      <div className="grid md:grid-cols-3 gap-12 items-start">
        
        {/* Colonne de gauche : Infos pratiques (1/3) */}
        <div className="space-y-8 bg-white p-8 rounded border border-gray-100 shadow-sm md:col-span-1">
          <div className="space-y-3">
            <h3 className="text-lg font-serif text-anthracite">La Boutique 🛍️</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Venez vivre l'expérience Maison Lucette directement dans notre écrin baulois.
            </p>
          </div>

          <div className="space-y-4 text-xs text-gray-600 border-t border-gray-100 pt-6">
            <div>
              <span className="block font-semibold uppercase tracking-widest text-anthracite mb-1 text-[10px]">📍 Adresse</span>
              <p>49 Avenue du Général de Gaulle</p>
              <p>44500 La Baule-Escoublac</p>
            </div>
            <div>
              <span className="block font-semibold uppercase tracking-widest text-anthracite mb-1 text-[10px]">📞 Téléphone</span>
              <a href="tel:+33981700000" className="hover:underline text-gray-800 font-medium">02 40 19 22 57</a>
            </div>
            <div>
              <span className="block font-semibold uppercase tracking-widest text-anthracite mb-1 text-[10px]">✉️ E-mail</span>
              <a href="mailto:contact@maisonlucette.com" className="hover:underline text-gray-800 font-medium">Sandrinejolly7@yahoo.fR</a>
            </div>
            <div>
              <span className="block font-semibold uppercase tracking-widest text-anthracite mb-1 text-[10px] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </span>
              <a href="https://instagram.com/maisonlucette7" target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-800 font-medium">@maisonlucette7</a>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <span className="block font-semibold uppercase tracking-widest text-anthracite mb-2 text-[10px]">🕒 Horaires d'ouverture</span>
            <p className="text-xs text-gray-600">Mardi au samedi : 10h00 - 19h00</p>
            <p className="text-xs text-gray-600 mt-1">Dimanche et lundi : Fermé</p>
          </div>
        </div>

        {/* Colonne de droite : Formulaire élégant (2/3) */}
        <div className="bg-white p-8 md:p-10 rounded border border-gray-100 shadow-sm md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nom" className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">
                  👤 Nom (optionnel)
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  className="w-full text-sm p-3.5 bg-gray-50/50 border border-gray-200 rounded focus:bg-white focus:ring-1 focus:ring-anthracite focus:border-anthracite transition-all outline-none"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label htmlFor="telephone" className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">
                  📱 Téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="w-full text-sm p-3.5 bg-gray-50/50 border border-gray-200 rounded focus:bg-white focus:ring-1 focus:ring-anthracite focus:border-anthracite transition-all outline-none"
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">
                📧 E-mail <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full text-sm p-3.5 bg-gray-50/50 border border-gray-200 rounded focus:bg-white focus:ring-1 focus:ring-anthracite focus:border-anthracite transition-all outline-none"
                placeholder="votre.email@exemple.fr"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-[11px] uppercase tracking-widest text-gray-500 mb-2">
                💬 Votre Message <span className="text-red-400">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full text-sm p-3.5 bg-gray-50/50 border border-gray-200 rounded focus:bg-white focus:ring-1 focus:ring-anthracite focus:border-anthracite resize-none transition-all outline-none"
                placeholder="Comment pouvons-nous vous aider ?"
              />
            </div>

            {status.type && (
              <div
                className={`text-xs p-4 rounded border ${
                  status.type === 'success'
                    ? 'bg-green-50 text-green-800 border-green-100'
                    : 'bg-red-50 text-red-800 border-red-100'
                }`}
              >
                {status.message}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-anthracite text-white px-8 py-3.5 text-xs uppercase tracking-widest rounded hover:bg-opacity-90 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer le message ✉️'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Section Carte Google Maps mise à jour sur le 49 Avenue du Général de Gaulle */}
      <div className="aspect-[3/1] bg-gray-50 rounded overflow-hidden border border-gray-100 shadow-sm">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src="https://maps.google.com/maps?q=49+Avenue+du+Général+de+Gaulle+44500+La+Baule-Escoublac&output=embed"
          allowFullScreen
          aria-hidden="false"
          tabIndex={0}
          title="Localisation de Maison Lucette au 49 Avenue du Général de Gaulle à La Baule"
        />
      </div>

    </main>
  );
}
