export function Chip({
	label,
	selected,
	onClick,
}: {
	label: string;
	selected?: boolean;
	onClick?: () => void;
}) {
	return (
		<button
			className={selected ? 'chip chip--selected' : 'chip'}
			onClick={onClick}
			// Helps reliably register taps/clicks on mobile + trackpads.
			onPointerUp={(e) => {
				// Avoid firing when the user is selecting text or dragging.
				if ((e as unknown as { pointerType?: string }).pointerType === 'mouse' && e.button !== 0) return;
				onClick?.();
			}}
			type="button"
		>
			{label}
		</button>
	);
}

