import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Filter,
  ShieldCheck,
  Layers,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Search,
} from 'lucide-react';
import { Denuncia, ProblemType, ReportStatus } from '../types';
import { PROBLEM_TYPE_CONFIG, STATUS_CONFIG, BARRIOS_DEFAULT } from '../data/mockData';
import { LeafletMap } from './Common/LeafletMap';

interface PublicMapViewProps {
  reports: Denuncia[];
  onSelectReportToTrack: (id: string) => void;
}

export const PublicMapView: React.FC<PublicMapViewProps> = ({
  reports,
  onSelectReportToTrack,
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('todos');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('todos');
  const [selectedBarrioFilter, setSelectedBarrioFilter] = useState<string>('todos');
  const [activeReport, setActiveReport] = useState<Denuncia | null>(null);

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (selectedStatusFilter !== 'todos') {
        if (selectedStatusFilter === 'recibida_o_revision') {
          if (r.estado !== 'recibida' && r.estado !== 'en_revision') return false;
        } else if (selectedStatusFilter === 'en_proceso') {
          if (r.estado !== 'en_proceso' && r.estado !== 'derivada') return false;
        } else if (selectedStatusFilter === 'resuelta') {
          if (r.estado !== 'resuelta' && r.estado !== 'cerrada') return false;
        }
      }

      if (selectedTypeFilter !== 'todos' && r.tipoProblema !== selectedTypeFilter) {
        return false;
      }

      if (selectedBarrioFilter !== 'todos' && r.ubicacion.barrio !== selectedBarrioFilter) {
        return false;
      }

      return true;
    });
  }, [reports, selectedStatusFilter, selectedTypeFilter, selectedBarrioFilter]);

  // Counts by marker color categories
  const stats = useMemo(() => {
    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;

    reports.forEach((r) => {
      const marker = STATUS_CONFIG[r.estado]?.markerColor;
      if (marker === 'red') redCount++;
      else if (marker === 'yellow') yellowCount++;
      else if (marker === 'green') greenCount++;
    });

    return { redCount, yellowCount, greenCount, total: reports.length };
  }, [reports]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Stats bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Cartografía Comunitaria Abierta
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-950">
            Mapa de Denuncias y Basurales · La Rioja
          </h1>
          <p className="text-sm text-emerald-800/80 mt-1 max-w-2xl">
            Visualizá los focos de residuos reportados en los departamentos de la Provincia de La Rioja (Capital, Chilecito, Chamical, Arauco, Chepes, Villa Unión), su estado de saneamiento y las intervenciones ambientales en tiempo real.
          </p>
        </div>

        {/* Status Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-emerald-900/10 shadow-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-200" />
            <span>Recibidas / Revisión: {stats.redCount}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span>En Proceso / Maquinaria: {stats.yellowCount}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span>Resueltas / Saneadas: {stats.greenCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-900/10 shadow-sm mb-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-700" /> Filtros de visualización
          </span>
          <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
            Mostrando {filteredReports.length} de {reports.length} reportes en La Rioja
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Estado de resolución
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600"
            >
              <option value="todos">Todos los estados</option>
              <option value="recibida_o_revision">🔴 Recibidas y En revisión</option>
              <option value="en_proceso">🟡 En proceso y Derivadas</option>
              <option value="resuelta">🟢 Resueltas y Cerradas</option>
            </select>
          </div>

          {/* Problem Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Tipo de problema
            </label>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600"
            >
              <option value="todos">Todos los tipos de residuo</option>
              {(Object.keys(PROBLEM_TYPE_CONFIG) as ProblemType[]).map((key) => (
                <option key={key} value={key}>
                  {PROBLEM_TYPE_CONFIG[key].label}
                </option>
              ))}
            </select>
          </div>

          {/* Neighborhood Filter */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Barrio o Departamento
            </label>
            <select
              value={selectedBarrioFilter}
              onChange={(e) => setSelectedBarrioFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600"
            >
              <option value="todos">Todos los barrios de La Rioja</option>
              {BARRIOS_DEFAULT.map((b) => (
                <option key={b.id} value={b.nombre}>
                  {b.nombre} ({b.localidad})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Map Container with Side Overlay Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-emerald-900/10">
        <LeafletMap
          height="540px"
          reports={filteredReports}
          onSelectReport={(report) => setActiveReport(report)}
        />

        {/* Strict Privacy Badge (Required in prompt) */}
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-900/10 shadow-md flex items-center gap-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold text-[11px]">
            Privacidad Garantizada: Sin datos personales visibles públicamente.
          </span>
        </div>

        {/* Selected Pin Float Drawer */}
        {activeReport && (
          <div className="absolute bottom-4 right-4 z-20 max-w-sm w-full bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-mono font-extrabold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                {activeReport.id}
              </span>
              <button
                onClick={() => setActiveReport(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeReport.evidencias[0] && (
              <div className="h-32 w-full rounded-2xl overflow-hidden mb-3 bg-gray-100">
                <img
                  src={activeReport.evidencias[0].url}
                  alt="Foto"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h3 className="font-bold text-sm text-gray-900 mb-1">
              {PROBLEM_TYPE_CONFIG[activeReport.tipoProblema].label}
            </h3>

            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {activeReport.descripcion}
            </p>

            <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {activeReport.ubicacion.calle} {activeReport.ubicacion.numero},{' '}
                  {activeReport.ubicacion.barrio}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>Fecha: {activeReport.fecha}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold border ${
                    STATUS_CONFIG[activeReport.estado].badgeBg
                  }`}
                >
                  ● {STATUS_CONFIG[activeReport.estado].label}
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectReportToTrack(activeReport.id)}
              className="mt-3 w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Consultar Seguimiento Completo
            </button>
          </div>
        )}
      </div>

      {/* Grid of Report Cards below map for accessibility */}
      <div className="mt-8 space-y-3">
        <h3 className="text-base font-bold font-heading text-gray-900">
          Listado de focos registrados en este sector ({filteredReports.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredReports.slice(0, 6).map((r) => {
            const probCfg = PROBLEM_TYPE_CONFIG[r.tipoProblema];
            const statCfg = STATUS_CONFIG[r.estado];
            return (
              <div
                key={r.id}
                onClick={() => setActiveReport(r)}
                className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-emerald-500 transition cursor-pointer shadow-xs hover:shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-emerald-900">{r.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statCfg.badgeBg}`}>
                    ● {statCfg.label}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-gray-900">{probCfg.label}</h4>
                <p className="text-[11px] text-gray-500 truncate">
                  📍 {r.ubicacion.calle} {r.ubicacion.numero}, {r.ubicacion.barrio}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
