import { type Pharmacy } from '../types/domain';
import { pickEmergencyResult } from '../core/emergencyEngine';
import { rankPharmaciesForMedicine } from '../core/rankingEngine';

export type Filters = {
	openNow?: boolean;
	is247?: boolean;
};

export const normalize = (s: string) => s.trim().toLowerCase();

export const searchPharmacies = (pharmacies: Pharmacy[], query: string, filters: Filters = {}) => {
	const q = normalize(query);
	const filtered = pharmacies.filter((p) => {
		if (filters.openNow && !p.openNow) return false;
		if (filters.is247 && !p.is247) return false;
		return true;
	});

	if (!q) return [...filtered].sort((a, b) => a.distanceKm - b.distanceKm);

	// Rank using core engine (also naturally filters out irrelevant pharmacies via match).
	return rankPharmaciesForMedicine(filtered, q)
		.filter((r) => r.match)
		.map((r) => r.pharmacy);
};

export const pickEmergencyPharmacy = (pharmacies: Pharmacy[], query: string) => {
	// Backwards-compatible wrapper.
	const picked = pickEmergencyResult(pharmacies, query);
	return picked?.pharmacy;
};

