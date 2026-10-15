import React, { useState } from 'react';
import {
  FileText,
  X,
  Copy,
  Check,
  Database,
  Layers,
  Layout,
  Server,
  ShieldCheck,
  MapPin,
  Code,
  BookOpen,
} from 'lucide-react';

interface TechnicalDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechnicalDocsModal: React.FC<TechnicalDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sitemap' | 'db' | 'stack' | 'wcag'>('sitemap');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (section: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sitemapContent = `
=============================================================================
ARQUITECTURA DE NAVEGACIÓN (SITEMAP) & WIREFRAMES - "ALERTA AMBIENTAL LA RIOJA"
=============================================================================

ÁREA GEOGRÁFICA DE APLICACIÓN:
Provincia de La Rioja, República Argentina (18 Departamentos: Capital, Chilecito,
Chamical, Arauco, Rosario Vera Peñaloza, Cnel. Felipe Varela, Famatina, Sanagasta, etc.)

1. SITEMAP GENERAL DE LA APLICACIÓN

[ Inicio / Home ]
   ├── [ Realizar una Denuncia ] (Flujo guiado en 5 pasos)
   │     ├── Paso 1: Datos del Evento (Fecha, Hora, Tipo, Descripción)
   │     ├── Paso 2: Ubicación & Mapa (Calle, Altura, Barrio, Pin GPS)
   │     ├── Paso 3: Evidencias (Cámara en vivo, Fotos, Videos, Docs)
   │     ├── Paso 4: Denunciante (Datos de contacto o Switch Anónimo)
   │     └── Paso 5: Revisión, Declaración Jurada & Envío
   │           └── [ Pantalla Post-Envío ] (Código Único #AA-2026-XXXX)
   │
   ├── [ Mis Denuncias (Seguimiento) ]
   │     ├── Buscador por Código Único
   │     ├── Listado de Denuncias Guardadas en el Dispositivo
   │     └── Ficha de Detalle con Barra de Progreso de 6 Estados:
   │           (Recibida -> En revisión -> Derivada -> En proceso -> Resuelta -> Cerrada)
   │
   ├── [ Mapa Público de Denuncias ]
   │     ├── Cartografía con marcadores por estado (Rojo, Amarillo, Verde)
   │     ├── Filtros dinámicos (Tipo, Estado, Barrio)
   │     └── Ficha flotante resumen (Estricta privacidad sin datos personales)
   │
   └── [ Portal Administrativo / Municipalidad ] (Acceso Restringido)
         ├── Gestor de Denuncias (Tabla con filtros y búsqueda)
         ├── Auditoría de Evidencias y Catastro GPS
         ├── Modificación de Estado y Asignación de Cuadrillas
         ├── Bitácora Interna de Observaciones
         └── Panel de Estadísticas e Impacto Ambiental (Gráficos)


2. WIREFRAMES TEXTUALES DE PANTALLAS PRINCIPALES

+-------------------------------------------------------------------------+
| [LOGO] ALERTA AMBIENTAL         [Denunciar] [Mis Denuncias] [Mapa] [Admin]
+-------------------------------------------------------------------------+
| HERO: Transformemos nuestra comunidad en un entorno libre de basurales. |
|                                                                         |
|  [ + REALIZAR DENUNCIA ]     [ VER MIS DENUNCIAS ]    [ MAPA EN VIVO ]  |
|                                                                         |
| CONTADORES EN VIVO:                                                     |
| [ 142 Denuncias ]   [ 89 Saneados ]   [ 24 En Proceso ]   [ 80% Éxito ] |
+-------------------------------------------------------------------------+
| SECCIÓN EDUCATIVA: ¿Por qué erradicar los basurales?                    |
| [Vectores de Dengue]     [Lixiviados en Napas]     [Gases Tóxicos/Humo] |
+-------------------------------------------------------------------------+
| PASO A PASO CIUDADANO (1. Reportás -> 2. Código -> 3. Cuadrilla -> 4. Fin)
+-------------------------------------------------------------------------+
`;

  const dbSchemaContent = `
=============================================================================
ESQUEMA DE BASE DE DATOS RELACIONAL (POSTGRESQL / FIRESTORE MODEL)
=============================================================================

1. TABLA: Denuncia
   - id: VARCHAR(30) PRIMARY KEY (ej: 'AA-2026-8942')
   - fecha_creacion: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   - fecha_incidente: DATE NOT NULL
   - hora_incidente: TIME NOT NULL
   - tipo_problema: ENUM (
       'basural_cielo_abierto',
       'acumulacion_residuos',
       'quema_basura',
       'residuos_peligrosos',
       'contaminacion_agua_suelo',
       'otro'
     ) NOT NULL
   - descripcion: TEXT NOT NULL
   - localidad: VARCHAR(100) NOT NULL
   - barrio: VARCHAR(100) NOT NULL
   - calle: VARCHAR(150) NOT NULL
   - numero: VARCHAR(20)
   - referencias_visuales: TEXT
   - latitud: DECIMAL(10, 8) NOT NULL
   - longitud: DECIMAL(11, 8) NOT NULL
   - estado: ENUM (
       'recibida',
       'en_revision',
       'derivada',
       'en_proceso',
       'resuelta',
       'cerrada'
     ) DEFAULT 'recibida'
   - prioridad: ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media'
   - es_anonima: BOOLEAN DEFAULT FALSE NOT NULL
   - cuadrilla_asignada: VARCHAR(150)
   - usuario_id: UUID REFERENCES Usuario(id) ON DELETE SET NULL
   - fecha_resolucion: TIMESTAMP WITH TIME ZONE

2. TABLA: Usuario (Denunciante)
   - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - nombre: VARCHAR(80)
   - apellido: VARCHAR(80)
   - dni: VARCHAR(20)
   - telefono: VARCHAR(40)
   - email: VARCHAR(120)
   - fecha_registro: TIMESTAMP DEFAULT NOW()

3. TABLA: Evidencia
   - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - denuncia_id: VARCHAR(30) REFERENCES Denuncia(id) ON DELETE CASCADE
   - tipo_archivo: ENUM('imagen', 'video', 'documento') NOT NULL
   - url_almacenamiento: TEXT NOT NULL
   - nombre_original: VARCHAR(255) NOT NULL
   - tamano_bytes: BIGINT
   - hash_integridad: VARCHAR(64)
   - fecha_subida: TIMESTAMP DEFAULT NOW()

4. TABLA: HistorialEstado (Trazabilidad y Auditoría)
   - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - denuncia_id: VARCHAR(30) REFERENCES Denuncia(id) ON DELETE CASCADE
   - estado_anterior: VARCHAR(50)
   - estado_nuevo: VARCHAR(50) NOT NULL
   - fecha_modificacion: TIMESTAMP DEFAULT NOW()
   - observacion_publica: TEXT
   - responsable_admin_id: UUID REFERENCES Admin(id)

5. TABLA: Admin (Personal Municipal)
   - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - legajo_municipal: VARCHAR(30) UNIQUE NOT NULL
   - nombre_completo: VARCHAR(120) NOT NULL
   - email_institucional: VARCHAR(120) UNIQUE NOT NULL
   - rol: ENUM('operador_guardia', 'inspector_campo', 'coordinador_cuadrilla', 'superadmin')
   - area: VARCHAR(100) (ej: 'Dirección de Gestión Ambiental')
`;

  const techStackContent = `
=============================================================================
RECOMENDACIÓN DE STACK TECNOLÓGICO INDUSTRIAL Y JUSTIFICACIÓN
=============================================================================

1. FRONTEND:
   - Framework: React 19 + TypeScript (Tipado estricto para evitar errores en tiempo de ejecución).
   - Estilos: Tailwind CSS (Mobile-first, paleta ecológica, sin overhead de CSS en tiempo de ejecución).
   - Iconografía: Lucide Icons (Íconos nítidos de hojas, reciclaje, cámara, mapa, advertencia).
   - Librería GIS: Leaflet / OpenStreetMap (Ligero, 100% libre de costo por API keys para uso público municipal).

2. BACKEND & APIS:
   - Runtime: Node.js con Express / NestJS o Cloud Functions / Edge Workers.
   - Autenticación: JWT para inspectores municipales; acceso anónimo/código único para vecinos.
   - Procesamiento Multimedia: Sharp / FFmpeg para compresión automática de fotos de basurales y optimización en conexiones móviles lentas (3G/4G en territorio).

3. BASE DE DATOS Y STORAGE:
   - Motor Relacional y Geoespacial: PostgreSQL con extensión PostGIS (permite consultas como "buscar todos los basurales a menos de 500 metros de escuelas o cursos de agua").
   - Storage de Evidencias: Cloud Storage / S3 con buckets seguros y URLs presignadas.

4. ACCESIBILIDAD (WCAG 2.1 AA) Y ECO-DISEÑO:
   - Contraste superior a 4.5:1 en textos principales.
   - Formatos ligeros WebP y lazy loading de imágenes para reducir consumo energético del servidor y celulares de los vecinos.
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                Entregables de Ingeniería & Colegio
              </span>
              <h2 className="text-xl font-bold font-heading text-white">
                Ficha Técnica, Arquitectura y Esquema de Datos
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'sitemap'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Layout className="w-4 h-4" /> 1. Sitemap & Wireframes
          </button>

          <button
            onClick={() => setActiveTab('db')}
            className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'db'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Database className="w-4 h-4" /> 2. Esquema de Base de Datos
          </button>

          <button
            onClick={() => setActiveTab('stack')}
            className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'stack'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Server className="w-4 h-4" /> 3. Stack Tecnológico & GIS
          </button>

          <button
            onClick={() => setActiveTab('wcag')}
            className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'wcag'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> 4. Privacidad & WCAG
          </button>
        </div>

        {/* Content Viewer with Copy button */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-900 text-gray-100 font-mono text-xs leading-relaxed relative">
          {activeTab === 'sitemap' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-emerald-400 font-bold uppercase text-[11px]">
                  Arquitectura de Navegación (Sitemap) y Wireframes
                </span>
                <button
                  onClick={() => copyText('sitemap', sitemapContent)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-sans font-bold flex items-center gap-1 shadow transition"
                >
                  {copiedSection === 'sitemap' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'sitemap' ? 'Copiado al portapapeles' : 'Copiar texto'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-emerald-200/90 bg-black/40 p-4 rounded-2xl border border-white/10">
                {sitemapContent}
              </pre>
            </div>
          )}

          {activeTab === 'db' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-emerald-400 font-bold uppercase text-[11px]">
                  Esquema Entidad-Relación y Tablas Relacionales (PostgreSQL/SQL)
                </span>
                <button
                  onClick={() => copyText('db', dbSchemaContent)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-sans font-bold flex items-center gap-1 shadow transition"
                >
                  {copiedSection === 'db' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'db' ? 'Copiado al portapapeles' : 'Copiar texto'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-emerald-200/90 bg-black/40 p-4 rounded-2xl border border-white/10">
                {dbSchemaContent}
              </pre>
            </div>
          )}

          {activeTab === 'stack' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-emerald-400 font-bold uppercase text-[11px]">
                  Stack Tecnológico, GIS y Arquitectura de Sistemas
                </span>
                <button
                  onClick={() => copyText('stack', techStackContent)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-sans font-bold flex items-center gap-1 shadow transition"
                >
                  {copiedSection === 'stack' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'stack' ? 'Copiado al portapapeles' : 'Copiar texto'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-[11px] text-emerald-200/90 bg-black/40 p-4 rounded-2xl border border-white/10">
                {techStackContent}
              </pre>
            </div>
          )}

          {activeTab === 'wcag' && (
            <div className="space-y-4 font-sans text-gray-200 text-xs">
              <h3 className="text-base font-bold text-white font-heading">
                Criterios de Accesibilidad (WCAG 2.1 AA) y Privacidad de Datos
              </h3>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="font-bold text-emerald-300">1. Principio de Perceptibilidad</h4>
                <p className="text-gray-300 leading-relaxed">
                  Todos los botones y estados utilizan contraste cromático superior a 4.5:1. Los marcadores del mapa no se diferencian únicamente por color, sino también por etiquetas semánticas y texto para personas con daltonismo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="font-bold text-emerald-300">2. Principio de Operabilidad</h4>
                <p className="text-gray-300 leading-relaxed">
                  Navegación completa por teclado en formularios y mapa. Campos con autocompletado y botones táctiles con área mínima de 44x44px conforme a guías de diseño móvil.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="font-bold text-emerald-300">3. Privacidad y Seguridad por Diseño (GDPR / LPDP)</h4>
                <p className="text-gray-300 leading-relaxed">
                  El mapa público disocia los datos personales del denunciante. La opción de <strong>Denuncia Anónima</strong> permite la participación de vecinos temerosos de represalias por basurales clandestinos o quemas intencionales.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs">
          <span className="text-gray-500">
            Listo para copiar y pegar en informes o carpetas de investigación escolar.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold transition"
          >
            Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
