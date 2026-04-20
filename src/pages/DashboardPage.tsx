import { useEffect, useState } from 'react';

import { storage } from '../lib/storage';
import { useVeloraData } from '../lib/useVeloraData';

type AvailabilityEdits = Record<string, Record<string, 'IN_STOCK' | 'OUT_OF_STOCK'>>;

export function DashboardPage() {
  const dataState = useVeloraData();
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('');
  const [medicine, setMedicine] = useState('Paracetamol');
  const [status, setStatus] = useState<'IN_STOCK' | 'OUT_OF_STOCK'>('IN_STOCK');

  const edits = storage.getJSON<AvailabilityEdits>('dashboardEdits', {});
  const pharmacies = dataState.status === 'ready' ? dataState.data.pharmacies : [];
  const active = pharmacies.find((p) => p.id === selectedPharmacyId) ?? pharmacies[0];

  useEffect(() => {
    if (dataState.status !== 'ready') return;
    if (selectedPharmacyId) return;
    if (pharmacies.length === 0) return;
    setSelectedPharmacyId(pharmacies[0].id);
  }, [dataState, pharmacies, selectedPharmacyId]);

  const apply = () => {
    if (!active) return;
    const next: AvailabilityEdits = {
      ...edits,
      [active.id]: {
        ...(edits[active.id] ?? {}),
        [medicine]: status,
      },
    };
    storage.setJSON('dashboardEdits', next);
    alert('Updated (stored locally). Wire this to API later.');
  };

  return (
    <div className="page">
      <div className="sectionTitle">Dashboard</div>

      {dataState.status === 'loading' || dataState.status === 'idle' ? (
        <div className="muted">Loading…</div>
      ) : null}

      {dataState.status === 'error' ? (
        <>
          <div style={{ fontWeight: 800 }}>Failed to load data</div>
          <div className="muted">{dataState.error}</div>
        </>
      ) : null}

      <div className="dashboardGrid">
        <div>
          <div className="cardTitle" style={{ marginBottom: 2 }}>
            Stock update
          </div>
          <div className="muted" style={{ marginTop: 0 }}>
            {active ? active.name : '—'}
          </div>

          <div className="formGrid">
            <div>
              <label className="label">Pharmacy</label>
              <select
                className="input"
                value={active?.id ?? ''}
                onChange={(e) => setSelectedPharmacyId(e.target.value)}
                disabled={pharmacies.length === 0}
              >
                {pharmacies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Medicine</label>
              <input className="input" value={medicine} onChange={(e) => setMedicine(e.target.value)} />
            </div>
          </div>

          <label className="label">Availability</label>
          <div className="pillRow">
            <button type="button" className={status === 'IN_STOCK' ? 'pill pill--ok' : 'pill pill--muted'} onClick={() => setStatus('IN_STOCK')}>
              In stock
            </button>
            <button type="button" className={status === 'OUT_OF_STOCK' ? 'pill pill--bad' : 'pill pill--muted'} onClick={() => setStatus('OUT_OF_STOCK')}>
              Out of stock
            </button>
          </div>

          <div className="btnRow">
            <button className="btn btn--primary" onClick={apply}>
              Save update
            </button>
            <button
              className="btn btn--muted"
              onClick={() => {
                setMedicine('Paracetamol');
                setStatus('IN_STOCK');
              }}
            >
              Reset
            </button>
          </div>
  </div>
      </div>
    </div>
  );
}
