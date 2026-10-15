import React, { useState } from 'react';
import {
  Search,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Eye,
  X,
  FileText,
  Calendar,
  AlertCircle,
  Truck,
  PlusCircle,
} from 'lucide-react';
import { Denuncia, ReportStatus } from '../types';
import { STATUS_CONFIG, PROBLEM_TYPE_CONFIG } from '../data/mockData';

interface MyReportsViewProps {
  myReports: Denuncia[];
  allReports: Denuncia[];
  initialSearchCode?: string;
  onNewReport: () => void;
  onViewOnMap: (report: Denuncia) => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({
  myReports,
  allReports,
  initialSearchCode = '',
  onNewReport,
  onViewOnMap,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchCode);
  const [searchedReport, setSearchedReport] = useState<Denuncia | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Denuncia | null>(null);

  // Trigger search by code
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError(null);

    const clean = searchQuery.trim().toUpperCase();
    if (!clean) {
      setSearchedReport(null);
      return;
    }

    const found = allReports.find((r) => r.id.toUpperCase() === clean);
    if (found) {
      setSearchedReport(found);
      setSelectedReport(found);
    } else {
      setSearchedReport(null);
      setSearchError(`No se encontró ninguna denuncia con el código "${clean}". Verificá el formato (ej: AA-2026-8942).`);
    }
  };

