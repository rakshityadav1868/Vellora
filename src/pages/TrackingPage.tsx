import { useState, useEffect } from 'react';
import { toHash } from '../routing';
import { useVeloraData } from '../lib/useVeloraData';
import { Home, Bike, Phone, Download } from 'lucide-react';

export function TrackingPage({ pharmacyId }: { pharmacyId?: string }) {
  const dataState = useVeloraData();
  const [status, setStatus] = useState<'preparing' | 'picked' | 'arriving'>('preparing');

  useEffect(() => {
    // Simulate tracking status progression
    const t1 = setTimeout(() => setStatus('picked'), 3000);
    const t2 = setTimeout(() => setStatus('arriving'), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const pharmacy = dataState.status === 'ready' ? dataState.data.pharmacies.find(p => p.id === pharmacyId) : null;

  // Retrieve dynamic order data from local storage
  const orderStr = localStorage.getItem('currentOrder');
  const orderData = orderStr ? JSON.parse(orderStr) : {
    medicineName: 'Medicine',
    price: 0,
    deliveryFee: 0,
    subsidyApplied: false
  };

  const subsidyAmount = orderData.subsidyApplied ? orderData.price * 0.2 : 0;
  const total = orderData.price + orderData.deliveryFee - subsidyAmount;

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      <header className="topBar" style={{ margin: '-24px -20px 0 -20px', padding: '24px 20px 16px 20px' }}>
        <div className="topBar__brand" onClick={() => window.location.hash = toHash({ id: 'home' })}>
          <Home size={24} />
          <span className="brandName" style={{ fontSize: '20px' }}>Back Home</span>
        </div>
        <div style={{ fontWeight: 800, color: 'var(--primary)' }}>Order #VL8492</div>
      </header>

      {/* Visual Tracking Map */}
      <div className="clay-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="mapVisual">
          <div className="mapPin" style={{ left: status === 'preparing' ? '10%' : status === 'picked' ? '50%' : '85%' }}></div>
        </div>
        <div style={{ padding: '20px' }}>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 800 }}>
            {status === 'preparing' ? 'Preparing Order...' : status === 'picked' ? 'On the way' : 'Arriving now!'}
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontWeight: 600, fontSize: '14px' }}>
            ETA: {pharmacy ? pharmacy.etaMin : '15'} mins
          </p>
        </div>
      </div>

      {/* Delivery Partner / Call Option */}
      <div className="clay-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--clay-inset)' }}>
          <Bike size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '16px' }}>Rajesh K.</div>
          <div style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 600 }}>Delivery Partner • 4.9 ★</div>
        </div>
        <a className="clay-btn primary" href="tel:+1234567890" style={{ padding: '10px', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Phone size={20} />
        </a>
      </div>

      {/* Invoice / Order Summary */}
      <div className="clay-card">
        <h3 className="sectionTitle" style={{ fontSize: '18px', marginBottom: '16px' }}>Order Invoice</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
            <span style={{ color: 'var(--text)' }}>{orderData.medicineName}</span>
            <span>${orderData.price.toFixed(2)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
            <span style={{ color: 'var(--text)' }}>Delivery Fee</span>
            <span>{orderData.deliveryFee > 0 ? `$${orderData.deliveryFee.toFixed(2)}` : 'Free'}</span>
          </div>

          {orderData.subsidyApplied && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>
              <span>Gov Subsidy Applied</span>
              <span>-${subsidyAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>
            <span>Total Paid</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        
        <button className="clay-btn" style={{ width: '100%', marginTop: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Download size={18} /> Download PDF Invoice
        </button>
      </div>

    </div>
  );
}
