import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Flame,
  Droplet,
  Layers,
  Leaf,
  Download,
} from 'lucide-react';
import { Denuncia, ProblemType, ReportStatus } from '../../types';
import { PROBLEM_TYPE_CONFIG, STATUS_CONFIG } from '../../data/mockData';
import { storageService } from '../../services/storage';

interface AdminStatsProps {
  reports: Denuncia[];
}

export const AdminStats: React.FC<AdminStatsProps> = ({ reports }) => {
  // Statistics calculations
  const totalReports = reports.length;

  const resueltasCount = useMemo(
    () => reports.filter((r) => r.estado === 'resuelta' || r.estado === 'cerrada').length,
    [reports]
  );

  const enProcesoCount = useMemo(
    () => reports.filter((r) => r.estado === 'en_proceso' || r.estado === 'derivada').length,
    [reports]
  );

  const pendientesCount = useMemo(
    () => reports.filter((r) => r.estado === 'recibida' || r.estado === 'en_revision').length,
    [reports]
  );

  const tasaResolucion = totalReports > 0 ? Math.round((resueltasCount / totalReports) * 100) : 0;

  // Breakdown by neighborhood (Barrio)
  const byBarrio = useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      const b = r.ubicacion.barrio || 'Sin especificar';
      counts[b] = (counts[b] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([barrio, count]) => ({ barrio, count }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  // Breakdown by problem type
  const byType = useMemo(() => {
    const counts: Record<ProblemType, number> = {
      basural_cielo_abierto: 0,
      acumulacion_residuos: 0,
      quema_basura: 0,
      residuos_peligrosos: 0,
      contaminacion_agua_suelo: 0,
      otro: 0,
    };

    reports.forEach((r) => {
      counts[r.tipoProblema] = (counts[r.tipoProblema] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => ({
      type: type as ProblemType,
      label: PROBLEM_TYPE_CONFIG[type as ProblemType]?.label || type,
      color: PROBLEM_TYPE_CONFIG[type as ProblemType]?.color || '#10B981',
      count,
      pct: totalReports > 0 ? Math.round((count / totalReports) * 100) : 0,
    }));
  }, [reports, totalReports]);

  // Estimated environmental impact
  const toneladasRetiradas = resueltasCount * 8.5; // average estimated tons per resolved dump
  const m2Recuperados = resueltasCount * 220; // average m2 rehabilitated

  // Monthly trend mock/real calculation
  const monthlyTrend = [
    { mes: 'Mayo', total: 18, resueltas: 14 },
    { mes: 'Junio', total: 24, resueltas: 20 },
    { mes: 'Julio', total: 31, resueltas: 27 },
    { mes: 'Agosto', total: 38, resueltas: 33 },
    { mes: 'Septiembre', total: 42, resueltas: 36 },
    { mes: 'Octubre (Actual)', total: totalReports, resueltas: resueltasCount },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">Total Denuncias</span>
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-heading">
              {totalReports}
            </span>
            <span className="text-xs text-emerald-800 block mt-1 font-medium">
              100% georreferenciadas
            </span>
          </div>
        </div>

        {/* KPI 2: Resueltas */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">Casos Resueltos</span>
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-heading">
              {resueltasCount}
            </span>
            <span className="text-xs text-gray-500 block mt-1 font-medium">
              Tasa de éxito: <strong>{tasaResolucion}%</strong>
            </span>
          </div>
        </div>

        {/* KPI 3: En Proceso */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">En Operación</span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-heading">
              {enProcesoCount}
            </span>
            <span className="text-xs text-amber-800 block mt-1 font-medium">
              Cuadrillas en territorio
            </span>
          </div>
        </div>

        {/* KPI 4: Pendientes */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-500">Pendientes Guardia</span>
            <span className="p-2 bg-rose-50 text-rose-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-rose-600 font-heading">
              {pendientesCount}
            </span>
            <span className="text-xs text-rose-700 block mt-1 font-medium">
              En triage e inspección
            </span>
          </div>
        </div>
      </div>

      {/* Environmental Impact Metrics Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-white">
                Impacto Ambiental y Ecológico Estimado
              </h3>
              <p className="text-xs text-emerald-200/80">
                Métricas estimadas a partir de las denuncias resueltas y focos saneados.
              </p>
            </div>
          </div>
          <button
            onClick={() => storageService.exportToCSV(reports)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition self-start sm:self-auto"
          >
            <Download className="w-4 h-4" /> Exportar Informe CSV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <span className="text-xs font-medium text-emerald-200">Residuos Retirados</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
              ~{toneladasRetiradas.toFixed(1)} tn
            </div>
            <p className="text-[11px] text-emerald-100/70 mt-1">
              Evita lixiviados en napas subterráneas.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <span className="text-xs font-medium text-emerald-200">Superficie Recuperada</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
              ~{m2Recuperados.toLocaleString()} m²
            </div>
            <p className="text-[11px] text-emerald-100/70 mt-1">
              Predios baldíos y riberas reintegradas.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <span className="text-xs font-medium text-emerald-200">Focos de Vectores Eliminados</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-1">
              {resueltasCount} puntos
            </div>
            <p className="text-[11px] text-emerald-100/70 mt-1">
              Prevención activa de dengue y roedores.
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Denuncias por Barrio */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base font-heading text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" /> Denuncias por Barrio y Localidad (La Rioja)
            </h3>
            <span className="text-xs text-gray-500 font-medium">Distribución territorial</span>
          </div>

          <div className="space-y-3 pt-2">
            {byBarrio.map((item) => {
              const maxCount = byBarrio[0]?.count || 1;
              const barWidth = Math.max(12, Math.round((item.count / maxCount) * 100));

              return (
                <div key={item.barrio} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">{item.barrio}</span>
                    <span className="font-bold text-emerald-900">
                      {item.count} {item.count === 1 ? 'denuncia' : 'denuncias'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Distribución por Tipo de Problema */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base font-heading text-gray-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-700" /> Denuncias por Tipo de Problema
            </h3>
            <span className="text-xs text-gray-500 font-medium">% del total</span>
          </div>

          <div className="space-y-3 pt-2">
            {byType.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="font-bold text-gray-900">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Evolución Mensual (Tendencia) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base font-heading text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-700" /> Evolución Mensual de Denuncias y Saneamiento
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Comparativa entre denuncias ingresadas y casos resueltos por mes.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-900">
                <span className="w-3 h-3 bg-emerald-600 rounded-sm" /> Ingresadas
              </span>
              <span className="flex items-center gap-1.5 text-teal-700">
                <span className="w-3 h-3 bg-teal-400 rounded-sm" /> Saneadas
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end pt-8 pb-4 h-56 border-b border-gray-200">
            {monthlyTrend.map((m) => {
              const maxVal = 50;
              const totalHeight = Math.min(100, Math.round((m.total / maxVal) * 100));
              const resueltaHeight = Math.min(100, Math.round((m.resueltas / maxVal) * 100));

              return (
                <div key={m.mes} className="flex flex-col items-center h-full justify-end group">
                  <div className="w-full max-w-[48px] flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                    {/* Total Bar */}
                    <div
                      className="w-1/2 bg-emerald-600 rounded-t-lg transition-all group-hover:bg-emerald-700 relative"
                      style={{ height: `${totalHeight}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded transition pointer-events-none">
                        {m.total}
                      </span>
                    </div>
                    {/* Resueltas Bar */}
                    <div
                      className="w-1/2 bg-teal-400 rounded-t-lg transition-all group-hover:bg-teal-500 relative"
                      style={{ height: `${resueltaHeight}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-teal-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded transition pointer-events-none">
                        {m.resueltas}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-600 mt-2 truncate w-full text-center">
                    {m.mes.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
