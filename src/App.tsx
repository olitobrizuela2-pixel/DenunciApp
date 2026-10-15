import React, { useState, useEffect } from 'react';
import { Denuncia } from './types';
import { storageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { ReportForm } from './components/ReportForm/ReportForm';
import { ReportSuccess } from './components/ReportSuccess';
import { MyReportsView } from './components/MyReportsView';
import { PublicMapView } from './components/PublicMapView';
import { AdminDashboard } from './components/AdminPanel/AdminDashboard';
import { AdminStats } from './components/AdminPanel/AdminStats';
import { TechnicalDocsModal } from './components/TechnicalDocsModal';

type AppView = 'home' | 'report' | 'success' | 'my-reports' | 'map' | 'admin' | 'stats';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [reports, setReports] = useState<Denuncia[]>([]);
  const [myReports, setMyReports] = useState<Denuncia[]>([]);
  const [lastSubmittedReport, setLastSubmittedReport] = useState<Denuncia | null>(null);
  const [trackingInitialCode, setTrackingInitialCode] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Load and refresh state from local storage
  const refreshData = () => {
    const all = storageService.getAllReports();
    const mine = storageService.getMyReports();
    setReports(all);
    setMyReports(mine);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStartReport = () => {
    setCurrentView('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitSuccess = (newReport: Denuncia) => {
    const created = storageService.createReport(newReport);
    refreshData();
    setLastSubmittedReport(created);
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToTracking = (code: string) => {
    setTrackingInitialCode(code);
    setCurrentView('my-reports');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToMap = () => {
    setCurrentView('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAdmin = () => {
    if (!isAdmin) {
      setIsAdmin(true);
      setCurrentView('admin');
    } else {
      setIsAdmin(false);
      setCurrentView('home');
    }
  };

  const handleNavigate = (view: 'home' | 'report' | 'my-reports' | 'map' | 'admin' | 'stats') => {
    if (view === 'admin') {
      setIsAdmin(true);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-[#1E2E23]">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView === 'success' ? 'report' : currentView}
        onNavigate={handleNavigate}
        onOpenDocs={() => setIsDocsOpen(true)}
        myReportsCount={myReports.length}
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
      />

      {/* Main Content Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'home' && (
          <HomeView
            reports={reports}
            onStartReport={handleStartReport}
            onGoToMyReports={() => handleNavigate('my-reports')}
            onGoToMap={handleGoToMap}
            onOpenDocs={() => setIsDocsOpen(true)}
          />
        )}

        {currentView === 'report' && (
          <ReportForm
            onSubmitSuccess={handleSubmitSuccess}
            onCancel={handleGoHome}
          />
        )}

        {currentView === 'success' && lastSubmittedReport && (
          <ReportSuccess
            report={lastSubmittedReport}
            onGoToTracking={handleGoToTracking}
            onGoToMap={handleGoToMap}
            onNewReport={handleStartReport}
            onGoHome={handleGoHome}
          />
        )}

        {currentView === 'my-reports' && (
          <MyReportsView
            myReports={myReports}
            allReports={reports}
            initialSearchCode={trackingInitialCode}
            onNewReport={handleStartReport}
            onViewOnMap={(r) => {
              setCurrentView('map');
            }}
          />
        )}

        {currentView === 'map' && (
          <PublicMapView
            reports={reports}
            onSelectReportToTrack={(code) => handleGoToTracking(code)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            reports={reports}
            onRefreshReports={refreshData}
            onExitAdmin={() => {
              setIsAdmin(false);
              setCurrentView('home');
            }}
          />
        )}

        {currentView === 'stats' && (
          <div className="py-6 space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-950">
                Estadísticas Ambientales y Saneamiento
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Monitoreo abierto de la erradicación de basurales a cielo abierto en el municipio.
              </p>
            </div>
            <AdminStats reports={reports} />
          </div>
        )}
      </main>

      {/* Bottom Footer */}
      <Footer onNavigate={handleNavigate} onOpenDocs={() => setIsDocsOpen(true)} />

      {/* Architecture & Technical Docs Modal */}
      <TechnicalDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
