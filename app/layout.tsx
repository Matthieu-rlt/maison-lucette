import './globals.css';
import TopBar from './components/layout/TopBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SideCart from './components/layout/SideCart';
import SearchModal from './components/layout/SearchModal';
import Toast from './components/layout/Toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-creme text-anthracite antialiased min-h-screen flex flex-col">
        <TopBar />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <SideCart />
        <SearchModal />
        <Toast />
      </body>
    </html>
  );
}