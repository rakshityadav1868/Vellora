import { type Pharmacy, type PharmacyMedicineAvailability } from '../types/domain';
import { theme } from '../theme/theme';
import { medicineMatchesQuery } from '../core/searchEngine';

export function PharmacyCard({
	pharmacy,
	medicineQuery,
	onClick,
	onSave,
	saved,
}: {
	pharmacy: Pharmacy;
	medicineQuery: string;
	onClick?: () => void;
	onSave?: () => void;
	saved?: boolean;
}) {
	const availability = pharmacy.availability.find(
		(a: PharmacyMedicineAvailability) =>
			medicineMatchesQuery(a.medicine, medicineQuery)
	);

	const status = availability?.status;
	const statusLabel =
		status === 'IN_STOCK'
			? 'In Stock'
			: status === 'LOW_STOCK'
				? 'Low Stock'
				: status === 'OUT_OF_STOCK'
					? 'Out of Stock'
					: 'Unknown';

	const statusColor =
		status === 'IN_STOCK'
			? theme.colors.success
			: status === 'LOW_STOCK'
				? theme.colors.warning
			: status === 'OUT_OF_STOCK'
				? theme.colors.error
				: theme.colors.textSecondary;

	const metaLine = (() => {
		if (!availability) return 'No match for this medicine';
		const parts: string[] = [];
		if (typeof availability.stock === 'number') parts.push(`${availability.stock} in stock`);
		if (typeof availability.price === 'number') parts.push(`₹${availability.price}`);
		return parts.length ? parts.join(' • ') : 'Availability details';
	})();

	return (
		<div className="card" onClick={onClick} role={onClick ? 'button' : undefined}>
			<div className="cardTop">
				<div style={{ flex: 1 }}>
					<div className="cardTitle">{pharmacy.name}</div>
					<div className="muted">
						{pharmacy.distanceKm.toFixed(1)} km • ETA {pharmacy.etaMin} min
					</div>
				</div>
				<div className="statusPill" style={{ borderColor: statusColor, color: statusColor }}>
					{statusLabel}
				</div>
			</div>

			<div className="cardBottom">
				<div className="muted" style={{ fontWeight: 600 }}>
					{metaLine}
				</div>

				<div className="cardActions" onClick={(e) => e.stopPropagation()}>
					<a className="btn btn--muted" href={pharmacy.phone ? `tel:${pharmacy.phone}` : undefined}>
						Call
					</a>
					<a
						className="btn btn--primary"
						href="https://maps.google.com/?q=pharmacy"
						target="_blank"
						rel="noreferrer"
					>
						Navigate
					</a>
					<button
						className={saved ? 'btn btn--muted btn--saved' : 'btn btn--muted'}
						onClick={onSave}
						type="button"
					>
						{saved ? 'Saved' : 'Save'}
					</button>
				</div>
			</div>
		</div>
	);
}

