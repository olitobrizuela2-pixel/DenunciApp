import React, { useState } from 'react';
import {
  Leaf,
  PlusCircle,
  FileText,
  MapPin,
  ShieldCheck,
  BarChart3,
  Menu,
  X,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'report' | 'my-reports' | 'map' | 'admin' | 'stats';
  onNavigate: (view: 'home' | 'report' | 'my-reports' | 'map' | 'admin' | 'stats') => void;
  onOpenDocs: () => void;
  myReportsCount: number;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenDocs,
  myReportsCount,
  isAdmin,
  onToggleAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleNav = (view: 'home' | 'report' | 'my-reports' | 'map' | 'admin' | 'stats') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black font-heading tracking-tight text-emerald-950">
                  Alerta Ambiental
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  La Rioja
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] font-semibold text-emerald-800/80 tracking-wide">
                Provincia de La Rioja · Gestión de Residuos
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                currentView === 'home'
                  ? 'bg-emerald-100/70 text-emerald-900'
                  : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-100'
              }`}
            >
              Inicio
            </button>

            <button
              onClick={() => handleNav('map')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentView === 'map'
                  ? 'bg-emerald-100/70 text-emerald-900'
                  : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Mapa
            </button>

            <button
              onClick={() => handleNav('my-reports')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 relative ${
                currentView === 'my-reports'
                  ? 'bg-emerald-100/70 text-emerald-900'
                  : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" /> Mis Denuncias
              {myReportsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-mono">
                  {myReportsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNav('stats')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                currentView === 'stats'
                  ? 'bg-emerald-100/70 text-emerald-900'
                  : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-700" /> Estadísticas
            </button>

            <button
              onClick={onOpenDocs}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 transition flex items-center gap-1.5"
              title="Ver arquitectura de navegación, esquema de base de datos y wireframes"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" /> Ficha Técnica
            </button>

            {/* Admin Switcher */}
            <button
              onClick={onToggleAdmin}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isAdmin
                  ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              {isAdmin ? 'Modo Municipal ON' : 'Acceso Municipal'}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => handleNav('report')}
              className="ml-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Denunciar Basural
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleNav('report')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
            >
              Denunciar
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-emerald-950" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          <button
            onClick={() => handleNav('home')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-emerald-50"
          >
            Inicio
          </button>
          <button
            onClick={() => handleNav('report')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-900 bg-emerald-50 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" /> Realizar una Denuncia
          </button>
          <button
            onClick={() => handleNav('my-reports')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-emerald-50 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" /> Ver mis denuncias
            </span>
            {myReportsCount > 0 && (
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full font-mono">
                {myReportsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleNav('map')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-emerald-50 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-emerald-700" /> Mapa de Denuncias
          </button>
          <button
            onClick={() => handleNav('stats')}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-gray-800 hover:bg-emerald-50 flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-emerald-700" /> Estadísticas Ambientales
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDocs();
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-emerald-50 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-emerald-700" /> Ficha Técnica & Arquitectura
          </button>
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => {
                onToggleAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              {isAdmin ? 'Cerrar Modo Municipal' : 'Acceso Personal Municipal'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
