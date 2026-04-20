import type { Pharmacy, PharmacyMedicineAvailability } from '../types/domain';
import { transformAvailabilityRow, type RawRow as CoreRawRow } from '../core/dataTransformer';

type RawRow = CoreRawRow;

const toStringSafe = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));
const toNumberSafe = (v: unknown) => {
	if (typeof v === 'number') return v;
	if (typeof v === 'string') {
		const n = Number(v.replace(/[^0-9.\-]/g, ''));
		return Number.isFinite(n) ? n : NaN;
	}
	return NaN;
};

const normalizeName = (s: string) => s.trim();

const confidenceFrom = (row: RawRow) => {
	// Dataset doesn't have confidence, so we derive a reasonable default.
	const stock = toNumberSafe(row['Stock Quantity']);
	if (!Number.isFinite(stock)) return 0.65;
	if (stock >= 20) return 0.9;
	if (stock >= 5) return 0.8;
	if (stock > 0) return 0.72;
	return 0.6;
};

const lastUpdatedISOFrom = (row: RawRow) => {
	// If parsing fails, fall back to now.
	const raw = toStringSafe(row['Last Restocked']);
	const d = new Date(raw);
	if (!Number.isNaN(d.getTime())) return d.toISOString();
	return new Date().toISOString();
};

const stableBoolFromId = (id: string, mod: number, trueForRemainder: number) => {
	// Deterministic pseudo-random.
	let h = 0;
	for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
	return h % mod < trueForRemainder;
};

export type VeloraData = {
	pharmacies: Pharmacy[];
	medicines: string[];
};

export async function loadVeloraData(): Promise<VeloraData> {
	const res = await fetch('/data.json', { cache: 'no-store' });
	if (!res.ok) throw new Error(`Failed to load data.json (${res.status})`);
	const rows = (await res.json()) as RawRow[];

	const pharmacyMap = new Map<string, Pharmacy>();
	const medicines = new Set<string>();

	for (const row of rows) {
		const pharmacyId = normalizeName(toStringSafe(row['Pharmacy ID'])) || normalizeName(toStringSafe(row['pharmacy_id']));
		const pharmacyName = normalizeName(toStringSafe(row['pharmacy_name'])) || 'Unknown Pharmacy';
		const medicineName = normalizeName(toStringSafe(row['medicine_name'])) || 'Unknown Medicine';
		const requiresRxText = toStringSafe(row['requires_prescription']);

		if (!pharmacyId) continue;

		medicines.add(medicineName);

		let pharmacy = pharmacyMap.get(pharmacyId);
		if (!pharmacy) {
			// No location/time fields in dataset; use deterministic placeholders so UI works.
			const distanceKm = 0.8 + (Math.abs(pharmacyId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 60) / 10;
			const etaMin = Math.max(4, Math.round(distanceKm * 5));
			const openNow = stableBoolFromId(pharmacyId, 10, 8);
			const is247 = stableBoolFromId(pharmacyId, 10, 3);
			const verifiedPharmacy = stableBoolFromId(pharmacyId, 10, 6);

			pharmacy = {
				id: pharmacyId,
				name: pharmacyName,
				address: 'Address not provided',
				distanceKm,
				etaMin,
				openNow,
				is247,
				verifiedPharmacy,
				availability: [],
			};
			pharmacyMap.set(pharmacyId, pharmacy);
		}

		const transformed = transformAvailabilityRow(row);
		const status = transformed.status;
		const rxRequired = requiresRxText.trim().toLowerCase() === 'yes';

		const a: PharmacyMedicineAvailability = {
			medicine: medicineName,
			status,
			metadata: {
				lastUpdatedISO: lastUpdatedISOFrom(row),
				source: 'SYSTEM',
				confidence: confidenceFrom(row),
				verified: pharmacy.verifiedPharmacy,
			},
			price: transformed.price,
			stock: transformed.stock,
			requiresPrescription: rxRequired,
			medicineId: toStringSafe(row['Medicine ID']) || undefined,
			batchNo: toStringSafe(row['Batch No']) || undefined,
			lastRestocked: toStringSafe(row['Last Restocked']) || undefined,
			reorderLevel: Number.isFinite(toNumberSafe(row['Reorder Level'])) ? toNumberSafe(row['Reorder Level']) : undefined,
		};

		pharmacy.availability.push(a);
	}

	return {
		pharmacies: Array.from(pharmacyMap.values()),
		medicines: Array.from(medicines).sort((a, b) => a.localeCompare(b)),
	};
}
