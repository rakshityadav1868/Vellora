import { useMemo, useState, useRef, useEffect } from 'react';
import { searchPharmacies } from '../lib/search';
import { getAutocompleteSuggestions } from '../lib/suggest';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import { useVeloraData } from '../lib/useVeloraData';
import { toHash } from '../routing';
import { Activity, Pill, Stethoscope, Leaf, Bone, Zap, Search, Bell } from 'lucide-react';

export function HomePage() {
  const dataState = useVeloraData();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const [focusedCardId, setFocusedCardId] = useState<string | null>(null);
  const [focusedHeroCard, setFocusedHeroCard] = useState<string | null>('hero-0');
  const cardsRef = useRef<{ [key: string]: HTMLDivElement }>({});
  const heroCardsRef = useRef<{ [key: string]: HTMLDivElement }>({});

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

  // Track focused card on scroll
  useEffect(() => {
    const ratios = new Map<string, number>();
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.2, 0.4, 0.6, 0.8, 1], 
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => ratios.set(entry.target.id, entry.intersectionRatio));
      
      let maxId: string | null = null;
      let maxRatio = 0;
      ratios.forEach((ratio, id) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          maxId = id;
        }
      });
      
      if (maxId && maxRatio > 0.2) {
        setFocusedCardId(maxId);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all pharmacy cards
    Object.values(cardsRef.current).forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, [results]);

  // Track focused hero card on horizontal scroll
  useEffect(() => {
    const ratios = new Map<string, number>();
    const heroObserverOptions = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.2, 0.4, 0.6, 0.8, 1], 
    };

    const heroObserverCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => ratios.set(entry.target.id, entry.intersectionRatio));
      
      let maxId: string | null = null;
      let maxRatio = 0;
      ratios.forEach((ratio, id) => {
        if (ratio > maxRatio) {
          maxRatio = ratio;
          maxId = id;
        }
      });
      
      if (maxId && maxRatio > 0.3) {
        setFocusedHeroCard(maxId);
      }
    };

    const heroObserver = new IntersectionObserver(heroObserverCallback, heroObserverOptions);

    // Observe all hero cards
    Object.values(heroCardsRef.current).forEach((card) => {
      if (card) heroObserver.observe(card);
    });

    return () => {
      heroObserver.disconnect();
    };
  }, []);

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
        <div 
          id="hero-0"
          ref={(el) => {
            if (el) heroCardsRef.current['hero-0'] = el;
          }}
          className={`emergencyCta hero-card-animated ${focusedHeroCard === 'hero-0' ? 'hero-card--focused' : ''}`}
          onClick={() => window.location.hash = toHash({ id: 'emergency' })} 
          style={{ minWidth: '220px', margin: 0 }}
        >
          <div className="emergencyCta__title" style={{ fontFamily: '"Space Grotesk", sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>Emergency Mode <Zap size={24} fill="currentColor" /></div>
          <div className="emergencyCta__sub" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Find 24/7 pharmacies instantly</div>
        </div>
        <div 
          id="hero-1"
          ref={(el) => {
            if (el) heroCardsRef.current['hero-1'] = el;
          }}
          className={`clay-card hero-card-animated ${focusedHeroCard === 'hero-1' ? 'hero-card--focused' : ''}`}
          style={{ minWidth: '220px', margin: 0, padding: '14px', borderRadius: '16px', background: "url('/fast_pickup_watermark.png') no-repeat right 0px bottom -5px/90px, #fef3c7", backgroundBlendMode: 'multiply', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '18px', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={20} fill="currentColor" className="animate-zap" />
            Fastest Pickup
          </div>
          <p style={{ fontFamily: '"Space Grotesk", sans-serif', marginTop: '8px', color: '#b45309', fontWeight: 600, fontSize: '14px', maxWidth: '120px', lineHeight: '1.3' }}>Ready in 10 mins near you</p>
        </div>
        <div 
          id="hero-2"
          ref={(el) => {
            if (el) heroCardsRef.current['hero-2'] = el;
          }}
          className={`clay-card hero-card-animated ${focusedHeroCard === 'hero-2' ? 'hero-card--focused' : ''}`}
          style={{ minWidth: '220px', margin: 0, padding: '14px', borderRadius: '16px', background: "url('/delivery_guy_watermark.png') no-repeat right -5px bottom -5px/95px, #dbeafe", backgroundBlendMode: 'multiply', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '18px', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg className="animate-delivery" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="18" height="12" rx="2" ry="2"/><path d="M12 8v13"/><path d="M19 12v7"/><path d="M5 12v7"/></svg>
            Delivery Available
          </div>
          <p style={{ fontFamily: '"Space Grotesk", sans-serif', marginTop: '8px', color: '#1d4ed8', fontWeight: 600, fontSize: '14px', maxWidth: '120px', lineHeight: '1.3' }}>Get medicines to your door</p>
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



      {/* Popular Medicines - Horizontal Scroll */}
      <div>
        <div className="sectionHeader" style={{ marginBottom: '16px' }}>
          <h2 className="sectionTitle">High on Demand </h2>
        </div>
        <div className="horizontal-list hide-scrollbar">
          {[
            { name: 'Panadol', type: 'Pain Relief', price: '₹50.00', bg: '#fef3c7', icon: <Pill size={24} color="#d97706" /> },
            { name: 'Amoxicillin', type: 'Antibiotic', price: '₹120.00', bg: '#dbeafe', icon: <Stethoscope size={24} color="#1e40af" /> },
            { name: 'Cetirizine', type: 'Allergy', price: '₹85.00', bg: '#f3e8ff', icon: <Leaf size={24} color="#7e22ce" /> },
            { name: 'Ibuprofen', type: 'Anti-inflammatory', price: '₹95.00', bg: '#ffedd5', icon: <Bone size={24} color="#c2410c" /> },
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
            <div 
              key={p.id} 
              id={`pharmacy-${p.id}`}
              ref={(el) => {
                if (el) cardsRef.current[p.id] = el;
              }}
              className={`clay-card ${focusedCardId === `pharmacy-${p.id}` ? 'card--focused' : ''}`}
              onClick={() => window.location.hash = toHash({ id: 'pharmacy', pharmacyId: p.id, query: debouncedQuery })}
            >
              <div className="cardTop">
                <div>
                  <div className="cardTitle">{p.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '14px', fontWeight: 600 }}>{p.address} • {p.distanceKm.toFixed(2)} km away</div>
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

