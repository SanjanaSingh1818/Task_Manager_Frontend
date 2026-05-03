import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="min-h-screen min-w-0 overflow-x-hidden pb-20 md:ml-64 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
