export type ProblemType =
  | 'basural_cielo_abierto'
  | 'acumulacion_residuos'
  | 'quema_basura'
  | 'residuos_peligrosos'
  | 'contaminacion_agua_suelo'
  | 'otro';

export type ReportStatus =
  | 'recibida'
  | 'en_revision'
  | 'derivada'
  | 'en_proceso'
  | 'resuelta'
  | 'cerrada';

export interface EvidenciaItem {
  id: string;
  tipo: 'imagen' | 'video' | 'documento';
  url: string;
  nombre: string;
  tamano?: string;
  fechaCarga: string;
}

export interface HistorialEstado {
  id: string;
  estado: ReportStatus;
  fecha: string;
  observacion: string;
  responsable?: string;
}

export interface DenuncianteData {
  esAnonima: boolean;
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  email?: string;
}

export interface UbicacionData {
  localidad: string;
  barrio: string;
  calle: string;
  numero?: string;
  referencias: string;
  lat: number;
  lng: number;
}

export interface Denuncia {
  id: string; // e.g. "AA-2026-8942"
  fecha: string; // ISO string
  hora: string; // HH:mm
  tipoProblema: ProblemType;
  descripcion: string;
  ubicacion: UbicacionData;
  evidencias: EvidenciaItem[];
  denunciante: DenuncianteData;
  estado: ReportStatus;
  historial: HistorialEstado[];
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  cuadrillaAsignada?: string;
  fechaResolucion?: string;
  observacionesInternas?: string[];
}

export interface FilterOptions {
  estado?: string;
  tipoProblema?: string;
  barrio?: string;
  busqueda?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface BarrioOption {
  id: string;
  nombre: string;
  localidad: string;
  lat: number;
  lng: number;
}
