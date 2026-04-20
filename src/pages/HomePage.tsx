import { useMemo, useState } from 'react';

import { Chip } from '../components/Chip';
import { PharmacyCard } from '../components/PharmacyCard';
import { searchPharmacies } from '../lib/search';
import { storage } from '../lib/storage';
import { getAutocompleteSuggestions } from '../lib/suggest';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import { useVeloraData } from '../lib/useVeloraData';
import { toHash } from '../routing';

export function HomePage() {
  const dataState = useVeloraData();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [openNow, setOpenNow] = useState(true);
  const [is247, setIs247] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [saved, setSaved] = useState(() => storage.getJSON<string[]>('savedPharmacies', []));
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const suggestions = useMemo(() => {
    if (dataState.status !== 'ready') return [];
    const q = query.trim();
    if (!suggestionsOpen) return [];
    if (q.length < 2) return [];
    const list = getAutocompleteSuggestions(q, { medicines: dataState.data.medicines });
    if (list.some((s) => s.toLowerCase() === q.toLowerCase())) return [];
    return list;
  }, [dataState, query]);

  const results = useMemo(() => {
    if (dataState.status !== 'ready') return [];
  if (!debouncedQuery.trim()) return [];
    const found = searchPharmacies(dataState.data.pharmacies, debouncedQuery, { openNow, is247 });
    if (!sortByDistance) return found;
    return [...found].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [dataState, debouncedQuery, openNow, is247, sortByDistance]);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      storage.setJSON('savedPharmacies', next);
      return next;
    });
  };

  return (
    <div className="page">
      <div className="stickySearch">
        <input
          className="input"
          value={query}
          onChange={(e) => {
        setQuery(e.target.value);
        setSuggestionsOpen(true);
      }}
          placeholder="Search medicine (e.g., Paracetamol)"
        onKeyDown={(e) => {
          if (e.key === 'Enter') window.location.hash = toHash({ id: 'search', query: query.trim() });
        }}
        />
      <button
        className="btn btn--primary"
    onClick={() => {
      const q = query.trim();
      try {
        if (q) localStorage.setItem('lastQuery', q);
      } catch {
        // ignore
      }
      window.location.hash = toHash({ id: 'search', query: q });
    }}
      >
          Search
        </button>
      </div>

    {suggestions.length ? (
      <div className="suggestBox" role="listbox" aria-label="Recommended medicines">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="suggestItem"
            onClick={() => {
              setSuggestionsOpen(false);
              setQuery(s);
              try {
                localStorage.setItem('lastQuery', s);
              } catch {
                // ignore
              }
              window.location.hash = toHash({ id: 'search', query: s });
            }}
          >
            {s}
          </button>
        ))}
      </div>
    ) : null}

      <div className="chipRow">
        <Chip label="Open Now" selected={openNow} onClick={() => setOpenNow((v) => !v)} />
        <Chip label="24/7" selected={is247} onClick={() => setIs247((v) => !v)} />
  <Chip label="Distance" selected={sortByDistance} onClick={() => setSortByDistance((v) => !v)} />
      </div>

      <button
        className="emergencyCta"
    onClick={() => {
      const q = query.trim();
      try {
        if (q) localStorage.setItem('lastQuery', q);
      } catch {
        // ignore
      }
      window.location.hash = toHash({ id: 'emergency', query: q });
    }}
      >
        <div className="emergencyCta__title">Emergency Mode</div>
        <div className="emergencyCta__sub">2 taps to navigation • No distractions</div>
      </button>

      <div className="sectionHeader">
        <div className="sectionTitle">Nearby pharmacies</div>
        <div className="muted" style={{ fontWeight: 900 }}>
          {dataState.status === 'ready' ? results.length : '—'}
        </div>
      </div>

      <div className="list">
        {dataState.status === 'loading' ? (
          <div className="card">
            <div className="muted">Loading pharmacies…</div>
          </div>
        ) : null}
        {dataState.status === 'error' ? (
          <div className="card">
            <div style={{ fontWeight: 900 }}>Failed to load data</div>
            <div className="muted">{dataState.error}</div>
          </div>
        ) : null}
        {dataState.status === 'ready'
          ? results.map((p) => (
              <PharmacyCard
                key={p.id}
                pharmacy={p}
                medicineQuery={debouncedQuery}
                saved={saved.includes(p.id)}
                onSave={() => toggleSave(p.id)}
                onClick={() => (window.location.hash = toHash({ id: 'pharmacy', pharmacyId: p.id, query: debouncedQuery }))}
              />
              ))
          : null}
      </div>
    </div>
  );
}
