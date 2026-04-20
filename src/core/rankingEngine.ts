import type { Pharmacy, PharmacyMedicineAvailability } from '../types/domain';
import { normalizeText } from './searchEngine';

export type RankedPharmacy = {
	pharmacy: Pharmacy;
	score: number;
	match?: PharmacyMedicineAvailability & {
		stock?: number;
		price?: number;
		requiresPrescription?: boolean;
	};
};

export function computePharmacyScore(args: {
	availabilityStatus?: string;
	stock?: number;
	price?: number;
}) {
	const status = args.availabilityStatus;
	const stock = typeof args.stock === 'number' && Number.isFinite(args.stock) ? args.stock : 0;
	const price = typeof args.price === 'number' && Number.isFinite(args.price) ? args.price : 0;

	// Spec:
	// score = (availability === "IN_STOCK" ? 50 : 0) + (stock * 0.5) - (price * 0.1)
	return (status === 'IN_STOCK' ? 50 : 0) + stock * 0.5 - price * 0.1;
}

export function rankPharmaciesForMedicine(pharmacies: Pharmacy[], query: string): RankedPharmacy[] {
	const q = normalizeText(query);
	if (!q) return pharmacies.map((p) => ({ pharmacy: p, score: 0 }));

	return pharmacies
		.map((p) => {
			const match = (p.availability as any[]).find((a) => {
				const m = normalizeText(a.medicine);
				return m === q || m.includes(q) || q.includes(m);
			});
			// Product behavior: out-of-stock results should never outrank in/low-stock results.
			const score = match?.status === 'OUT_OF_STOCK'
				? Number.NEGATIVE_INFINITY
				: computePharmacyScore({
						availabilityStatus: match?.status,
						stock: match?.stock,
						price: match?.price,
					});
			return { pharmacy: p, score, match };
		})
		.sort((a, b) => b.score - a.score || a.pharmacy.distanceKm - b.pharmacy.distanceKm);
}
