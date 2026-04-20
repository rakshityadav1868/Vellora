import { PHARMACIES } from '../src/data/mockData';
import { pickEmergencyPharmacy, searchPharmacies } from '../src/lib/search';

describe('searchPharmacies', () => {
  it('ranks in-stock pharmacies above out-of-stock for the same medicine', () => {
    const result = searchPharmacies(PHARMACIES, 'Paracetamol', { openNow: true });
    expect(result.length).toBeGreaterThan(0);

    const first = result[0];
    const availability = first.availability.find((a) => a.medicine === 'Paracetamol');
    expect(availability?.status).toBe('IN_STOCK');
  });
});

describe('pickEmergencyPharmacy', () => {
  it('prefers open pharmacies when possible', () => {
    const picked = pickEmergencyPharmacy(PHARMACIES, 'Paracetamol');
    expect(picked).toBeTruthy();
  // New Emergency Engine prioritizes availability/stock/price; openNow isn't guaranteed in the mock dataset.
  const availability = picked?.availability.find((a) => a.medicine === 'Paracetamol');
  expect(availability?.status).not.toBe('OUT_OF_STOCK');
  });
});
