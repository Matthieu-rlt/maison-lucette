import Link from 'next/link';

export default function LaBoutiquePage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans space-y-24">
      
      {/* Section En-tête & Présentation de la Boutique */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-widest text-gray-400">Maison Lucette - La Baule</span>
          <h1 className="text-3xl md:text-4xl font-serif text-anthracite">Notre écrin baulois</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Située au cœur de La Baule, au <span className="font-semibold text-anthracite">49 Avenue du General de Gaulle</span>, notre boutique vous accueille dans une atmosphère chaleureuse et raffinée. Venez y découvrir l'ensemble de nos collections, toucher les matières et bénéficier de conseils personnalisés.
          </p>
          <div className="pt-2 text-xs uppercase tracking-widest text-gray-500 space-y-1">
            <p>Horaires : Du mardi au samedi de 10h à 19h</p>
            <p>Click & Collect disponible en 2h</p>
          </div>
        </div>

        <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden shadow-sm">
          <img 
            src="/images/Image_magasin.jpeg" 
            alt="La boutique Maison Lucette à La Baule" 
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Section La Gérante (Image à gauche, texte à droite) */}
      <section className="border-t border-gray-200 pt-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[3/4] bg-gray-100 rounded overflow-hidden shadow-sm">
          <img 
            src="/images/Image_Sandrine.jpeg" 
            alt="Sandrine, Fondatrice & Gérante de Maison Lucette" 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>

        <div className="space-y-6">
          <span className="text-xs uppercase tracking-widest text-gray-400">Derrière les coulisses</span>
          <h2 className="text-2xl md:text-3xl font-serif text-anthracite">Sandrine</h2>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Fondatrice & Gérante</p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Passionnée par la mode et les belles matières, Sandrine vous accueille seule en boutique pour vous offrir une attention sur-mesure. À l'origine de la maison, elle sélectionne chaque pièce avec exigence et amour pour vous guider personnellement dans le choix de looks élégants et intemporels.
          </p>
          <p className="text-xs text-gray-500 italic pt-2 border-t border-gray-100">
            "Sublimer votre style avec simplicité et bienveillance, c'est toute notre ambition au quotidien."
          </p>
        </div>
      </section>

      {/* Appel à l'action */}
      <div className="text-center bg-gray-50 p-12 rounded space-y-4 border border-gray-100">
        <h3 className="text-xl font-serif text-anthracite">Envie de nous rendre visite ?</h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Retrouvez nos nouveautés en exclusivité dans notre boutique de La Baule ou commandez en ligne dès maintenant.
        </p>
        <div className="pt-2">
          <Link 
            href="/boutique" 
            className="inline-block bg-anthracite text-white px-8 py-3 text-xs uppercase tracking-widest rounded hover:bg-opacity-90 transition-colors"
          >
            Découvrir la collection en ligne
          </Link>
        </div>
      </div>

    </main>
  );
}