  const statusOrderedList: ReportStatus[] = [
    'recibida',
    'en_revision',
    'derivada',
    'en_proceso',
    'resuelta',
    'cerrada',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-950">
            Seguimiento de Denuncias
          </h1>
          <p className="text-sm text-emerald-800/80 mt-1">
            Consultá el estado y las actuaciones ambientales en La Rioja ingresando tu código o revisando tus denuncias guardadas.
          </p>
        </div>
        <button
          onClick={onNewReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> Nueva Denuncia
        </button>
      </div>

      {/* Code Search Card */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm mb-8">
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Buscar por Código Único de Denuncia
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ejemplo: AA-2026-8942"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-mono uppercase font-semibold"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm rounded-2xl shadow transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> Consultar Estado
            </button>
          </div>
          {searchError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </form>
      </div>

      {/* My Reports List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-heading text-gray-900">
            Mis Denuncias Guardadas ({myReports.length})
          </h2>
          <span className="text-xs text-gray-500">
            Sincronizadas automáticamente en tu navegador
          </span>
        </div>

        {myReports.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 space-y-3">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-base text-gray-800">Aún no registraste denuncias en este dispositivo</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Cuando envíes una denuncia sobre un basural a cielo abierto, aparecerá aquí con su código para que sigas el saneamiento día a día.
            </p>
            <button
              onClick={onNewReport}
              className="mt-2 px-5 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow hover:bg-emerald-800 transition"
            >
              Crear mi primera denuncia
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myReports.map((report) => {
              const statusCfg = STATUS_CONFIG[report.estado];
              const probCfg = PROBLEM_TYPE_CONFIG[report.tipoProblema];
              const currentStepIndex = statusOrderedList.indexOf(report.estado);

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-900/10 shadow-xs hover:shadow-md transition flex flex-col gap-4 group"
                >
                  {/* Top card row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-mono font-extrabold text-emerald-900 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                        {report.id}
                      </span>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-bold border ${statusCfg.badgeBg}`}
                      >
                        ● {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{report.fecha} a las {report.hora} hs</span>
                    </div>
                  </div>

                  {/* Middle row: content summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2 border-y border-gray-100">
                    <div className="md:col-span-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: probCfg.color }}
                        />
                        <h3 className="font-bold text-sm text-gray-900">{probCfg.label}</h3>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {report.descripcion}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>
                          {report.ubicacion.calle} {report.ubicacion.numero}, {report.ubicacion.barrio}
                        </span>
                      </p>
                    </div>

                    {/* Thumbnail / Evidence pill */}
                    <div className="flex items-center md:justify-end gap-2">
                      {report.evidencias[0] && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                          <img
                            src={report.evidencias[0].url}
                            alt="Evidencia"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="text-xs">
                        <span className="block font-semibold text-gray-700">
                          {report.evidencias.length} archivo(s)
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {report.denunciante.esAnonima ? 'Anónima' : 'Identificada'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual 6-Step Timeline Bar */}
                  <div className="pt-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Progreso de Gestión Municipal ({statusCfg.step} de 6):
                    </div>
                    <div className="grid grid-cols-6 gap-1 sm:gap-2">
                      {statusOrderedList.map((st, idx) => {
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        const thisConfig = STATUS_CONFIG[st];

                        return (
                          <div key={st} className="flex flex-col items-center text-center">
                            <div
                              className={`w-full h-2 rounded-full mb-1 transition-all ${
                                isCurrent
                                  ? 'bg-emerald-600 ring-2 ring-emerald-200'
                                  : isDone
                                  ? 'bg-emerald-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                            <span
                              className={`text-[9px] sm:text-[10px] leading-tight line-clamp-1 font-semibold ${
                                isCurrent
                                  ? 'text-emerald-900 font-bold'
                                  : isDone
                                  ? 'text-gray-700'
                                  : 'text-gray-400'
                              }`}
                            >
                              {thisConfig.label.split(' ')[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    {report.cuadrillaAsignada && (
                      <span className="text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1.5 font-medium">
                        <Truck className="w-3.5 h-3.5" /> {report.cuadrillaAsignada}
                      </span>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => onViewOnMap(report)}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-xl transition flex items-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Ver en mapa
                      </button>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Detalle y Actuaciones
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-mono font-extrabold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-lg">
                  {selectedReport.id}
                </span>
                <h3 className="text-xl font-bold font-heading text-gray-900 mt-2">
                  Detalle Integral de la Denuncia
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status box */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                  Estado Oficial
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                      STATUS_CONFIG[selectedReport.estado].badgeBg
                    }`}
                  >
                    ● {STATUS_CONFIG[selectedReport.estado].label}
                  </span>
                  <span className="text-xs text-gray-500">
                    (Paso {STATUS_CONFIG[selectedReport.estado].step} de 6)
                  </span>
                </div>
              </div>
              {selectedReport.cuadrillaAsignada && (
                <div className="sm:text-right">
                  <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    Cuadrilla en Terreno
                  </span>
                  <p className="text-xs font-bold text-purple-800">
                    {selectedReport.cuadrillaAsignada}
                  </p>
                </div>
              )}
            </div>

            {/* Description & Ubicacion */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-500">Tipo de Problema</h4>
                <p className="text-sm font-bold text-gray-900">
                  {PROBLEM_TYPE_CONFIG[selectedReport.tipoProblema].label}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-gray-500">Descripción detallada</h4>
                <p className="text-xs text-gray-700 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/60 leading-relaxed">
                  {selectedReport.descripcion}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-gray-500">Ubicación y Referencias</h4>
                <p className="text-xs text-gray-800">
                  📍 {selectedReport.ubicacion.calle} {selectedReport.ubicacion.numero},{' '}
                  {selectedReport.ubicacion.barrio}, {selectedReport.ubicacion.localidad}
                </p>
                {selectedReport.ubicacion.referencias && (
                  <p className="text-xs text-gray-500 mt-1 italic">
                    Ref: {selectedReport.ubicacion.referencias}
                  </p>
                )}
              </div>
            </div>

            {/* Evidences visual gallery */}
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">
                Evidencias Registradas ({selectedReport.evidencias.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedReport.evidencias.map((ev) => (
                  <div
                    key={ev.id}
                    className="h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative group"
                  >
                    {ev.tipo === 'imagen' ? (
                      <img src={ev.url} alt={ev.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                        {ev.tipo.toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white rounded text-[9px]">
                      {ev.nombre}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Official Municipal History Log */}
            <div>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" /> Historial de Actuaciones del Municipio
              </h4>
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 pl-8">
                {selectedReport.historial.map((h, i) => (
                  <div key={h.id || i} className="relative">
                    <span className="absolute -left-8 top-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] ring-4 ring-white">
                      ✓
                    </span>
                    <div className="text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-900">
                          {STATUS_CONFIG[h.estado]?.label || h.estado}
                        </span>
                        <span className="text-[10px] text-gray-500">{h.fecha}</span>
                      </div>
                      <p className="text-gray-700">{h.observacion}</p>
                      {h.responsable && (
                        <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                          Funcionario/Área: {h.responsable}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
