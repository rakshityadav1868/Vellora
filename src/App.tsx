import { useEffect, useMemo, useState } from 'react';
import './App.css';

import { BottomNav } from './components/BottomNav';
import type { RouteId } from './routing';
import { parseHashRoute, toHash } from './routing';

import { EmergencyPage } from './pages/EmergencyPage';
import { HomePage } from './pages/HomePage';
import { PharmacyDetailPage } from './pages/PharmacyDetailPage';
import { SavedPage } from './pages/SavedPage';
import { SearchResultsPage } from './pages/SearchResultsPage';

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

  return (
  <div className="appShell">
      <header className="topBar">
        <div className="topBar__brand" onClick={() => (window.location.hash = toHash({ id: 'home' }))}>
          <span className="brandDot" />
          <span className="brandName">Velora</span>
          <span className="brandTag">Find medicines instantly</span>
        </div>
        <button
          className="emergencyPill"
          onClick={() => (window.location.hash = toHash({ id: 'emergency' }))}
        >
          Emergency
        </button>
      </header>

      <main className="main">
        {route.id === 'home' ? <HomePage /> : null}
        {route.id === 'search' ? <SearchResultsPage initialQuery={route.query} /> : null}
        {route.id === 'pharmacy' ? (
          <PharmacyDetailPage pharmacyId={route.pharmacyId} medicineQuery={route.query} />
        ) : null}
        {route.id === 'emergency' ? <EmergencyPage medicineQuery={route.query} /> : null}
        {route.id === 'saved' ? <SavedPage /> : null}
      </main>

      <BottomNav active={activeTab} />

    </div>
  );
}
