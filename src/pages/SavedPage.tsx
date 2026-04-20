import { useMemo, useState } from 'react';

import { PharmacyCard } from '../components/PharmacyCard';
import { storage } from '../lib/storage';
import { useVeloraData } from '../lib/useVeloraData';
import { toHash } from '../routing';

export function SavedPage() {
  const dataState = useVeloraData();
  const [saved, setSaved] = useState(() => storage.getJSON<string[]>('savedPharmacies', []));
  const items = useMemo(
    () => (dataState.status === 'ready' ? dataState.data.pharmacies.filter((p) => saved.includes(p.id)) : []),
    [dataState, saved]
  );

  return (
    <div className="page">
      <div className="sectionHeader">
        <div className="sectionTitle">Saved pharmacies</div>
        <div className="muted" style={{ fontWeight: 900 }}>
          {items.length}
        </div>
      </div>

      {dataState.status === 'loading' || dataState.status === 'idle' ? (
        <div className="card">
          <div className="muted">Loading…</div>
        </div>
      ) : null}
      {dataState.status === 'error' ? (
        <div className="card">
          <div style={{ fontWeight: 800 }}>Failed to load data</div>
          <div className="muted">{dataState.error}</div>
        </div>
      ) : null}

      {items.length === 0 ? (
  <div className="notice">No saved pharmacies yet.</div>
      ) : (
        <div className="list">
          {items.map((p) => (
            <PharmacyCard
              key={p.id}
              pharmacy={p}
              medicineQuery={'Paracetamol'}
              saved
              onSave={() => {
                setSaved((prev) => {
                  const next = prev.filter((id) => id !== p.id);
                  storage.setJSON('savedPharmacies', next);
                  return next;
                });
              }}
              onClick={() => (window.location.hash = toHash({ id: 'pharmacy', pharmacyId: p.id, query: 'Paracetamol' }))}
            />
          ))}
        </div>
      )}

      <div className="muted">Tip: Saving is stored locally (localStorage) for now.</div>
    </div>
  );
}
