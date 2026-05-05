import { useState } from 'react';
import { toHash } from '../routing';
import { type PharmacyMedicineAvailability } from '../types/domain';
import { useVeloraData } from '../lib/useVeloraData';
import { medicineMatchesQuery, normalizeText } from '../core/searchEngine';
import { ArrowLeft, Store, Bike, Phone, MapPin } from 'lucide-react';

export function PharmacyDetailPage({ pharmacyId, medicineQuery }: { pharmacyId: string; medicineQuery: string }) {
  const dataState = useVeloraData();
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup');
  const [subsidyApplied, setSubsidyApplied] = useState(false);

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

  const pharmacy = dataState.status === 'ready' ? dataState.data.pharmacies.find((p: any) => p.id === pharmacyId) : undefined;
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

  const statusLabel = availability?.status === 'IN_STOCK' ? 'In Stock' : availability?.status === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock';
  const price = extra?.price ? extra.price : 12.50; // default for UI display
  const finalPrice = subsidyApplied ? (price * 0.8).toFixed(2) : price.toFixed(2);

  return (
    <div className="page" style={{ paddingBottom: '140px' }}>
      <header className="topBar" style={{ margin: '-24px -20px 0 -20px', padding: '24px 20px 16px 20px' }}>
        <div className="topBar__brand" onClick={() => window.history.back()}>
          <ArrowLeft size={24} />
          <span className="brandName" style={{ fontSize: '20px' }}>Details</span>
        </div>
      </header>

      {/* Pharmacy Info Card */}
      <div className="clay-card">
        <div className="cardTop">
          <div>
            <div className="cardTitle" style={{ fontSize: '22px' }}>{pharmacy.name}</div>
            <div className="muted" style={{ marginTop: '4px' }}>{pharmacy.address}</div>
          </div>
          {pharmacy.verifiedPharmacy && (
            <div style={{ background: 'var(--success)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>✓ Verified</div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <div style={{ flex: 1, background: 'var(--bg)', padding: '12px', borderRadius: '12px', textAlign: 'center', boxShadow: 'var(--clay-inset)' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>{pharmacy.distanceKm.toFixed(1)} km</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Distance</div>
          </div>
          <div style={{ flex: 1, background: '#fef3c7', padding: '12px', borderRadius: '12px', textAlign: 'center', boxShadow: 'var(--clay-inset)' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706' }}>{pharmacy.etaMin} min</div>
            <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>Fastest ETA</div>
          </div>
        </div>
      </div>

      {/* Medicine & Pricing Card */}
      {medicineQuery && (
        <div className="clay-card" style={{ border: '2px solid var(--primary)' }}>
          <div className="sectionTitle" style={{ marginBottom: '12px', fontSize: '18px' }}>Selected Medicine</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>{availability?.medicine ?? medicineQuery}</div>
              <div style={{ color: availability?.status === 'IN_STOCK' ? 'var(--success)' : 'var(--warning)', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></span>
                {statusLabel} {extra?.stock ? `(${extra.stock} left)` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>${finalPrice}</div>
              {subsidyApplied && <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>Gov Subsidy Applied</div>}
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={subsidyApplied} onChange={(e) => setSubsidyApplied(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Apply Government Health Subsidy (-20%)</span>
            </label>
          </div>
        </div>
      )}

      {/* Delivery vs Pickup Selection */}
      <div className="sectionHeader" style={{ marginTop: '8px' }}>
        <h2 className="sectionTitle">How to get it</h2>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div 
          className="clay-card" 
          style={{ flex: 1, cursor: 'pointer', border: deliveryOption === 'pickup' ? '2px solid var(--primary)' : '2px solid transparent', background: deliveryOption === 'pickup' ? 'var(--bg)' : 'var(--surface)' }}
          onClick={() => setDeliveryOption('pickup')}
        >
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><Store size={28} /></div>
          <div style={{ fontWeight: 800, fontSize: '16px' }}>Pickup</div>
          <div style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>Ready in 10m</div>
          <div style={{ color: 'var(--success)', fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>Free</div>
        </div>
        <div 
          className="clay-card" 
          style={{ flex: 1, cursor: 'pointer', border: deliveryOption === 'delivery' ? '2px solid var(--primary)' : '2px solid transparent', background: deliveryOption === 'delivery' ? 'var(--bg)' : 'var(--surface)' }}
          onClick={() => setDeliveryOption('delivery')}
        >
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><Bike size={28} /></div>
          <div style={{ fontWeight: 800, fontSize: '16px' }}>Delivery</div>
          <div style={{ color: 'var(--muted)', fontSize: '13px', fontWeight: 600 }}>~ {pharmacy.etaMin + 15}m</div>
          <div style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>+$3.00</div>
        </div>
      </div>

      <div className="btnRow">
        <a className="clay-btn" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} href={pharmacy.phone ? `tel:${pharmacy.phone}` : undefined}><Phone size={18} /> Call</a>
        <a className="clay-btn" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} href="https://maps.google.com/?q=pharmacy" target="_blank" rel="noreferrer"><MapPin size={18} /> Maps</a>
      </div>

      {/* Fixed bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: 'var(--bg)', boxShadow: '0 -4px 16px rgba(0,0,0,0.05)', zIndex: 100, borderTop: '1px solid var(--border)' }}>
        <button 
          className="clay-btn primary" 
          style={{ width: '100%', padding: '18px', fontSize: '18px', borderRadius: '16px' }}
          onClick={() => {
            const orderData = {
              medicineName: availability?.medicine ?? medicineQuery,
              price: price,
              deliveryFee: deliveryOption === 'delivery' ? 3.00 : 0,
              subsidyApplied: subsidyApplied
            };
            localStorage.setItem('currentOrder', JSON.stringify(orderData));

            // If prescription is needed or to be safe, route to prescription upload
            window.location.hash = toHash({ id: 'prescription', pharmacyId: pharmacy.id });
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
