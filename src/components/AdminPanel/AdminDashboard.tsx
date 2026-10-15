import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  Trash2,
  User,
  Truck,
  FileText,
  AlertCircle,
  PlusCircle,
  RotateCcw,
  BarChart3,
  Calendar,
  Layers,
  ChevronDown,
  X,
  Send,
} from 'lucide-react';
import { Denuncia, ReportStatus, ProblemType } from '../../types';
import { PROBLEM_TYPE_CONFIG, STATUS_CONFIG, BARRIOS_DEFAULT } from '../../data/mockData';
import { storageService } from '../../services/storage';
import { AdminStats } from './AdminStats';
import { LeafletMap } from '../Common/LeafletMap';

interface AdminDashboardProps {
  reports: Denuncia[];
  onRefreshReports: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  onRefreshReports,
  onExitAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'denuncias' | 'estadisticas'>('denuncias');

  // Filters
  const [search, setSearch] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterBarrio, setFilterBarrio] = useState<string>('todos');

  // Selected report for detail/actions modal
  const [selectedReport, setSelectedReport] = useState<Denuncia | null>(null);

  // Status Change Form inside modal
  const [newStatus, setNewStatus] = useState<ReportStatus>('en_proceso');
  const [statusObs, setStatusObs] = useState<string>('');
  const [assignedCuadrilla, setAssignedCuadrilla] = useState<string>('');
  const [responsableName, setResponsableName] = useState<string>('Guardia Ambiental');

  // New Internal Note state
  const [internalNoteText, setInternalNoteText] = useState<string>('');

  // Cuadrillas options (Provincia de La Rioja)
  const cuadrillaOptions = [
    'Cuadrilla Pesada Municipal La Rioja (Palas mecánicas y batea)',
    'Cuadrilla Ágil #04 (Recolección y desmalezamiento de cauces)',
    'Unidad de Residuos Especiales y Agroquímicos (La Rioja)',
    'Bomberos de la Policía de La Rioja y Patrulla Ecológica',
    'Delegación Ambiental Chilecito / Famatina',
    'Cuadrilla Ambiental Región Los Llanos (Chamical / Chepes)',
    'Unidad de Gestión Ambiental Valles del Bermejo (Villa Unión)',
  ];

  // Filtered List
  const filteredList = useMemo(() => {
    return reports.filter((r) => {
      if (filterStatus !== 'todos' && r.estado !== filterStatus) return false;
      if (filterType !== 'todos' && r.tipoProblema !== filterType) return false;
      if (filterBarrio !== 'todos' && r.ubicacion.barrio !== filterBarrio) return false;

      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesId = r.id.toLowerCase().includes(query);
        const matchesCalle = r.ubicacion.calle.toLowerCase().includes(query);
        const matchesBarrio = r.ubicacion.barrio.toLowerCase().includes(query);
        const matchesDesc = r.descripcion.toLowerCase().includes(query);
        const matchesNombre = r.denunciante.nombre?.toLowerCase().includes(query);

        if (!matchesId && !matchesCalle && !matchesBarrio && !matchesDesc && !matchesNombre) {
          return false;
        }
      }

      return true;
    });
  }, [reports, filterStatus, filterType, filterBarrio, search]);

  const handleOpenDetail = (r: Denuncia) => {
    setSelectedReport(r);
    setNewStatus(r.estado);
    setAssignedCuadrilla(r.cuadrillaAsignada || cuadrillaOptions[0]);
    setStatusObs('');
    setInternalNoteText('');
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    const updated = storageService.updateReportStatus(
      selectedReport.id,
      newStatus,
      statusObs || `Cambio de estado a ${STATUS_CONFIG[newStatus].label}`,
      responsableName,
      assignedCuadrilla
    );

    if (updated) {
      setSelectedReport(updated);
      onRefreshReports();
      setStatusObs('');
    }
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !internalNoteText.trim()) return;

    storageService.addInternalObservation(selectedReport.id, internalNoteText.trim());
    const refreshed = storageService.getReportById(selectedReport.id);
    if (refreshed) {
      setSelectedReport(refreshed);
    }
    setInternalNoteText('');
    onRefreshReports();
  };

  const handleResetData = () => {
    if (confirm('¿Restablecer las denuncias del sistema a los datos de prueba iniciales?')) {
      storageService.resetDefaults();
      onRefreshReports();
      setSelectedReport(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Admin Header with Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-800/30 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Portal Oficial · La Rioja
              </span>
              <span className="text-xs text-emerald-300/80">Secretaría de Ambiente & Municipios Departamentales</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              Gestor Integral de Denuncias Ambientales · La Rioja
            </h1>
            <p className="text-xs text-emerald-200/80 max-w-xl">
              Consola de asignación de cuadrillas territoriales, fiscalización de focos y auditoría de saneamiento para inspectores provinciales y municipales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => storageService.exportToCSV(reports)}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
            <button
              onClick={handleResetData}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
              title="Restablecer base de datos inicial"
            >
              <RotateCcw className="w-4 h-4" /> Reset Mock
            </button>
            <button
              onClick={onExitAdmin}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow"
            >
              Cerrar Sesión Municipal
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-emerald-900/60">
          <button
            onClick={() => setActiveTab('denuncias')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'denuncias'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-emerald-200 hover:bg-emerald-900/40'
            }`}
          >
            <FileText className="w-4 h-4" /> Tabla de Denuncias ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('estadisticas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'estadisticas'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-emerald-200 hover:bg-emerald-900/40'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Estadísticas y Gráficos
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'estadisticas' ? (
        <AdminStats reports={reports} />
      ) : (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Búsqueda general
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Código, calle, barrio o vecino..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 bg-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Estado
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 bg-white font-medium"
                >
                  <option value="todos">Todos los estados</option>
                  {(Object.keys(STATUS_CONFIG) as ReportStatus[]).map((st) => (
                    <option key={st} value={st}>
                      {STATUS_CONFIG[st].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Tipo de residuo
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 bg-white font-medium"
                >
                  <option value="todos">Todos los tipos</option>
                  {(Object.keys(PROBLEM_TYPE_CONFIG) as ProblemType[]).map((pt) => (
                    <option key={pt} value={pt}>
                      {PROBLEM_TYPE_CONFIG[pt].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Barrio */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Barrio
                </label>
                <select
                  value={filterBarrio}
                  onChange={(e) => setFilterBarrio(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 bg-white font-medium"
                >
                  <option value="todos">Todos los barrios / departamentos</option>
                  {BARRIOS_DEFAULT.map((b) => (
                    <option key={b.id} value={b.nombre}>
                      {b.nombre} ({b.localidad})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
              <span>
                Mostrando <strong>{filteredList.length}</strong> de {reports.length} expedientes
              </span>
              {(filterStatus !== 'todos' || filterType !== 'todos' || filterBarrio !== 'todos' || search) && (
                <button
                  onClick={() => {
                    setFilterStatus('todos');
                    setFilterType('todos');
                    setFilterBarrio('todos');
                    setSearch('');
                  }}
                  className="text-emerald-700 hover:text-emerald-900 font-bold transition"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Complaints Table */}
          <div className="bg-white rounded-3xl border border-emerald-900/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Código</th>
                    <th className="p-4">Fecha/Hora</th>
                    <th className="p-4">Tipo de Problema</th>
                    <th className="p-4">Ubicación / Barrio</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Prioridad</th>
                    <th className="p-4">Denunciante</th>
                    <th className="p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredList.map((report) => {
                    const probCfg = PROBLEM_TYPE_CONFIG[report.tipoProblema];
                    const statCfg = STATUS_CONFIG[report.estado];

                    return (
                      <tr key={report.id} className="hover:bg-emerald-50/40 transition">
                        <td className="p-4 font-mono font-bold text-emerald-900">
                          {report.id}
                        </td>
                        <td className="p-4 text-gray-600 whitespace-nowrap">
                          {report.fecha}
                          <span className="block text-[10px] text-gray-400">{report.hora} hs</span>
                        </td>
                        <td className="p-4 font-semibold text-gray-900">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: probCfg.color }}
                            />
                            {probCfg.label}
                          </div>
                        </td>
                        <td className="p-4 text-gray-700">
                          <span className="font-semibold block">{report.ubicacion.barrio}</span>
                          <span className="text-[11px] text-gray-500 truncate max-w-[180px] block">
                            {report.ubicacion.calle} {report.ubicacion.numero}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statCfg.badgeBg} whitespace-nowrap`}
                          >
                            ● {statCfg.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              report.prioridad === 'urgente'
                                ? 'bg-red-100 text-red-800'
                                : report.prioridad === 'alta'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {report.prioridad}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">
                          {report.denunciante.esAnonima ? (
                            <span className="text-gray-400 font-medium italic">Anónima</span>
                          ) : (
                            <div>
                              <span className="font-semibold text-gray-800 block">
                                {report.denunciante.nombre} {report.denunciante.apellido}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {report.denunciante.telefono || report.denunciante.email}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenDetail(report)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition shadow-xs inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> Gestionar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredList.length === 0 && (
                <div className="p-10 text-center text-gray-500 space-y-2">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="font-semibold text-sm">No se encontraron denuncias con estos filtros</p>
                  <p className="text-xs">Intentá restablecer o ampliar los criterios de búsqueda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Management Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-black text-emerald-950 bg-emerald-100 px-3 py-1 rounded-xl">
                    {selectedReport.id}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                      STATUS_CONFIG[selectedReport.estado].badgeBg
                    }`}
                  >
                    ● {STATUS_CONFIG[selectedReport.estado].label}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-heading text-gray-900 mt-2">
                  Expediente y Gestión Operativa
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Evidence & Map */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-1.5">
                    Evidencias Multimedia ({selectedReport.evidencias.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.evidencias.map((ev) => (
                      <div
                        key={ev.id}
                        className="h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative group shadow-xs"
                      >
                        {ev.tipo === 'imagen' ? (
                          <img
                            src={ev.url}
                            alt={ev.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                            {ev.tipo.toUpperCase()}
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white rounded text-[9px] truncate max-w-[90%]">
                          {ev.nombre}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Map */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-1.5">
                    Geolocalización Catastral
                  </h4>
                  <div className="h-[200px] rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
                    <LeafletMap
                      height="200px"
                      center={[selectedReport.ubicacion.lat, selectedReport.ubicacion.lng]}
                      zoom={15}
                      reports={[selectedReport]}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    📍 {selectedReport.ubicacion.calle} {selectedReport.ubicacion.numero},{' '}
                    {selectedReport.ubicacion.barrio} (GPS: {selectedReport.ubicacion.lat},{' '}
                    {selectedReport.ubicacion.lng})
                  </p>
                </div>

                {/* Citizen identity box */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
                  <h4 className="font-bold text-gray-700 uppercase text-[10px]">
                    Datos del Denunciante (Uso Reservado de Guardia)
                  </h4>
                  {selectedReport.denunciante.esAnonima ? (
                    <p className="text-gray-500 italic">
                      🛡️ El ciudadano eligió la modalidad anónima. Datos no recopilados por garantía constitucional.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-gray-800 pt-1">
                      <div>
                        <strong>Nombre:</strong> {selectedReport.denunciante.nombre}{' '}
                        {selectedReport.denunciante.apellido}
                      </div>
                      <div>
                        <strong>DNI:</strong> {selectedReport.denunciante.dni || 'No informado'}
                      </div>
                      <div>
                        <strong>Tel:</strong> {selectedReport.denunciante.telefono || '-'}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedReport.denunciante.email || '-'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Update State & Internal Notes */}
              <div className="space-y-6">
                {/* Form to Change Status */}
                <form
                  onSubmit={handleUpdateStatus}
                  className="bg-emerald-50/60 p-5 rounded-3xl border border-emerald-200 space-y-4"
                >
                  <h4 className="font-bold text-sm text-emerald-950 font-heading flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Actualizar Estado y Asignación Operativa
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                        Nuevo Estado
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white font-bold text-gray-900"
                      >
                        {(Object.keys(STATUS_CONFIG) as ReportStatus[]).map((st) => (
                          <option key={st} value={st}>
                            {STATUS_CONFIG[st].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                        Cuadrilla Asignada
                      </label>
                      <select
                        value={assignedCuadrilla}
                        onChange={(e) => setAssignedCuadrilla(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                      >
                        <option value="">Sin cuadrilla asignada</option>
                        {cuadrillaOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                      Observación pública para el vecino (aparece en Mis Denuncias)
                    </label>
                    <textarea
                      rows={2}
                      value={statusObs}
                      onChange={(e) => setStatusObs(e.target.value)}
                      placeholder="Ej: Cuadrilla en camino para retiro de 10 tn de ramas y residuos áridos..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <input
                      type="text"
                      value={responsableName}
                      onChange={(e) => setResponsableName(e.target.value)}
                      placeholder="Nombre del funcionario/inspector"
                      className="px-3 py-1.5 text-xs rounded-xl border border-gray-300 bg-white flex-1"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition"
                    >
                      Guardar Cambio
                    </button>
                  </div>
                </form>

                {/* Internal Notes / Bitácora Interna */}
                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    Bitácora de Observaciones Internas (Confidencial)
                  </h4>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {selectedReport.observacionesInternas && selectedReport.observacionesInternas.length > 0 ? (
                      selectedReport.observacionesInternas.map((obs, i) => (
                        <div
                          key={i}
                          className="text-[11px] p-2 rounded-lg bg-white border border-gray-200 text-gray-700"
                        >
                          {obs}
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-gray-400 italic">No hay notas internas registradas aún.</p>
                    )}
                  </div>

                  <form onSubmit={handleAddInternalNote} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Agregar nota interna de inspección o acta..."
                      value={internalNoteText}
                      onChange={(e) => setInternalNoteText(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!internalNoteText.trim()}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Agregar
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
