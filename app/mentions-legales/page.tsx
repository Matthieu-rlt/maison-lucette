export default function MentionsLegalesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16 font-sans text-sm text-gray-700 leading-relaxed">
      <h1 className="text-4xl font-serif text-anthracite mb-8 text-center">Mentions Légales</h1>
      
      <div className="space-y-6 bg-white p-8 border border-gray-200">
        <section>
          <h2 className="font-serif text-xl text-anthracite mb-2">1. Informations légales</h2>
          <p>
            Le site <strong>Maison Lucette</strong> est édité par la boutique Maison Lucette, située au 49 Avenue de Gaulle, 44500 La Baule-Escoublac.<br />
            Téléphone : 02 51 75 74 73<br />
            Email : Sandrinejolly7@yahoo.fR
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-anthracite mb-2">2. Hébergement</h2>
          <p>
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-anthracite mb-2">3. Propriété intellectuelle</h2>
          <p>
            L'ensemble des elements visuels, textuels et photographiques présents sur ce site sont la propriété exclusive de Maison Lucette. Toute reproduction sans autorisation préalable est strictement interdite.
          </p>
        </section>
      </div>
    </main>
  );
}