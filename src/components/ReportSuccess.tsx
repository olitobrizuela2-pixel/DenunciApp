import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Copy,
  Check,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Share2,
} from 'lucide-react';
import { Denuncia } from '../types';
import { STATUS_CONFIG, PROBLEM_TYPE_CONFIG } from '../data/mockData';

interface ReportSuccessProps {
  report: Denuncia;
  onGoToTracking: (code: string) => void;
  onGoToMap: () => void;
  onNewReport: () => void;
  onGoHome: () => void;
}

export const ReportSuccess: React.FC<ReportSuccessProps> = ({
  report,
  onGoToTracking,
  onGoToMap,
  onNewReport,
  onGoHome,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Launch festive eco confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10B981', '#34D399', '#F59E0B'],
      });
    } catch (e) {
      // safe fallback
    }
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(report.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const statusConfig = STATUS_CONFIG[report.estado];
  const problemConfig = PROBLEM_TYPE_CONFIG[report.tipoProblema];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-900/10 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
        {/* Animated Green Badge */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider rounded-full">
            Registro Oficial Exitoso
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-950">
            ¡Tu denuncia fue registrada correctamente!
          </h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Agradecemos tu compromiso ciudadano para erradicar los basurales a cielo abierto y proteger el ambiente comunitario.
          </p>
        </div>

        {/* Unique Code Box */}
        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border-2 border-emerald-200/80 text-left space-y-3">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold uppercase tracking-wider">
            <span>Código Único de Denuncia</span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Válido para seguimiento
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-xl sm:text-2xl font-mono font-black tracking-wider text-emerald-900">
              {report.id}
            </span>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar Código
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t border-emerald-200/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Fecha: {report.fecha}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Hora: {report.hora} hs</span>
            </div>
            <div className="col-span-2 flex items-center justify-between mt-1 pt-1 border-t border-dashed border-emerald-200/60">
              <span className="text-gray-500 font-medium">Estado inicial:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${statusConfig.badgeBg}`}>
                ● {statusConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Details */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-left text-xs space-y-2">
          <div className="flex justify-between items-center text-gray-700">
            <span className="font-semibold text-gray-500">Problema:</span>
            <span className="font-bold">{problemConfig.label}</span>
          </div>
          <div className="flex justify-between items-center text-gray-700">
            <span className="font-semibold text-gray-500">Ubicación:</span>
            <span className="font-medium text-right truncate max-w-[240px]">
              {report.ubicacion.calle} {report.ubicacion.numero}, {report.ubicacion.barrio}
            </span>
          </div>
          <div className="flex justify-between items-center text-gray-700">
            <span className="font-semibold text-gray-500">Modalidad:</span>
            <span>{report.denunciante.esAnonima ? '🛡️ Anónima protegida' : 'Identificada con datos'}</span>
          </div>
        </div>

        {/* What happens next roadmap */}
        <div className="text-left bg-emerald-900 text-white p-5 rounded-2xl space-y-3">
          <h4 className="font-bold text-sm text-emerald-200 font-heading">
            Próximos pasos de la guardia ambiental:
          </h4>
          <ol className="text-xs text-emerald-100/90 space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Inspección y verificación técnica:</strong> Se evalúa la gravedad y el catastro del predio denunciado.
            </li>
            <li>
              <strong>Asignación de cuadrilla:</strong> La Dirección de Higiene Urbana despacha palas mecánicas y camiones recolectores.
            </li>
            <li>
              <strong>Saneamiento y cierre:</strong> Se limpia el terreno, se perimetra y se labran las actas correspondientes.
            </li>
          </ol>
        </div>

        {/* Navigation Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onGoToTracking(report.id)}
            className="py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" /> Seguir en "Mis Denuncias"
          </button>

          <button
            onClick={onGoToMap}
            className="py-3 px-5 rounded-2xl border-2 border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4 text-emerald-600" /> Ver en el Mapa
          </button>

          <button
            onClick={onNewReport}
            className="py-2.5 px-4 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold transition"
          >
            Realizar otra denuncia
          </button>

          <button
            onClick={onGoHome}
            className="py-2.5 px-4 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold transition"
          >
            Volver a la pantalla principal
          </button>
        </div>
      </div>
    </div>
  );
};
