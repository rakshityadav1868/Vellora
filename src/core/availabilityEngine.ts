import type { AvailabilityStatus } from '../types/domain';

export function calculateAvailabilityStatus(stock: number, availabilityText?: string): AvailabilityStatus {
	const s = Number.isFinite(stock) ? stock : 0;
	const a = (availabilityText ?? '').trim().toLowerCase();

	// If explicit text says out-of-stock, respect it.
	if (a.includes('out')) return 'OUT_OF_STOCK';
	if (s <= 0) return 'OUT_OF_STOCK';
	if (s <= 20) return 'LOW_STOCK';
	return 'IN_STOCK';
}
