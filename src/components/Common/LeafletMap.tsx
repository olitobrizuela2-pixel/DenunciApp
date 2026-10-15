import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Denuncia, ReportStatus } from '../../types';
import { PROBLEM_TYPE_CONFIG, STATUS_CONFIG } from '../../data/mockData';

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  interactiveMarker?: {
    lat: number;
    lng: number;
    onDragEnd?: (lat: number, lng: number) => void;
  };
  reports?: Denuncia[];
  onSelectReport?: (report: Denuncia) => void;
  height?: string;
  showStatusFilter?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  center = [-29.4131, -66.8558], // La Rioja Capital, Argentina
  zoom = 13,
  interactiveMarker,
  reports = [],
  onSelectReport,
  height = '420px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const singleMarkerRef = useRef<L.Marker | null>(null);

  // Helper to create custom SVG pins
  const createCustomIcon = (status: ReportStatus) => {
    const config = STATUS_CONFIG[status];
    const color = config?.markerColor === 'green' ? '#10B981' : config?.markerColor === 'yellow' ? '#F59E0B' : '#EF4444';
    const borderColor = config?.markerColor === 'green' ? '#047857' : config?.markerColor === 'yellow' ? '#B45309' : '#B91C1C';

    const svgHtml = `
      <div style="position: relative; width: 34px; height: 42px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));">
        <svg viewBox="0 0 34 42" width="34" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 14.5 40.5 15.8 41.6C16.5 42.1 17.5 42.1 18.2 41.6C19.5 40.5 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="${color}" stroke="${borderColor}" stroke-width="2"/>
          <circle cx="17" cy="16" r="7" fill="white"/>
          <circle cx="17" cy="16" r="3.5" fill="${color}"/>
        </svg>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-leaflet-marker',
      iconSize: [34, 42],
      iconAnchor: [17, 42],
      popupAnchor: [0, -40],
    });
  };

  const createInteractiveIcon = () => {
    const svgHtml = `
      <div style="position: relative; width: 38px; height: 46px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 8px rgba(16,185,129,0.5)); transform: scale(1.05);">
        <svg viewBox="0 0 34 42" width="38" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 14.5 40.5 15.8 41.6C16.5 42.1 17.5 42.1 18.2 41.6C19.5 40.5 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="#059669" stroke="#022c22" stroke-width="2.5"/>
          <circle cx="17" cy="16" r="8" fill="white"/>
          <path d="M14 16L16 18L20 14" stroke="#059669" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'interactive-leaflet-marker',
      iconSize: [38, 46],
      iconAnchor: [19, 46],
      popupAnchor: [0, -42],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contribuyentes | Alerta Ambiental',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Interactive Single Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (interactiveMarker) {
      if (!singleMarkerRef.current) {
        const marker = L.marker([interactiveMarker.lat, interactiveMarker.lng], {
          draggable: true,
          icon: createInteractiveIcon(),
        }).addTo(map);

        marker.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          if (interactiveMarker.onDragEnd) {
            interactiveMarker.onDragEnd(lat, lng);
          }
        });

        marker.bindPopup(
          '<div class="text-xs font-semibold p-1">📌 Ubicación seleccionada.<br><span class="text-gray-500 font-normal">Arrastrá este pin para ajustar con exactitud.</span></div>'
        );

        singleMarkerRef.current = marker;
      } else {
        singleMarkerRef.current.setLatLng([interactiveMarker.lat, interactiveMarker.lng]);
      }

      map.panTo([interactiveMarker.lat, interactiveMarker.lng]);
    } else if (singleMarkerRef.current) {
      singleMarkerRef.current.remove();
      singleMarkerRef.current = null;
    }
  }, [interactiveMarker?.lat, interactiveMarker?.lng]);

  // Handle Multi-Report Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (reports && reports.length > 0) {
      const bounds = L.latLngBounds([]);

      reports.forEach((report) => {
        const { lat, lng, barrio, calle, numero } = report.ubicacion;
        if (!lat || !lng) return;

        bounds.extend([lat, lng]);

        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(report.estado),
        });

        const probConfig = PROBLEM_TYPE_CONFIG[report.tipoProblema];
        const statConfig = STATUS_CONFIG[report.estado];
        const fotoPreview = report.evidencias[0]?.url || '';

        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 220px; max-width: 260px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 800; color: #166534; background: #dcfce7; padding: 2px 6px; border-radius: 4px;">${report.id}</span>
              <span style="font-size: 10px; font-weight: 700; color: ${statConfig.color}; text-transform: uppercase;">● ${statConfig.label}</span>
            </div>
            ${
              fotoPreview
                ? `<div style="width: 100%; height: 95px; margin-bottom: 6px; border-radius: 6px; overflow: hidden; background: #e5e7eb;">
                     <img src="${fotoPreview}" style="width: 100%; height: 100%; object-fit: cover;" alt="Evidencia" />
                   </div>`
                : ''
            }
            <h4 style="font-size: 13px; font-weight: 700; color: #111827; margin: 0 0 4px 0;">${probConfig.label}</h4>
            <p style="font-size: 11px; color: #4b5563; margin: 0 0 6px 0;">📍 ${calle} ${numero || ''}, ${barrio}</p>
            <div style="font-size: 10px; color: #6b7280; border-top: 1px solid #f3f4f6; padding-top: 4px;">
              Fecha: ${report.fecha} ${report.hora}
            </div>
            <div style="font-size: 9px; color: #9ca3af; margin-top: 2px; font-style: italic;">
              🛡️ Datos del denunciante protegidos por ley.
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onSelectReport) {
          marker.on('click', () => {
            onSelectReport(report);
          });
        }

        markersLayer.addLayer(marker);
      });

      if (reports.length > 1 && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [reports]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-900/10 shadow-sm bg-emerald-50/20">
      <div ref={mapContainerRef} style={{ height, width: '100%', zIndex: 1 }} />
    </div>
  );
};
