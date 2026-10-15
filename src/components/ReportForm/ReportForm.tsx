import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Camera,
  Upload,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  FileText,
  AlertTriangle,
  LocateFixed,
  Eye,
  Info,
} from 'lucide-react';
import { ProblemType, EvidenciaItem, Denuncia } from '../../types';
import { PROBLEM_TYPE_CONFIG, BARRIOS_DEFAULT, DEPARTAMENTOS_LA_RIOJA } from '../../data/mockData';
import { LeafletMap } from '../Common/LeafletMap';
import { CameraModal } from './CameraModal';

interface ReportFormProps {
  onSubmitSuccess: (newReport: Denuncia) => void;
  onCancel: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSubmitSuccess, onCancel }) => {
  const [step, setStep] = useState<number>(1);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

  // Form State
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  const [fecha, setFecha] = useState<string>(defaultDate);
  const [hora, setHora] = useState<string>(defaultTime);
  const [tipoProblema, setTipoProblema] = useState<ProblemType>('basural_cielo_abierto');
  const [descripcion, setDescripcion] = useState<string>('');

  // Location State (Provincia de La Rioja)
  const [localidad, setLocalidad] = useState<string>('La Rioja (Capital)');
  const [barrio, setBarrio] = useState<string>('Barrio San Vicente');
  const [calle, setCalle] = useState<string>('');
  const [numero, setNumero] = useState<string>('');
  const [referencias, setReferencias] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -29.4182,
    lng: -66.8624,
  });
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Evidences
  const [evidencias, setEvidencias] = useState<EvidenciaItem[]>([
    {
      id: 'demo-photo',
      tipo: 'imagen',
      url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      nombre: 'foto_residuo_terreno.jpg',
      tamano: '2.1 MB',
      fechaCarga: `${defaultDate} ${defaultTime}`,
    },
  ]);

  // Citizen data
  const [esAnonima, setEsAnonima] = useState<boolean>(false);
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [dni, setDni] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Validation
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick preset coordinates for barrio selector
  const handleBarrioChange = (selectedBarrio: string) => {
    setBarrio(selectedBarrio);
    const found = BARRIOS_DEFAULT.find((b) => b.nombre === selectedBarrio);
    if (found) {
      setCoords({ lat: found.lat, lng: found.lng });
      setLocalidad(found.localidad);
    }
  };

  const handleLocalidadChange = (selectedLocalidad: string) => {
    setLocalidad(selectedLocalidad);
    // Find first barrio of this locality or set department center
    const matchingBarrio = BARRIOS_DEFAULT.find((b) => b.localidad === selectedLocalidad);
    if (matchingBarrio) {
      setBarrio(matchingBarrio.nombre);
      setCoords({ lat: matchingBarrio.lat, lng: matchingBarrio.lng });
    }
  };

  // GPS geolocation button
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('La geolocalización no es compatible con este navegador.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
        setGpsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsError('No se pudo acceder a tu ubicación automática. Podés arrastrar el pin del mapa.');
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Add evidence from camera
  const handleCameraCapture = (dataUrl: string, fileName: string) => {
    const newItem: EvidenciaItem = {
      id: `ev-${Date.now()}`,
      tipo: 'imagen',
      url: dataUrl,
      nombre: fileName,
      tamano: 'Captura HD',
      fechaCarga: `${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`,
    };
    setEvidencias((prev) => [...prev, newItem]);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      const isPdf = file.type.includes('pdf');
      const tipo: 'imagen' | 'video' | 'documento' = isVideo
        ? 'video'
        : isPdf
        ? 'documento'
        : 'imagen';

      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        const newItem: EvidenciaItem = {
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          tipo,
          url: result,
          nombre: file.name,
          tamano: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          fechaCarga: `${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`,
        };
        setEvidencias((prev) => [...prev, newItem]);
      };

      reader.readAsDataURL(file);
    });
  };

  const removeEvidence = (id: string) => {
    setEvidencias((prev) => prev.filter((item) => item.id !== id));
  };

  // Step Validation
  const validateStep = (currentStep: number): boolean => {
    const errors: string[] = [];
    if (currentStep === 1) {
      if (!descripcion.trim() || descripcion.trim().length < 15) {
        errors.push('Por favor ingresá una descripción detallada (mínimo 15 caracteres).');
      }
    } else if (currentStep === 2) {
      if (!calle.trim()) {
        errors.push('Por favor ingresá el nombre de la calle o avenida.');
      }
      if (!barrio.trim()) {
        errors.push('Por favor seleccioná o ingresá un barrio.');
      }
    } else if (currentStep === 3) {
      if (evidencias.length === 0) {
        errors.push('Es necesario adjuntar al menos una fotografía o evidencia visual.');
      }
    } else if (currentStep === 4) {
      if (!esAnonima) {
        if (!nombre.trim()) errors.push('Por favor ingresá tu nombre o activá Denuncia Anónima.');
        if (!telefono.trim() && !email.trim()) {
          errors.push('Por favor indicá al menos un medio de contacto (teléfono o correo).');
        }
      }
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setFormErrors([]);
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newId = `AA-${year}-${randomDigits}`;

    const newReport: Denuncia = {
      id: newId,
      fecha,
      hora,
      tipoProblema,
      descripcion,
      ubicacion: {
        localidad,
        barrio,
        calle,
        numero: numero.trim() || 's/n',
        referencias,
        lat: coords.lat,
        lng: coords.lng,
      },
      evidencias,
      denunciante: {
        esAnonima,
        nombre: esAnonima ? undefined : nombre,
        apellido: esAnonima ? undefined : apellido,
        dni: esAnonima ? undefined : dni,
        telefono: esAnonima ? undefined : telefono,
        email: esAnonima ? undefined : email,
      },
      estado: 'recibida',
      prioridad: tipoProblema === 'residuos_peligrosos' || tipoProblema === 'quema_basura' ? 'alta' : 'media',
      historial: [
        {
          id: `h-${Date.now()}`,
          estado: 'recibida',
          fecha: `${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`,
          observacion: 'Denuncia registrada con éxito por el vecino a través de la plataforma Alerta Ambiental.',
          responsable: 'Sistema Alerta Ambiental',
        },
      ],
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess(newReport);
    }, 600);
  };

  const stepsList = [
    { num: 1, title: 'Datos', subtitle: 'Tipo y descripción' },
    { num: 2, title: 'Ubicación', subtitle: 'Calle y GPS' },
    { num: 3, title: 'Evidencia', subtitle: 'Fotos y videos' },
    { num: 4, title: 'Denunciante', subtitle: 'Datos o anónimo' },
    { num: 5, title: 'Revisión', subtitle: 'Confirmar y enviar' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner & Title */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm text-emerald-800 hover:text-emerald-950 font-semibold mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-emerald-950">
              Formulario de Denuncia Ambiental
            </h1>
            <p className="text-sm text-emerald-800/80 mt-1">
              Completá los pasos para notificar a la guardia ambiental del municipio.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700" /> Trámite Oficial Gratuito
          </span>
        </div>
      </div>

      {/* Wizard Progress Steps */}
      <div className="mb-8 bg-white rounded-2xl p-4 sm:p-5 border border-emerald-900/10 shadow-sm">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 text-center">
          {stepsList.map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (s.num < step) setStep(s.num);
                }}
                className={`flex flex-col items-center transition cursor-pointer ${
                  isCurrent
                    ? 'text-emerald-900 font-bold'
                    : isCompleted
                    ? 'text-emerald-700'
                    : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-all ${
                    isCurrent
                      ? 'bg-emerald-700 text-white shadow-md ring-4 ring-emerald-100'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : s.num}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">{s.title}</span>
                <span className="text-[10px] text-gray-500 hidden md:inline">{s.subtitle}</span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Validation Error Banner */}
      {formErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Por favor verificá los siguientes datos:</span>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-red-700">
              {formErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Step Container Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-sm transition-all">
        {/* ================= STEP 1: DATOS DEL EVENTO ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold font-heading text-gray-900">1. Datos del Evento</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Especificá la fecha, hora y tipología del foco de contaminación o residuos.
              </p>
            </div>

            {/* Date and Time Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1 text-emerald-700" /> Fecha del suceso
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline mr-1 text-emerald-700" /> Hora estimada
                </label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm bg-white"
                />
              </div>
            </div>

            {/* Problem Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Tipo de problema ambiental
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(PROBLEM_TYPE_CONFIG) as ProblemType[]).map((key) => {
                  const item = PROBLEM_TYPE_CONFIG[key];
                  const isSelected = tipoProblema === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setTipoProblema(key)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition text-left flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500'
                          : 'border-gray-200 hover:border-emerald-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-sm text-gray-900">{item.label}</span>
                        <span
                          className="w-4 h-4 rounded-full border flex items-center justify-center"
                          style={{
                            borderColor: isSelected ? '#059669' : '#cbd5e1',
                            backgroundColor: isSelected ? '#059669' : 'transparent',
                          }}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description multiline */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Descripción detallada del problema
                </label>
                <span className="text-[11px] text-gray-400">
                  {descripcion.length} caracteres (mínimo 15)
                </span>
              </div>
              <textarea
                rows={4}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describí con la mayor precisión posible: volumen aproximado (bolsas, camiones), si hay olores nauseabundos, presencia de roedores, quema encendida o líquidos derramados..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm leading-relaxed"
              />
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-800/80">
                <Info className="w-3.5 h-3.5" />
                <span>Un relato detallado acelera la asignación de maquinaria pesada o inspectores.</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: UBICACIÓN ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold font-heading text-gray-900">2. Ubicación del Lugar</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Indicá la dirección exacta y ajustá el pin en el mapa para guiar a las cuadrillas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Departamento / Localidad de La Rioja
                </label>
                <select
                  value={localidad}
                  onChange={(e) => handleLocalidadChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-sm bg-white font-medium"
                >
                  {DEPARTAMENTOS_LA_RIOJA.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Barrio o Zona
                </label>
                <select
                  value={barrio}
                  onChange={(e) => handleBarrioChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-sm bg-white font-medium"
                >
                  {BARRIOS_DEFAULT.map((b) => (
                    <option key={b.id} value={b.nombre}>
                      {b.nombre} ({b.localidad})
                    </option>
                  ))}
                  <option value="Otro Barrio de La Rioja">Otro barrio / paraje (especificar en referencias)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Calle / Avenida / Ruta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. San Nicolás de Bari, Pelagio B. Luna, Av. Ortiz de Ocampo o Ruta 38"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Altura / Km / Número
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1420, Km 14 o s/n"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Referencias visuales del lugar
              </label>
              <input
                type="text"
                placeholder="Ej: Junto al cauce del Río Tajamar, frente al cerro del Velasco, cerca de la acequia o ex predio ferroviario"
                value={referencias}
                onChange={(e) => setReferencias(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-sm"
              />
            </div>

            {/* Map Geolocation Widget */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Ubicación en Mapa Interactivo
                  </h3>
                  <p className="text-xs text-gray-500">
                    Podés arrastrar el marcador verde para colocarlo exactamente sobre el basural.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gpsLoading}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-semibold text-xs rounded-xl transition shadow-xs self-start"
                >
                  <LocateFixed className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                  {gpsLoading ? 'Detectando GPS...' : 'Usar mi ubicación GPS actual'}
                </button>
              </div>

              {gpsError && (
                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-3">
                  {gpsError}
                </p>
              )}

              <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <LeafletMap
                  height="300px"
                  center={[coords.lat, coords.lng]}
                  zoom={15}
                  interactiveMarker={{
                    lat: coords.lat,
                    lng: coords.lng,
                    onDragEnd: (newLat, newLng) => {
                      setCoords({
                        lat: Number(newLat.toFixed(6)),
                        lng: Number(newLng.toFixed(6)),
                      });
                    },
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 px-1">
                <span>Coordenadas fijadas: Lat {coords.lat}, Lng {coords.lng}</span>
                <span className="text-emerald-700 font-medium">Marcador arrastrable activado</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: EVIDENCIA VISUAL ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold font-heading text-gray-900">3. Evidencia Visual y Documental</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Las fotografías y videos son el insumo principal para que la municipalidad envíe la maquinaria correcta.
              </p>
            </div>

            {/* Action Buttons: Live Camera or File Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="p-5 rounded-2xl border-2 border-emerald-600 bg-emerald-50/50 hover:bg-emerald-100/60 transition flex items-center gap-4 text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">Tomar foto con la cámara</h3>
                  <p className="text-xs text-emerald-800/80 mt-0.5">
                    Abrí la cámara en tiempo real desde tu celular o computadora.
                  </p>
                </div>
              </button>

              <label className="p-5 rounded-2xl border-2 border-dashed border-gray-300 hover:border-emerald-500 bg-gray-50/70 hover:bg-emerald-50/30 transition flex items-center gap-4 text-left cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-gray-200 group-hover:bg-emerald-200 text-gray-700 group-hover:text-emerald-800 flex items-center justify-center shrink-0 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-950">
                    Subir fotos o videos
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    JPG, PNG, MP4 o PDF desde tu galería de archivos.
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Evidence Previews List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Archivos adjuntos ({evidencias.length})
                </h3>
                <span className="text-xs text-emerald-700 font-medium">
                  {evidencias.length > 0 ? '✓ Al menos 1 evidencia cargada' : 'Obligatorio'}
                </span>
              </div>

              {evidencias.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center space-y-2 bg-gray-50">
                  <Camera className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-semibold text-gray-600">No hay archivos cargados aún</p>
                  <p className="text-xs text-gray-400">
                    Hacé clic arriba para tomar una fotografía o seleccionar una desde tu dispositivo.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {evidencias.map((item) => (
                    <div
                      key={item.id}
                      className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
                    >
                      {item.tipo === 'imagen' ? (
                        <div className="h-36 w-full bg-gray-100 overflow-hidden relative">
                          <img
                            src={item.url}
                            alt={item.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white rounded text-[10px] backdrop-blur-xs">
                            Foto
                          </span>
                        </div>
                      ) : item.tipo === 'video' ? (
                        <div className="h-36 w-full bg-black flex items-center justify-center relative">
                          <video src={item.url} className="max-h-full max-w-full" controls />
                        </div>
                      ) : (
                        <div className="h-36 w-full bg-emerald-50 flex items-center justify-center">
                          <FileText className="w-12 h-12 text-emerald-700" />
                        </div>
                      )}

                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-900 truncate" title={item.nombre}>
                            {item.nombre}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{item.tamano || 'Archivo'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEvidence(item.id)}
                          className="mt-2 text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 self-start transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 4: DATOS DEL DENUNCIANTE ================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold font-heading text-gray-900">4. Datos del Denunciante</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Podés brindar tus datos para recibir novedades por correo o realizar la denuncia de forma anónima.
              </p>
            </div>

            {/* Anonymous Toggle Box */}
            <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-bold text-sm text-emerald-950">Denuncia Anónima</h3>
                </div>
                <p className="text-xs text-emerald-800/80">
                  Activá este interruptor si preferís no revelar tu identidad. Tus datos no se solicitarán ni quedarán vinculados.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={esAnonima}
                  onChange={(e) => setEsAnonima(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-13 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            {esAnonima ? (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-2">
                <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-gray-800">Modo Anónimo Activado</h4>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  La denuncia será tramitada con la misma celeridad y validez. Guardá tu Código Único al finalizar para consultar el estado en la sección "Mis Denuncias".
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Apellido
                    </label>
                    <input
                      type="text"
                      placeholder="Tu apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      DNI (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 38.123.456"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Teléfono / WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej: 11-4589-2104"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="nombre@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-600 text-sm"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl text-xs text-emerald-800 flex items-start gap-2 border border-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Protección de Privacidad:</strong> Tus datos personales nunca se publicarán en el mapa ni estarán visibles para terceros. Solo el personal municipal autorizado podrá comunicarse si requiere precisiones.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 5: REVISAR DENUNCIA ================= */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold font-heading text-gray-900">5. Revisar Denuncia</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Por favor verificá que todos los datos sean exactos antes de efectuar el envío formal.
              </p>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Problema Ambiental
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PROBLEM_TYPE_CONFIG[tipoProblema].color }}
                  />
                  <h4 className="font-bold text-gray-900 text-base">
                    {PROBLEM_TYPE_CONFIG[tipoProblema].label}
                  </h4>
                </div>
                <p className="text-xs text-gray-600 line-clamp-3 italic">
                  "{descripcion}"
                </p>
                <div className="pt-2 text-[11px] text-gray-500 border-t border-gray-200 flex justify-between">
                  <span>Fecha: {fecha}</span>
                  <span>Hora: {hora} hs</span>
                </div>
              </div>

              {/* Location card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Ubicación Reportada
                </span>
                <h4 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {calle} {numero || 's/n'}
                </h4>
                <p className="text-xs text-gray-600">
                  {barrio}, {localidad}
                </p>
                {referencias && (
                  <p className="text-xs text-gray-500 bg-white p-2 rounded-lg border border-gray-100">
                    Ref: {referencias}
                  </p>
                )}
                <div className="pt-2 text-[11px] text-gray-500 border-t border-gray-200">
                  GPS: {coords.lat}, {coords.lng}
                </div>
              </div>
            </div>

            {/* Evidences summary preview */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                Evidencias ({evidencias.length})
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {evidencias.map((item) => (
                  <div
                    key={item.id}
                    className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100 relative shadow-xs"
                  >
                    {item.tipo === 'imagen' ? (
                      <img src={item.url} alt="Evidencia" className="w-full h-full object-cover" />
                    ) : item.tipo === 'video' ? (
                      <div className="w-full h-full bg-black flex items-center justify-center text-white text-[10px]">
                        Video
                      </div>
                    ) : (
                      <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-[10px] font-bold">
                        PDF
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Denunciante info */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-semibold">Identificación:</span>
              <span className="font-bold text-gray-800">
                {esAnonima ? (
                  <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    🛡️ Denuncia Anónima
                  </span>
                ) : (
                  `${nombre} ${apellido} (${telefono || email})`
                )}
              </span>
            </div>

            {/* Legal Warning Notice (Required by user brief) */}
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                <span>Declaración Jurada y Aviso Legal Obligatorio</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Declaro bajo juramento que los datos aportados en esta denuncia corresponden a hechos reales y verídicos observados en el territorio. Toda denuncia falsa o maliciosa podrá dar lugar a las sanciones administrativas y penales correspondientes según la legislación ambiental vigente. Las denuncias serán analizadas e investigadas por el cuerpo de inspectores municipales.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 rounded-xl text-gray-500 hover:bg-gray-100 font-semibold text-sm transition"
            >
              Cancelar
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 ml-auto"
            >
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-base shadow-xl hover:shadow-2xl transition flex items-center gap-2 ml-auto disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registrando en sistema...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Enviar Denuncia
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Camera Live Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
