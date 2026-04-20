import { useEffect, useMemo, useState } from 'react';

import { Chip } from '../components/Chip';
import { PharmacyCard } from '../components/PharmacyCard';
import { searchPharmacies } from '../lib/search';
import { getAutocompleteSuggestions, maybeCorrectSpellingFromList } from '../lib/suggest';
import { storage } from '../lib/storage';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import { useVeloraData } from '../lib/useVeloraData';
import { toHash } from '../routing';

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
  }, [dataState, query]);

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

  // Add to recent searches automatically when user pauses typing.
  // Keeps it lightweight and avoids spamming by only storing non-empty queries.
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
      <div className="stickySearch">
        <input
          className="input"
          value={query}
          onChange={(e) => {
        setQuery(e.target.value);
        setSuggestionsOpen(true);
      }}
          placeholder="Type medicine"
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            const q = query.trim();
            if (!q) return;
            window.location.hash = toHash({ id: 'search', query: q });
          }}
        />
    <button
      type="button"
      className="btn btn--primary"
      onClick={() => {
        const q = query.trim();
        if (!q) return;
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
        <Chip label="Nearest" />
        <Chip
          label="Emergency"
          onClick={() => (window.location.hash = toHash({ id: 'emergency', query: finalQuery.trim() }))}
        />
      </div>

      {corrected && corrected !== query ? (
        <div className="notice">
          Showing results for <b>{corrected}</b>
        </div>
      ) : null}

      <div className="sectionHeader">
        <div className="sectionTitle">Recent</div>
      </div>
      <div className="pillRow">
  {recent.map((s) => (
          <button key={s} className="pill pill--muted" onClick={() => setQuery(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="sectionHeader">
        <div className="sectionTitle">Results</div>
        <div className="muted" style={{ fontWeight: 900 }}>
          {dataState.status === 'ready' ? results.length : '—'}
        </div>
      </div>

      <div className="list">
        {dataState.status === 'loading' ? (
          <div className="card">
            <div className="muted">Loading results…</div>
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
                medicineQuery={finalQuery}
                saved={saved.includes(p.id)}
                onSave={() => toggleSave(p.id)}
                onClick={() => (window.location.hash = toHash({ id: 'pharmacy', pharmacyId: p.id, query: finalQuery }))}
              />
              ))
          : null}
      </div>
    </div>
  );
}
