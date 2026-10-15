import React from 'react';
import { Leaf, Phone, ShieldCheck, Heart, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'report' | 'my-reports' | 'map' | 'admin' | 'stats') => void;
  onOpenDocs: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDocs }) => {
  return (
    <footer className="bg-emerald-950 text-white border-t border-emerald-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg font-heading text-white">Alerta Ambiental</span>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Plataforma tecnológica ciudadana destinada a la erradicación de basurales a cielo abierto y el saneamiento sustentable del territorio.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" /> Datos protegidos por ley de privacidad.
            </div>
          </div>

          {/* Col 2: Accesos Rápidos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Accesos Ciudadanos
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/90">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('report')}
                  className="hover:text-white transition text-emerald-300 font-bold"
                >
                  Realizar una denuncia
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-reports')}
                  className="hover:text-white transition"
                >
                  Seguimiento (Mis denuncias)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('map')}
                  className="hover:text-white transition"
                >
                  Mapa público en vivo
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('stats')}
                  className="hover:text-white transition"
                >
                  Estadísticas ambientales
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Líneas de Emergencia y Contacto */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Guardias y Urgencias · La Rioja
            </h4>
            <div className="space-y-2 text-xs text-emerald-100/90">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Guardia Ambiental La Rioja: <strong>147 / 3804-453000</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Defensa Civil Provincial: <strong>103</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bomberos y Policía de La Rioja: <strong>100 / 911</strong></span>
              </div>
              <p className="text-[11px] text-emerald-300/70 pt-1">
                Atención 24 hs para quemas de pastizales, podas o vertido en cauces aluvionales.
              </p>
            </div>
          </div>

          {/* Col 4: Proyecto & Investigación Escolar */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Proyecto de Investigación
            </h4>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Desarrollado bajo pautas de eco-diseño, accesibilidad WCAG 2.1 y arquitectura de software para la Provincia de La Rioja.
            </p>
            <button
              onClick={onOpenDocs}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5"
            >
              Ficha Técnica & Sitemap
            </button>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-300/70">
          <p>© {new Date().getFullYear()} Alerta Ambiental · Provincia de La Rioja, Argentina.</p>
          <p className="flex items-center gap-1">
            Protección del suelo riojano, quebradas y salud comunitaria <Heart className="w-3.5 h-3.5 text-rose-400" />
          </p>
        </div>
      </div>
    </footer>
  );
};
