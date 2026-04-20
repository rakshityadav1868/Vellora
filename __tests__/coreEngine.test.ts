import { calculateAvailabilityStatus } from '../src/core/availabilityEngine';
import { pickEmergencyResult } from '../src/core/emergencyEngine';
import { rankPharmaciesForMedicine } from '../src/core/rankingEngine';
import type { Pharmacy } from '../src/types/domain';

const makePharmacy = (id: string, med: { name: string; status: any; stock: number; price: number }): Pharmacy => ({
	id,
	name: `Pharmacy ${id}`,
	address: 'x',
	distanceKm: 1,
	etaMin: 5,
	openNow: true,
	is247: false,
	verifiedPharmacy: true,
	availability: [
		{
			medicine: med.name,
			status: med.status,
			metadata: { lastUpdatedISO: new Date().toISOString(), source: 'SYSTEM', confidence: 0.9, verified: true },
			// extra fields used by engines
			stock: med.stock,
			price: med.price,
		} as any,
	],
});

describe('Availability Engine', () => {
	it('returns OUT_OF_STOCK when stock is 0', () => {
		expect(calculateAvailabilityStatus(0, 'In Stock')).toBe('OUT_OF_STOCK');
	});

	it('returns LOW_STOCK when stock <= 20', () => {
		expect(calculateAvailabilityStatus(20, 'In Stock')).toBe('LOW_STOCK');
	});

	it('returns IN_STOCK when stock > 20', () => {
		expect(calculateAvailabilityStatus(21, 'In Stock')).toBe('IN_STOCK');
	});
});

describe('Emergency Engine', () => {
	it('picks highest stock then lowest price among in-stock only', () => {
		const pharmacies: Pharmacy[] = [
			makePharmacy('A', { name: 'paracetamol 500mg', status: 'IN_STOCK', stock: 50, price: 100 }),
			makePharmacy('B', { name: 'paracetamol 500mg', status: 'IN_STOCK', stock: 60, price: 150 }),
			makePharmacy('C', { name: 'paracetamol 500mg', status: 'OUT_OF_STOCK', stock: 999, price: 1 }),
		];
		const picked = pickEmergencyResult(pharmacies, 'paracetamol');
		expect(picked?.pharmacy.id).toBe('B');
	});
});

describe('Ranking Engine', () => {
	it('ranks by availability + stock - price (per spec)', () => {
		const pharmacies: Pharmacy[] = [
			makePharmacy('A', { name: 'paracetamol 500mg', status: 'IN_STOCK', stock: 10, price: 10 }),
			makePharmacy('B', { name: 'paracetamol 500mg', status: 'IN_STOCK', stock: 40, price: 200 }),
			makePharmacy('C', { name: 'paracetamol 500mg', status: 'OUT_OF_STOCK', stock: 999, price: 1 }),
		];
		const ranked = rankPharmaciesForMedicine(pharmacies, 'paracetamol');
		// Out-of-stock should not surpass in-stock in the scoring model (no +50 boost).
		expect(ranked[0].pharmacy.id).toBe('A');
	});
});
