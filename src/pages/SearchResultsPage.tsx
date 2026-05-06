import { useEffect, useMemo, useState } from 'react';

import { PharmacyCard } from '../components/PharmacyCard';
import { searchPharmacies } from '../lib/search';
import { getAutocompleteSuggestions, maybeCorrectSpellingFromList } from '../lib/suggest';
import { storage } from '../lib/storage';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import { useVeloraData } from '../lib/useVeloraData';
import { toHash } from '../routing';
import { Search, ArrowLeft, Pill, Clock, MapPin, Zap } from 'lucide-react';
import { medicineMatchesQuery } from '../core/searchEngine';

export function SearchResultsPage({ initialQuery }: { initialQuery?: string }) {
  const dataState = useVeloraData();
  const [query, setQuery] = useState(initialQuery ?? '');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [openNow, setOpenNow] = useState(true);
  const [saved, setSaved] = useState(() => storage.getJSON<string[]>('savedPharmacies', []));
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);

  const corrected = useMemo(
    () => (dataState.status === 'ready' ? maybeCorrectSpellingFromList(debouncedQuery, dataState.data.medicines) : undefined),
    [dataState, debouncedQuery]
  );
  const finalQuery = corrected ?? debouncedQuery;
  const suggestions = useMemo(() => {
    if (dataState.status !== 'ready') return [];
    const q = query.trim();
    if (!suggestionsOpen) return [];
    if (q.length < 2) return [];
    const list = getAutocompleteSuggestions(q, { medicines: dataState.data.medicines });
    if (list.some((s) => s.toLowerCase() === q.toLowerCase())) return [];
    return list;
  }, [dataState, query, suggestionsOpen]);

  const results = useMemo(
    () => {
      const q = finalQuery.trim();
      if (!q) return [];
      return dataState.status === 'ready' ? searchPharmacies(dataState.data.pharmacies, q, { openNow }) : [];
    },
    [dataState, finalQuery, openNow]
  );
  const recent = storage.getJSON<string[]>('recentSearches', []);

  const addRecent = (q: string) => {
    const next = [q, ...recent.filter((x) => x !== q)].slice(0, 8);
    storage.setJSON('recentSearches', next);
  };

  const priceRange = useMemo(() => {
    if (!results.length) return null;
    const prices: number[] = [];
    results.forEach((p) => {
      p.availability.forEach((a) => {
        if (medicineMatchesQuery(a.medicine, finalQuery)) {
          if (typeof a.price === 'number' && a.price > 0) {
            prices.push(a.price);
          }
        }
      });
    });
    if (prices.length === 0) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [results, finalQuery]);

  const isPrescriptionRequired = useMemo(() => {
    if (!results.length) return false;
    for (const p of results) {
      for (const a of p.availability) {
        if (medicineMatchesQuery(a.medicine, finalQuery)) {
          if (a.requiresPrescription) return true;
        }
      }
    }
    return false;
  }, [results, finalQuery]);

  useEffect(() => {
    const q = finalQuery.trim();
    if (!q) return;
    if (q.length < 2) return;
    addRecent(q);
    try {
      localStorage.setItem('lastQuery', q);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalQuery]);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      storage.setJSON('savedPharmacies', next);
      return next;
    });
  };

  return (
    <div className="page">
      <header className="topBar" style={{ margin: '-24px -20px 0 -20px', padding: '24px 20px 16px 20px' }}>
        <div className="topBar__brand" onClick={() => window.location.hash = toHash({ id: 'home' })}>
          <ArrowLeft size={24} />
          <span className="brandName" style={{ fontSize: '20px' }}>Search</span>
        </div>
      </header>

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
          placeholder="Search medicines or categories..."
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            const q = query.trim();
            if (!q) return;
            window.location.hash = toHash({ id: 'search', query: q });
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

      <div className="chipRow hide-scrollbar" style={{ paddingBottom: '12px' }}>
        <button className={`clay-btn ${openNow ? 'primary' : ''}`} onClick={() => setOpenNow(!openNow)}>
          {openNow ? <><Clock size={16} style={{ marginRight: '4px' }} /> Open Now</> : 'Open Now'}
        </button>
        <button className="clay-btn"><MapPin size={16} style={{ marginRight: '4px' }} /> Nearest</button>
        <button className="clay-btn" style={{ color: 'var(--error)' }} onClick={() => (window.location.hash = toHash({ id: 'emergency', query: finalQuery.trim() }))}>
          <Zap size={16} style={{ marginRight: '4px' }} /> Emergency
        </button>
      </div>

      {corrected && corrected !== query ? (
        <div className="clay-card" style={{ padding: '12px', background: 'var(--yellow-bg)', color: 'var(--yellow-dark)', fontWeight: 600 }}>
          Showing results for <b>{corrected}</b>
        </div>
      ) : null}

      {!finalQuery && recent.length > 0 && (
        <>
          <div className="sectionHeader" style={{ marginTop: '8px' }}>
            <h2 className="sectionTitle">Recent Searches</h2>
          </div>
          <div className="chipRow hide-scrollbar">
            {recent.map((s) => (
              <button key={s} className="clay-btn" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => setQuery(s)}>
                <Clock size={14} style={{ marginRight: '4px' }} /> {s}
              </button>
            ))}
          </div>
        </>
      )}

      {finalQuery && (
        <>
          {/* Medicine Info Summary Card */}
          <div className="clay-card" style={{ background: '#dbeafe', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div><Pill size={40} color="var(--primary)" /></div>
            <div>
              <h3 style={{ color: 'var(--primary)', margin: 0, fontSize: '20px' }}>{finalQuery}</h3>
              <p style={{ color: 'var(--primary)', fontWeight: 600, margin: '4px 0 0 0', opacity: 0.8, fontSize: '14px' }}>
                Est. Price: <span style={{ color: 'var(--text-h)' }}>
                  {priceRange ? (priceRange.min === priceRange.max ? `₹${priceRange.min}` : `₹${priceRange.min} - ₹${priceRange.max}`) : 'Unavailable'}
                </span>
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span className="subsidyBadge" style={{ background: 'var(--success)', color: 'white' }}>High Availability</span>
                {isPrescriptionRequired ? (
                  <span className="subsidyBadge" style={{ background: '#fef3c7', color: '#d97706' }}>Prescription needed</span>
                ) : (
                  <span className="subsidyBadge" style={{ background: '#dcfce7', color: '#166534' }}>No Prescription needed</span>
                )}
              </div>
            </div>
          </div>

          <div className="sectionHeader" style={{ marginTop: '16px' }}>
            <h2 className="sectionTitle">Available at Pharmacies</h2>
            <div className="muted" style={{ fontWeight: 800 }}>
              {dataState.status === 'ready' ? results.length : '—'} found
            </div>
          </div>

          <div className="list">
            {dataState.status === 'loading' && <div className="clay-card">Loading results…</div>}
            {dataState.status === 'error' && <div className="clay-card">Error: {dataState.error}</div>}
            {dataState.status === 'ready' && results.length === 0 && (
              <div className="clay-card" style={{ textAlign: 'center', padding: '32px' }}>
                <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><Search size={32} /></div>
                <div style={{ fontWeight: 800 }}>No pharmacies found</div>
                <div style={{ color: 'var(--muted)', marginTop: '4px' }}>Try a different search term or check spelling.</div>
              </div>
            )}
            {dataState.status === 'ready' && results.map((p) => (
              <PharmacyCard
                key={p.id}
                pharmacy={p}
                medicineQuery={finalQuery}
                saved={saved.includes(p.id)}
                onSave={() => toggleSave(p.id)}
                onClick={() => (window.location.hash = toHash({ id: 'pharmacy', pharmacyId: p.id, query: finalQuery }))}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
