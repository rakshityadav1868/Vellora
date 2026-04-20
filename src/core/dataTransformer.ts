import { calculateAvailabilityStatus } from './availabilityEngine';

export type RawRow = Record<string, unknown>;

const toNumberSafe = (v: unknown) => {
	if (typeof v === 'number') return v;
	if (typeof v === 'string') {
		const n = Number(v.replace(/[^0-9.\-]/g, ''));
		return Number.isFinite(n) ? n : NaN;
	}
	return NaN;
};

const toStringSafe = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export function transformAvailabilityRow(row: RawRow) {
	const stock = toNumberSafe(row['Stock Quantity']);
	const price = toNumberSafe(row['Selling Price INR']) || toNumberSafe(row['price']);
	const availabilityText = toStringSafe(row['Availability']);

	return {
		stock: Number.isFinite(stock) ? stock : 0,
		price: Number.isFinite(price) ? price : 0,
		status: calculateAvailabilityStatus(Number.isFinite(stock) ? stock : 0, availabilityText),
	};
}
