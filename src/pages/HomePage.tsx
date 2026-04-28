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
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Azza Mohamed</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, position: 'relative' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#3b82f6', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</span>
          </button>
        </div>
      </header>

      <div className="stickySearch">
        <div style={{ position: 'relative', flex: 1,margin: '-15px 0 -2px 0' }}>
          <input
            className="input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSuggestionsOpen(true);
            }}
            placeholder="Search Medicine..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') window.location.hash = toHash({ id: 'search', query: query.trim() });
            }}
            style={{ width: '100%', paddingLeft: '16px', paddingRight: '48px', height: '48px', borderRadius: '18px', border: '1px solid #ccc', backgroundColor: '#f5f5f5' }}
          />
          <button 
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => {
              const q = query.trim();
              if (q) {
                try { localStorage.setItem('lastQuery', q); } catch {}
                window.location.hash = toHash({ id: 'search', query: q });
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>
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

      <div style={{ backgroundColor: '#d7d0ff', borderRadius: '30px', padding: '16px 20px', margin: '0px 0 -2px 0', height: '150px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left', overflow: 'hidden' }}>
        <div style={{ maxWidth: '60%', marginLeft: '0px', position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: '1.2' }}>
            Upload Prescription
          </h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#444', lineHeight: '1.3', fontWeight: '600' }}>
            Upload a Prescription and Tell Us what you Need. We do the Rest.!
          </p>
        </div>
        <div style={{ position: 'absolute', right: '20px', bottom: '20px', zIndex: 1 }}>
          <button style={{ backgroundColor: '#5c4ee3', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 'bold', width: 'fit-content', cursor: 'pointer', textTransform: 'uppercase' }}>
            Order Now
          </button>
        </div>
        <div style={{ position: 'absolute', right: '20px', top: '0px', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src="/Gemini_Generated_Image_o6j51to6j51to6j5.png" 
            alt="Prescription Capsule" 
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
          />
        </div>
      </div>
      <div style={{ backgroundColor: '#c7f4c1', borderRadius: '30px', padding: '16px 24px', margin: '-2px 0 16px 0', height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '-10px' }}>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#1a1a1a', transform: 'rotate(-90deg)', display: 'inline-block', letterSpacing: '0.1px' ,marginLeft:"-10px",marginTop:"10px"}}>UPTO</span>
            <span style={{ fontSize: '40px', fontWeight: '900', color: '#1a1a1a', lineHeight: 1,marginLeft:"-20px",marginTop:"10px"}}>80%</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a', textTransform: 'uppercase', marginTop: '-8px', marginLeft: '45px' }}>
            OFFER*
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a1a', marginTop: '8px', textAlign: 'left' }}>
            On Health Products
          </div>
        </div>
        <button style={{ backgroundColor: '#52a37d', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 24px', fontSize: '15px', fontWeight: '800', width: 'fit-content', marginTop: '16px', cursor: 'pointer', textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
          SHOP NOW
        </button>
        <div style={{ position: 'absolute', right: '-10px', bottom: '0px', width: '60%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <img 
            src="/Gemini_Generated_Image_z5yktyz5yktyz5yk.png" 
            alt="Health Products" 
            style={{ height: '68%', width: 'auto', objectFit: 'contain' }} 
          />
        </div>
      </div>

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
