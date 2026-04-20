import { toHash } from '../routing';
import { theme } from '../theme/theme';
import { type PharmacyMedicineAvailability } from '../types/domain';
import { useVeloraData } from '../lib/useVeloraData';
import { medicineMatchesQuery, normalizeText } from '../core/searchEngine';

export function PharmacyDetailPage({ pharmacyId, medicineQuery }: { pharmacyId: string; medicineQuery: string }) {
  const dataState = useVeloraData();
  const pharmacy = dataState.status === 'ready' ? dataState.data.pharmacies.find((p) => p.id === pharmacyId) : undefined;

  if (dataState.status === 'loading' || dataState.status === 'idle') {
    return (
      <div className="page">
        <h2 style={{ margin: 0 }}>Loading…</h2>
        <div className="muted">Fetching pharmacy data</div>
      </div>
    );
  }

  if (dataState.status === 'error') {
    return (
      <div className="page">
        <h2 style={{ margin: 0 }}>Failed to load data</h2>
        <div className="muted">{dataState.error}</div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="page">
        <h2>Pharmacy not found</h2>
      </div>
    );
  }

  const q = normalizeText(medicineQuery);
  const availability = pharmacy.availability.find((a: PharmacyMedicineAvailability) => medicineMatchesQuery(a.medicine, q));

  const extra = availability as (PharmacyMedicineAvailability & {
    price?: number;
    stock?: number;
    requiresPrescription?: boolean;
  }) | undefined;

  const statusLabel = availability
    ? availability.status === 'IN_STOCK'
      ? 'In Stock'
      : availability.status === 'LOW_STOCK'
        ? 'Low Stock'
        : 'Out of Stock'
    : 'Unknown';

  const statusColor = availability
    ? availability.status === 'IN_STOCK'
      ? theme.colors.success
      : availability.status === 'LOW_STOCK'
        ? theme.colors.warning
        : theme.colors.error
    : theme.colors.textSecondary;

  return (
    <div className="page">
      <div className="card">
        <div className="cardTitle">{pharmacy.name}</div>
        <div className="muted">{pharmacy.address}</div>
        <div className="muted">
          {pharmacy.distanceKm.toFixed(1)} km • ETA {pharmacy.etaMin} min
        </div>

        <div className="statusLine" style={{ color: statusColor }}>
          {statusLabel}
        </div>

        <div className="pillRow" style={{ marginTop: 10 }}>
          <span className={pharmacy.verifiedPharmacy ? 'pill pill--ok' : 'pill pill--muted'}>
            {pharmacy.verifiedPharmacy ? 'Verified pharmacy' : 'Not verified'}
          </span>
          <span className={pharmacy.openNow ? 'pill pill--ok' : 'pill pill--bad'}>
            {pharmacy.openNow ? 'Open now' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="card">
        <div className="sectionTitle">Availability details</div>
        <div className="detailGrid">
          <div>Medicine</div>
        <div><b>{availability?.medicine ?? medicineQuery}</b></div>
          <div>Status</div>
          <div><b>{statusLabel}</b></div>
        <div>Price</div>
        <div><b>{extra?.price ? `₹${Math.round(extra.price)}` : '—'}</b></div>
        <div>Stock</div>
        <div>{typeof extra?.stock === 'number' ? <b>{extra.stock}</b> : '—'}</div>
        <div>Medicine ID</div>
        <div className="muted">{(extra as any)?.medicineId ?? '—'}</div>
        <div>Batch No</div>
        <div className="muted">{(extra as any)?.batchNo ?? '—'}</div>
        <div>Last Restocked</div>
        <div className="muted">{(extra as any)?.lastRestocked ?? '—'}</div>
        <div>Reorder Level</div>
        <div className="muted">{typeof (extra as any)?.reorderLevel === 'number' ? (extra as any).reorderLevel : '—'}</div>
        <div>Prescription</div>
        <div>
          {extra?.requiresPrescription ? (
            <span className="pill pill--bad">Required</span>
          ) : (
            <span className="pill pill--ok">Not required</span>
          )}
        </div>
        </div>

        <div className="btnRow">
          <a className="btn btn--muted" href={pharmacy.phone ? `tel:${pharmacy.phone}` : undefined}>Call</a>
          <a className="btn btn--primary" href="https://maps.google.com/?q=pharmacy" target="_blank" rel="noreferrer">Navigate</a>
        </div>

        <button className="btn btn--muted" onClick={() => (window.location.hash = toHash({ id: 'emergency', query: medicineQuery }))}>
          Emergency Mode
        </button>
      </div>
    </div>
  );
}
