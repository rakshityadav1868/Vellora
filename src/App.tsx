import { useEffect, useMemo, useState } from 'react';
import './App.css';

import { BottomNav } from './components/BottomNav';
import type { RouteId } from './routing';
import { parseHashRoute } from './routing';

import { EmergencyPage } from './pages/EmergencyPage';
import { HomePage } from './pages/HomePage';
import { PharmacyDetailPage } from './pages/PharmacyDetailPage';
import { SavedPage } from './pages/SavedPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { PrescriptionPage } from './pages/PrescriptionPage';
import { TrackingPage } from './pages/TrackingPage';

export default function App() {
  const [route, setRoute] = useState(() => parseHashRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHashRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const activeTab: RouteId = useMemo(() => {
    if (
      route.id === 'home' ||
      route.id === 'search' ||
      route.id === 'saved'
    ) {
      return route.id;
    }
    return 'home';
  }, [route.id]);

  const hideBottomNav = route.id === 'prescription' || route.id === 'tracking' || route.id === 'pharmacy';

  return (
    <div className="appShell">
      <main className="main">
        {route.id === 'home' ? <HomePage /> : null}
        {route.id === 'search' ? <SearchResultsPage initialQuery={route.query} /> : null}
        {route.id === 'pharmacy' ? (
          <PharmacyDetailPage pharmacyId={route.pharmacyId} medicineQuery={route.query} />
        ) : null}
        {route.id === 'emergency' ? <EmergencyPage medicineQuery={route.query} /> : null}
        {route.id === 'saved' ? <SavedPage /> : null}
        {route.id === 'prescription' ? <PrescriptionPage pharmacyId={route.pharmacyId} /> : null}
        {route.id === 'tracking' ? <TrackingPage pharmacyId={route.pharmacyId} /> : null}
      </main>

      {!hideBottomNav && <BottomNav active={activeTab} />}
    </div>
  );
}

