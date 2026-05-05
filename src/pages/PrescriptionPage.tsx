import { useState } from 'react';
import { toHash } from '../routing';
import { ArrowLeft, ClipboardList, Camera, File, X, Check, TriangleAlert } from 'lucide-react';

export function PrescriptionPage({ pharmacyId }: { pharmacyId?: string }) {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="page" style={{ paddingBottom: '140px' }}>
      <header className="topBar" style={{ margin: '-24px -20px 0 -20px', padding: '24px 20px 16px 20px' }}>
        <div className="topBar__brand" onClick={() => window.history.back()}>
          <ArrowLeft size={24} />
          <span className="brandName" style={{ fontSize: '20px' }}>Prescription</span>
        </div>
      </header>

      <div className="clay-card" style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--surface)' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><ClipboardList size={48} /></div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Upload Prescription</h2>
        <p style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '14px', marginBottom: '24px' }}>
          This medicine requires a valid prescription from a registered practitioner.
        </p>

        {!uploaded ? (
          <div 
            style={{ 
              border: '2px dashed var(--primary)', 
              borderRadius: '20px', 
              padding: '40px 20px', 
              background: 'var(--bg)',
              cursor: 'pointer',
              boxShadow: 'var(--clay-inset)'
            }}
            onClick={() => setUploaded(true)}
          >
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><Camera size={32} /></div>
            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '16px' }}>Tap to capture or upload</div>
            <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px', fontWeight: 600 }}>JPG, PNG or PDF (max 5MB)</div>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div 
              style={{ 
                height: '200px', 
                borderRadius: '20px', 
                background: '#e2e8f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: 'var(--clay-inset)'
              }}
            >
              <File size={40} />
            </div>
            <button 
              className="clay-btn" 
              style={{ position: 'absolute', top: '10px', right: '10px', padding: '8px', borderRadius: '50%', background: 'var(--surface)' }}
              onClick={() => setUploaded(false)}
            >
              <X size={16} />
            </button>
            <div style={{ marginTop: '16px', color: 'var(--success)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Check size={18} /> Prescription attached
            </div>
          </div>
        )}
      </div>

      <div className="clay-card" style={{ background: '#fef3c7', border: 'none' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div><TriangleAlert size={24} color="#d97706" /></div>
          <div>
            <div style={{ fontWeight: 800, color: '#d97706', fontSize: '15px' }}>Important Warning</div>
            <p style={{ fontSize: '13px', color: '#b45309', fontWeight: 600, marginTop: '4px' }}>
              Your order will only be processed after our pharmacists verify your prescription. Fake prescriptions may lead to account suspension.
            </p>
          </div>
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: 'var(--bg)', boxShadow: '0 -4px 16px rgba(0,0,0,0.05)', zIndex: 100, borderTop: '1px solid var(--border)' }}>
        <button 
          className="clay-btn primary" 
          style={{ width: '100%', padding: '18px', fontSize: '18px', borderRadius: '16px', opacity: uploaded ? 1 : 0.5 }}
          onClick={() => {
            if (uploaded) {
              window.location.hash = toHash({ id: 'tracking', pharmacyId });
            }
          }}
        >
          Confirm & Checkout
        </button>
      </div>
    </div>
  );
}
