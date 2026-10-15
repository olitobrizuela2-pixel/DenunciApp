import { Denuncia, ReportStatus, ProblemType } from '../types';
import { INITIAL_DENUNCIAS } from '../data/mockData';

const STORAGE_KEY_REPORTS = 'alerta_ambiental_larioja_v1';
const STORAGE_KEY_MY_REPORTS = 'alerta_ambiental_larioja_my_v1';

export const storageService = {
  getAllReports(): Denuncia[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(INITIAL_DENUNCIAS));
        return INITIAL_DENUNCIAS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_DENUNCIAS;
    }
  },

  getMyReportIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MY_REPORTS);
      if (!data) {
        // Seed with one complaint as demo example for the citizen
        const defaultIds = ['AA-2026-8942', 'AA-2026-9104'];
        localStorage.setItem(STORAGE_KEY_MY_REPORTS, JSON.stringify(defaultIds));
        return defaultIds;
      }
      return JSON.parse(data);
    } catch {
      return ['AA-2026-8942'];
    }
  },

  getMyReports(): Denuncia[] {
    const all = this.getAllReports();
    const myIds = this.getMyReportIds();
    return all.filter((r) => myIds.includes(r.id));
  },

  getReportById(id: string): Denuncia | undefined {
    const all = this.getAllReports();
    const cleanId = id.trim().toUpperCase();
    return all.find((r) => r.id.toUpperCase() === cleanId);
  },

  createReport(report: Denuncia): Denuncia {
    const all = this.getAllReports();
    const updated = [report, ...all];
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(updated));

    // Also record in this browser's list of "My Reports"
    const myIds = this.getMyReportIds();
    if (!myIds.includes(report.id)) {
      myIds.unshift(report.id);
      localStorage.setItem(STORAGE_KEY_MY_REPORTS, JSON.stringify(myIds));
    }

    return report;
  },

  updateReportStatus(
    id: string,
    newStatus: ReportStatus,
    observacion: string,
    responsable = 'Mesa de Gestión Ambiental',
    cuadrilla?: string
  ): Denuncia | null {
    const all = this.getAllReports();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const report = { ...all[index] };
    const now = new Date();
    const fechaHora = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;

    const newHistoryItem = {
      id: `h-${Date.now()}`,
      estado: newStatus,
      fecha: fechaHora,
      observacion: observacion || `Estado actualizado a: ${newStatus}`,
      responsable,
    };

    report.estado = newStatus;
    report.historial = [...report.historial, newHistoryItem];

    if (cuadrilla !== undefined) {
      report.cuadrillaAsignada = cuadrilla;
    }

    if (newStatus === 'resuelta' || newStatus === 'cerrada') {
      report.fechaResolucion = fechaHora;
    }

    all[index] = report;
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(all));
    return report;
  },

  addInternalObservation(id: string, note: string): boolean {
    const all = this.getAllReports();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) return false;

    const now = new Date();
    const timestamp = `${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    const line = `${timestamp} - ${note}`;

    const report = all[index];
    report.observacionesInternas = [...(report.observacionesInternas || []), line];

    all[index] = report;
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(all));
    return true;
  },

  resetDefaults(): void {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(INITIAL_DENUNCIAS));
    localStorage.setItem(STORAGE_KEY_MY_REPORTS, JSON.stringify(['AA-2026-8942', 'AA-2026-9104']));
  },

  generateUniqueCode(): string {
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `AA-${year}-${randomDigits}`;
  },

  exportToCSV(reports: Denuncia[]): void {
    const headers = [
      'Código',
      'Fecha',
      'Hora',
      'Tipo de Problema',
      'Estado',
      'Barrio',
      'Calle',
      'Latitud',
      'Longitud',
      'Denunciante Tipo',
      'Prioridad',
      'Cuadrilla Asignada',
    ];

    const rows = reports.map((r) => [
      r.id,
      r.fecha,
      r.hora,
      `"${r.tipoProblema}"`,
      r.estado,
      `"${r.ubicacion.barrio}"`,
      `"${r.ubicacion.calle} ${r.ubicacion.numero || ''}"`,
      r.ubicacion.lat,
      r.ubicacion.lng,
      r.denunciante.esAnonima ? 'Anónima' : 'Identificada',
      r.prioridad,
      `"${r.cuadrillaAsignada || 'Sin asignar'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `alerta_ambiental_denuncias_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
