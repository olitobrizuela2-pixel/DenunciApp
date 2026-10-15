import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string, fileName: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está soportada o está deshabilitada en este navegador.');
      }

      // Stop previous tracks if any
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access warning:', err);
      setError(
        'No se pudo acceder a la cámara en vivo (puede estar bloqueada o sin permisos). Podés subir una fotografía desde tus archivos.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      const fileName = `captura_camara_${Date.now()}.jpg`;
      onCapture(capturedImage, fileName);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-900 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base font-heading">Tomar Fotografía de Evidencia</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-emerald-800 text-emerald-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Preview */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="p-6 text-center text-white max-w-xs space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <p className="text-sm text-gray-300">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow"
              >
                Cargar desde mis archivos
              </button>
            </div>
          ) : capturedImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captura"
                className="max-h-[360px] w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow">
                <Check className="w-3.5 h-3.5" /> Foto capturada
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center min-h-[320px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[360px]"
              />
              {/* Camera Framing Guides */}
              <div className="absolute inset-8 border-2 border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] text-white/70 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
                  Enfocá el basural o acumulación
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-gray-50 flex items-center justify-between gap-3 border-t border-gray-100">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Tomar de nuevo
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Usar esta foto
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleFacingMode}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                title="Cambiar de cámara"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleCapture}
                disabled={!!error}
                className="flex-1 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-base shadow-lg transition flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" /> Capturar Foto
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-gray-500 hover:bg-gray-200 text-xs font-semibold transition"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
