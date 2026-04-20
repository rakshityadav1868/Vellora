import { normalizeText } from '../core/searchEngine';

export const getAutocompleteSuggestions = (input: string, options?: { medicines?: string[] }) => {
	const q = normalizeText(input);
	const meds = options?.medicines?.length ? options.medicines : [];
	if (!meds.length) return [];
	if (!q) return [...meds].slice(0, 8);

	const startsWith = meds.filter((m) => normalizeText(m).startsWith(q));
	const contains = meds.filter((m) => !normalizeText(m).startsWith(q) && normalizeText(m).includes(q));
	return [...startsWith, ...contains].slice(0, 8);
};

export const levenshtein = (a: string, b: string) => {
	const s = normalizeText(a);
	const t = normalizeText(b);
	const dp: number[][] = Array.from({ length: s.length + 1 }, () => Array(t.length + 1).fill(0));
	for (let i = 0; i <= s.length; i++) dp[i][0] = i;
	for (let j = 0; j <= t.length; j++) dp[0][j] = j;
	for (let i = 1; i <= s.length; i++) {
		for (let j = 1; j <= t.length; j++) {
			const cost = s[i - 1] === t[j - 1] ? 0 : 1;
			dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
		}
	}
	return dp[s.length][t.length];
};

export const maybeCorrectSpelling = (input: string) => {
	return maybeCorrectSpellingFromList(input);
};

export const maybeCorrectSpellingFromList = (input: string, medicines: string[] = []) => {
	const q = normalizeText(input);
	if (!medicines.length) return undefined;
	if (!q) return undefined;

	let best: { med: string; dist: number } | undefined;
	for (const med of medicines) {
		const dist = levenshtein(q, med);
		if (!best || dist < best.dist) best = { med, dist };
	}

	if (best && best.dist > 0 && best.dist <= 2) return best.med;
	return undefined;
};

