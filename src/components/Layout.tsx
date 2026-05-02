import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Navbar />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
