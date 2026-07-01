import Navbar from './Navbar';
import SearchBar from './SearchBar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SearchBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
