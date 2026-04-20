import type { Pharmacy } from '../types/domain';
import { medicineMatchesQuery, normalizeText } from './searchEngine';

export function pickEmergencyResult(pharmacies: Pharmacy[], query: string) {
	const q = normalizeText(query);
	if (!q) return undefined;

	const candidates = pharmacies
		.map((p) => {
			const match = (p.availability as any[]).find((a) => medicineMatchesQuery(a.medicine, q));
			return { pharmacy: p, match };
		})
		.filter((x) => {
			const st = x.match?.status;
			return st === 'IN_STOCK' || st === 'LOW_STOCK';
		});

	if (candidates.length === 0) return undefined;

	candidates.sort((a, b) => {
		const stockA = typeof a.match?.stock === 'number' ? a.match.stock : 0;
		const stockB = typeof b.match?.stock === 'number' ? b.match.stock : 0;
		if (stockB !== stockA) return stockB - stockA;
		const priceA = typeof a.match?.price === 'number' ? a.match.price : Number.POSITIVE_INFINITY;
		const priceB = typeof b.match?.price === 'number' ? b.match.price : Number.POSITIVE_INFINITY;
		if (priceA !== priceB) return priceA - priceB;
		return a.pharmacy.distanceKm - b.pharmacy.distanceKm;
	});

	return candidates[0];
}
