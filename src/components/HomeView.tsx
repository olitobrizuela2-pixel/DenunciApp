import React from 'react';
import {
  AlertTriangle,
  MapPin,
  FileText,
  PlusCircle,
  Leaf,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Droplets,
  HeartPulse,
  Trees,
  ArrowRight,
  TrendingUp,
  Camera,
  Layers,
} from 'lucide-react';
import { Denuncia } from '../types';

interface HomeViewProps {
  reports: Denuncia[];
  onStartReport: () => void;
  onGoToMyReports: () => void;
  onGoToMap: () => void;
  onOpenDocs: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  reports,
  onStartReport,
  onGoToMyReports,
  onGoToMap,
  onOpenDocs,
}) => {
  const total = reports.length;
  const resueltas = reports.filter((r) => r.estado === 'resuelta' || r.estado === 'cerrada').length;
  const enProceso = reports.filter((r) => r.estado === 'en_proceso' || r.estado === 'derivada').length;
  const pct = total > 0 ? Math.round((resueltas / total) * 100) : 0;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl sm:rounded-4xl p-6 sm:p-12 lg:p-16 border border-emerald-800/40 shadow-2xl">
        {/* Background decorative eco shapes */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Leaf className="w-3.5 h-3.5" /> Provincia de La Rioja · Participación Ciudadana & Ecología
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-tight text-white">
            Transformemos La Rioja en un territorio libre de basurales.
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal max-w-2xl">
            <strong>Alerta Ambiental La Rioja</strong> es el canal oficial y directo entre los vecinos, la Secretaría de Ambiente y los municipios departamentales para identificar, geolocalizar y erradicar los basurales a cielo abierto, cauces contaminados y la acumulación indebida de residuos en toda la provincia.
          </p>

          {/* Three Main Action Buttons (Required by prompt) */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Primary Button 1: Denunciar */}
            <button
              onClick={onStartReport}
              className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-base shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 flex flex-col items-center justify-center text-center gap-2 group border border-emerald-400/30"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition">
                <PlusCircle className="w-7 h-7" />
              </div>
              <span className="text-base font-heading">Realizar una denuncia</span>
              <span className="text-[11px] text-emerald-100 font-normal">
                Subí fotos y ubicación GPS
              </span>
            </button>

            {/* Button 2: Ver mis denuncias */}
            <button
              onClick={onGoToMyReports}
              className="p-4 sm:p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base transition flex flex-col items-center justify-center text-center gap-2 group backdrop-blur-xs hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition">
                <FileText className="w-7 h-7" />
              </div>
              <span className="text-base font-heading">Ver mis denuncias</span>
              <span className="text-[11px] text-emerald-200/80 font-normal">
                Seguimiento con código único
              </span>
            </button>

            {/* Button 3: Mapa de denuncias */}
            <button
              onClick={onGoToMap}
              className="p-4 sm:p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-base transition flex flex-col items-center justify-center text-center gap-2 group backdrop-blur-xs hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition">
                <MapPin className="w-7 h-7" />
              </div>
              <span className="text-base font-heading">Mapa de denuncias</span>
              <span className="text-[11px] text-emerald-200/80 font-normal">
                Cartografía en vivo por estado
              </span>
            </button>
          </div>
        </div>

        {/* Live Counters Strip */}
        <div className="mt-10 pt-6 border-t border-emerald-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black font-heading text-emerald-300">
              {total}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">
              Denuncias Registradas
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black font-heading text-emerald-400">
              {resueltas}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">
              Basurales Saneados
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black font-heading text-amber-400">
              {enProceso}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">
              En Intervención
            </div>
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-black font-heading text-white">
              {pct}%
            </div>
            <div className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">
              Tasa de Resolución
            </div>
          </div>
        </div>
      </section>

      {/* Educational & Awareness Section (Required by prompt) */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-900/10 shadow-sm space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold">
            <Trees className="w-3.5 h-3.5 text-emerald-700" /> Educación Ambiental y Salud Pública
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-950">
            ¿Por qué es indispensable erradicar los basurales a cielo abierto?
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Un basural a cielo abierto no es solo un problema estético: representa un foco de degradación ecológica irreversible y una grave amenaza sanitaria para las familias que viven en las inmediaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-rose-950">Vectores de Enfermedades</h3>
            <p className="text-xs text-rose-900/80 leading-relaxed">
              La acumulación de recipientes plásticos y neumáticos favorece criaderos de mosquitos transmisores de <strong>Dengue, Zika y Chikungunya</strong>, además de la proliferación de roedores portadores de leptospirosis y hantavirus.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-sky-950">Contaminación de Suelo y Agua</h3>
            <p className="text-xs text-sky-900/80 leading-relaxed">
              La descomposición de la basura genera <strong>lixiviados</strong> (líquidos tóxicos) que percolan y contaminan las napas de agua subterránea que abastecen los pozos de consumo, arroyos y la fertilidad de la tierra.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-amber-950">Gases Tóxicos y Quemas</h3>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Las quemas clandestinas emiten <strong>dioxinas, furanos y material particulado</strong> que provocan asma y afecciones bronquiales crónicas en niñas y adultos mayores, además de gas metano que acelera el cambio climático.
            </p>
          </div>
        </div>
      </section>

      {/* How it works (Paso a paso ciudadano) */}
      <section className="bg-emerald-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
            Circuito de Resolución
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            ¿Cómo funciona tu denuncia?
          </h2>
          <p className="text-xs text-emerald-200/80">
            Un proceso transparente desde que capturás la foto hasta el saneamiento total del terreno.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-emerald-800/70 border border-emerald-700/60 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-sm text-white font-heading">Reportás con evidencia</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Completás el formulario con fotos, ajustás el pin en el mapa GPS y decidís si brindás tus datos o denunciás de forma anónima.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-800/70 border border-emerald-700/60 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-sm text-white font-heading">Generás tu Código Único</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              El sistema te asigna un código como <code>#AA-2026-8942</code> para fiscalizar el expediente en cualquier momento.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-800/70 border border-emerald-700/60 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-sm text-white font-heading">Inspección y Cuadrillas</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              La guardia ambiental inspecciona el sitio y despacha camiones recolectores, palas mecánicas o equipos especializados.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-800/70 border border-emerald-700/60 space-y-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-sm text-white font-heading">Saneamiento y Notificación</h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              El basural queda resuelto en el mapa público y se registra el acta fotográfica final de recuperación del suelo.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onStartReport}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-emerald-950 font-extrabold text-sm shadow-xl hover:bg-emerald-50 transition"
          >
            Comenzar mi denuncia ahora <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Banner for Technical Specifications / School Project */}
      <section className="bg-emerald-50 rounded-3xl p-6 sm:p-8 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3 py-1 bg-emerald-200/80 text-emerald-900 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Documentación Técnica & Académica
          </span>
          <h3 className="text-lg font-bold font-heading text-emerald-950">
            ¿Necesitás la arquitectura de software o especificación técnica?
          </h3>
          <p className="text-xs text-emerald-800/80 max-w-xl">
            Accedé al Sitemap interactivo, diagramas entidad-relación de base de datos, stack tecnológico recomendado y análisis de accesibilidad WCAG 2.1 listo para presentaciones o defensas de proyecto escolar.
          </p>
        </div>
        <button
          onClick={onOpenDocs}
          className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow transition shrink-0"
        >
          Ver Ficha Técnica y Arquitectura
        </button>
      </section>
    </div>
  );
};
