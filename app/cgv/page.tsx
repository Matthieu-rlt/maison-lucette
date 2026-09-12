export default function CgvPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 font-sans text-sm text-gray-700 leading-relaxed">
      <h1 className="text-4xl font-serif text-anthracite mb-8 text-center">Conditions Générales de Vente (CGV)</h1>
      
      <div className="space-y-6 bg-white p-8 border border-gray-200">
        <section>
          <h2 className="font-serif text-xl text-anthracite mb-2">Article 1 - Objet</h2>
          <p>
            Les présentes conditions générales de vente régissent les ventes de produits effectuées sur le site de Maison Lucette, boutique située à La Baule.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-anthracite mb-2">Article 2 - Prix et Commandes</h2>
          <p>
            Les prix de nos produits sont indiqués en Euros TTC. Les commandes sont validées après acceptation du paiement et confirmation de la disponibilité des pièces.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-anthracite mb-2">Article 3 - Click & Collect et Livraison</h2>
          <p>
            Le retrait en boutique (Click & Collect) est gratuit et disponible directement au 49 Avenue de Gaulle à La Baule. Les livraisons à domicile sont proposées selon les conditions affichées lors de la commande.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-anthracite mb-2">Article 4 - Retours et Remboursements</h2>
          <p>
            Conformément à la législation en vigueur, vous disposez d'un délai de 14 jours à compter de la réception pour retourner tout article dans son emballage d'origine pour échange ou remboursement.
          </p>
        </section>
      </div>
    </main>
  );
}
