import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-anthracite text-creme py-12 border-t border-sable/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm font-sans">
        
        <div>
          <h3 className="font-serif text-xl mb-4 tracking-wide">Maison Lucette</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Prêt-à-porter féminin et accessoires inspirés par l'air iodé et l'élégance intemporelle de La Baule.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-base mb-4 tracking-wide text-sable">Navigation</h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li><Link href="/boutique" className="hover:text-creme transition">La Boutique en ligne</Link></li>
            <li><Link href="/la-boutique" className="hover:text-creme transition">Le Magasin (La Baule)</Link></li>
            <li><Link href="/favoris" className="hover:text-creme transition">Mes Favoris</Link></li>
            <li><Link href="/contact" className="hover:text-creme transition">Contactez-nous</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-base mb-4 tracking-wide text-sable">Informations légales</h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li><Link href="/mentions-legales" className="hover:text-creme transition">Mentions Légales</Link></li>
            <li><Link href="/cgv" className="hover:text-creme transition">Conditions Générales de Vente</Link></li>
          </ul>
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            49 Avenue de Gaulle, 44500 La Baule<br />
            Sandrinejolly7@yahoo.fR
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Maison Lucette. Tous droits réservés.
      </div>
    </footer>
  );
}