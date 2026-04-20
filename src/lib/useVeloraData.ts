import { useEffect, useMemo, useState } from 'react';

import { loadVeloraData, type VeloraData } from './realData';

type State =
	| { status: 'idle' | 'loading' }
	| { status: 'error'; error: string }
	| { status: 'ready'; data: VeloraData };

let cache: VeloraData | undefined;
let cachePromise: Promise<VeloraData> | undefined;

export function useVeloraData() {
	const [state, setState] = useState<State>(() => (cache ? { status: 'ready', data: cache } : { status: 'idle' }));

	useEffect(() => {
		if (cache) return;
		let cancelled = false;
		setState({ status: 'loading' });
		cachePromise = cachePromise ?? loadVeloraData();
		cachePromise
			.then((data) => {
				cache = data;
				if (!cancelled) setState({ status: 'ready', data });
			})
			.catch((e: unknown) => {
				const msg = e instanceof Error ? e.message : String(e);
				if (!cancelled) setState({ status: 'error', error: msg });
			});

		return () => {
			cancelled = true;
		};
	}, []);

	return useMemo(() => state, [state]);
}
