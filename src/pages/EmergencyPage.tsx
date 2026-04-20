import { useMemo } from 'react';

import { pickEmergencyResult } from '../core/emergencyEngine';
import { useVeloraData } from '../lib/useVeloraData';
import { toHash } from '../routing';

export function EmergencyPage({ medicineQuery }: { medicineQuery?: string }) {
	const dataState = useVeloraData();
  const inferred = (() => {
    try {
      return localStorage.getItem('lastQuery') ?? '';
    } catch {
      return '';
    }
  })();
  const q = ((medicineQuery ?? '') || inferred).trim();
	const best = useMemo(
    () =>
      dataState.status === 'ready' && q
        ? pickEmergencyResult(dataState.data.pharmacies, q)
        : undefined,
		[dataState, q]
	);

  if (dataState.status === 'loading' || dataState.status === 'idle') {
    return (
      <div className="page">
        <h2 style={{ margin: 0 }}>Emergency Mode</h2>
        <div className="muted">Loading…</div>
      </div>
    );
  }

  if (dataState.status === 'error') {
    return (
      <div className="page">
        <h2 style={{ margin: 0 }}>Emergency Mode</h2>
        <div className="muted">{dataState.error}</div>
        <button className="btn btn--muted" onClick={() => (window.location.hash = toHash({ id: 'home' }))}>
          Back
        </button>
      </div>
    );
  }

  if (!best) {
    return (
      <div className="page">
        <h2 style={{ margin: 0 }}>Emergency Mode</h2>
        {!q ? (
          <div className="muted">Enter a medicine name first, then open Emergency Mode.</div>
        ) : (
          <div className="muted">No pharmacies found for “{q}”.</div>
        )}
        <button className="btn btn--muted" onClick={() => (window.location.hash = toHash({ id: 'home' }))}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 style={{ margin: 0 }}>Go now</h2>
      <div className="muted">Best match for “{q}”</div>

      <div className="card">
        <div className="cardTitle">{best.pharmacy.name}</div>
        <div className="muted">
          {best.pharmacy.distanceKm.toFixed(1)} km • ETA <b>{best.pharmacy.etaMin} min</b>
        </div>

        <a className="bigCta" href="https://maps.google.com/?q=pharmacy" target="_blank" rel="noreferrer">
          <div className="bigCta__title">Navigate now</div>
          <div className="bigCta__sub">Opens Google Maps</div>
        </a>

        <div className="btnRow">
          <button
          className="btn btn--muted"
        onClick={() => (window.location.hash = toHash({ id: 'pharmacy', pharmacyId: best.pharmacy.id, query: q }))}
      >
            Details
          </button>
          <a className="btn btn--muted" href={best.pharmacy.phone ? `tel:${best.pharmacy.phone}` : undefined}>
            Call
          </a>
        </div>
      </div>
    </div>
  );
}
