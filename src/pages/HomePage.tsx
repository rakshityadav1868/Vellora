import { useMemo, useState } from 'react';
import { searchPharmacies } from '../lib/search';
import { getAutocompleteSuggestions } from '../lib/suggest';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import { useVeloraData } from '../lib/useVeloraData';
import { toHash } from '../routing';
import { Activity, Pill, Baby, BicepsFlexed, Thermometer, Stethoscope, Leaf, Bone, Zap, Search, Bell } from 'lucide-react';

export function HomePage() {
  const dataState = useVeloraData();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);

  const suggestions = useMemo(() => {
    if (dataState.status !== 'ready') return [];
    const q = query.trim();
    if (!suggestionsOpen) return [];
    if (q.length < 2) return [];
    const list = getAutocompleteSuggestions(q, { medicines: dataState.data.medicines });
    if (list.some((s) => s.toLowerCase() === q.toLowerCase())) return [];
    return list;
  }, [dataState, query, suggestionsOpen]);

  const results = useMemo(() => {
    if (dataState.status !== 'ready') return [];
    if (!debouncedQuery.trim()) return dataState.data.pharmacies.slice(0, 5); // Default to showing 5 nearby
    return searchPharmacies(dataState.data.pharmacies, debouncedQuery, { openNow: true, is247: false });
  }, [dataState, debouncedQuery]);

  return (
    <div className="page">
      <header className="topBar" style={{ margin: '-24px -20px 0 -20px', padding: '24px 20px 16px 20px' }}>
        <div className="topBar__brand" onClick={() => { setQuery(''); window.location.hash = toHash({ id: 'home' }); }}>
          <Activity size={28} />
          <span className="brandName">Velora</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="clay-btn" style={{ padding: '8px', borderRadius: '50%' }}>
            <Bell size={20} />
          </button>
          <button className="clay-btn" style={{ padding: '8px', borderRadius: '50%', overflow: 'hidden' }}>
            <img src="/clay_delivery_person.png" alt="Profile" style={{ width: '24px', height: '24px', objectFit: 'cover' }} />
          </button>
        </div>
      </header>

      {/* Hero / Highlight Cards */}
      <div className="horizontal-list hide-scrollbar">
        <div className="emergencyCta" onClick={() => window.location.hash = toHash({ id: 'emergency' })} style={{ minWidth: '280px' }}>
          <div className="emergencyCta__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>Emergency Mode <Zap size={24} fill="currentColor" /></div>
          <div className="emergencyCta__sub">Find 24/7 pharmacies instantly</div>
        </div>
        <div className="clay-card" style={{ minWidth: '260px', background: '#fef3c7', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={20} fill="currentColor" />
            Fastest Pickup
          </div>
          <p style={{ marginTop: '8px', color: '#b45309', fontWeight: 600, fontSize: '14px' }}>Ready in 10 mins near you</p>
        </div>
        <div className="clay-card" style={{ minWidth: '260px', background: '#dbeafe', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"/><path d="M12 8v13"/><path d="M19 12v7"/><path d="M5 12v7"/></svg>
            Delivery Available
          </div>
          <p style={{ marginTop: '8px', color: '#1d4ed8', fontWeight: 600, fontSize: '14px' }}>Get medicines to your door</p>
        </div>
      </div>

      <div className="stickySearch">
        <span className="searchIconWrapper">
          <Search size={20} />
        </span>
        <input
          className="clay-input input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSuggestionsOpen(true);
          }}
          placeholder="Search for medicines, health products..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              window.location.hash = toHash({ id: 'search', query: query.trim() });
            }
          }}
        />
      </div>

      {suggestions.length > 0 && (
        <div className="clay-card" style={{ marginTop: '-12px', zIndex: 5, padding: '8px' }}>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              style={{ width: '100%', textAlign: 'left', padding: '12px', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => {
                setSuggestionsOpen(false);
                setQuery(s);
                window.location.hash = toHash({ id: 'search', query: s });
              }}
            >
              <Pill size={16} /> {s}
            </button>
          ))}
        </div>
      )}

      {/* Quick Filters */}
      <div className="chipRow hide-scrollbar">
        <button className="clay-btn"><Pill size={18} style={{ marginRight: '6px' }} /> Pain Relief</button>
        <button className="clay-btn"><Baby size={18} style={{ marginRight: '6px' }} /> Baby Care</button>
        <button className="clay-btn"><BicepsFlexed size={18} style={{ marginRight: '6px' }} /> Vitamins</button>
        <button className="clay-btn"><Thermometer size={18} style={{ marginRight: '6px' }} /> Cold & Flu</button>
      </div>

      {/* Popular Medicines - Horizontal Scroll */}
      <div>
        <div className="sectionHeader" style={{ marginBottom: '16px' }}>
          <h2 className="sectionTitle">Popular Now</h2>
        </div>
        <div className="horizontal-list hide-scrollbar">
          {[
            { name: 'Panadol', type: 'Pain Relief', price: '$5.99', bg: '#fef3c7', icon: <Pill size={24} color="#d97706" /> },
            { name: 'Amoxicillin', type: 'Antibiotic', price: '$12.49', bg: '#dbeafe', icon: <Stethoscope size={24} color="#1e40af" /> },
            { name: 'Cetirizine', type: 'Allergy', price: '$8.50', bg: '#f3e8ff', icon: <Leaf size={24} color="#7e22ce" /> },
            { name: 'Ibuprofen', type: 'Anti-inflammatory', price: '$9.99', bg: '#ffedd5', icon: <Bone size={24} color="#c2410c" /> },
          ].map((prod, i) => (
            <div key={i} className="clay-card" style={{ minWidth: '160px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: prod.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {prod.icon}
              </div>
              <div style={{ fontWeight: 800, fontSize: '16px', marginTop: '8px' }}>{prod.name}</div>
              <div style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>{prod.type}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{prod.price}</div>
                <button className="clay-btn" style={{ padding: '6px 10px', borderRadius: '8px' }}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Pharmacies */}
      <div>
        <div className="sectionHeader" style={{ marginBottom: '16px' }}>
          <h2 className="sectionTitle">Nearby Pharmacies</h2>
          <button className="clay-btn" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => window.location.hash = toHash({ id: 'search', query: '' })}>See All</button>
        </div>
        
        <div className="list">
          {dataState.status === 'loading' && <div className="clay-card">Loading...</div>}
          {dataState.status === 'error' && <div className="clay-card">Error: {dataState.error}</div>}
          {dataState.status === 'ready' && results.map((p) => (
            <div key={p.id} className="clay-card" onClick={() => window.location.hash = toHash({ id: 'pharmacy', pharmacyId: p.id, query: debouncedQuery })}>
              <div className="cardTop">
                <div>
                  <div className="cardTitle">{p.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 600 }}>{p.address} • {p.distanceKm} km away</div>
                </div>
                <div className="statusPill fast" style={{ background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={14} fill="currentColor" /> {p.distanceKm < 2 ? '10 min' : '25 min'}
                </div>
              </div>
              <div className="cardBottom">
                <div style={{ display: 'flex', gap: '8px' }}>
                  {p.is247 && <span className="subsidyBadge" style={{ background: '#dbeafe', color: '#1e40af' }}>24/7 Open</span>}
                  <span className="subsidyBadge">Stock Available</span>
                </div>
                <button className="clay-btn primary" style={{ padding: '8px 16px', fontSize: '14px' }}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

