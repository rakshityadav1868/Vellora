export function normalizeText(s: string) {
	return s.trim().toLowerCase();
}

export function medicineMatchesQuery(medicineName: string, query: string) {
	const m = normalizeText(medicineName);
	const q = normalizeText(query);
	if (!q) return true;
	return m.includes(q) || q.includes(m);
}
