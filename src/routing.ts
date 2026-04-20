export type RouteId = 'home' | 'search' | 'pharmacy' | 'emergency' | 'saved';

export type Route =
  | { id: 'home' }
  | { id: 'search'; query?: string }
  | { id: 'pharmacy'; pharmacyId: string; query: string }
  | { id: 'emergency'; query?: string }
  | { id: 'saved' };

export const toHash = (route: Route) => {
  const u = new URL('http://x');
  const set = (k: string, v?: string) => {
    if (v != null && v !== '') u.searchParams.set(k, v);
  };

  u.pathname = `/${route.id}`;
  if (route.id === 'search') set('q', route.query);
  if (route.id === 'emergency') set('q', route.query);
  if (route.id === 'pharmacy') {
    set('id', route.pharmacyId);
    set('q', route.query);
  }

  const pathAndQuery = `${u.pathname}${u.search}`;
  return `#${pathAndQuery}`;
};

export const parseHashRoute = (hash: string): Route => {
  const cleaned = (hash || '').replace(/^#/, '') || '/home';
  const u = new URL(`http://x${cleaned.startsWith('/') ? '' : '/'}${cleaned}`);
  const rawId = u.pathname.replace('/', '') || 'home';
  const id: RouteId =
    rawId === 'home' || rawId === 'search' || rawId === 'pharmacy' || rawId === 'emergency' || rawId === 'saved'
      ? rawId
      : 'home';

  if (id === 'search') return { id: 'search', query: u.searchParams.get('q') ?? undefined };
  if (id === 'emergency') return { id: 'emergency', query: u.searchParams.get('q') ?? undefined };
  if (id === 'pharmacy') {
    return {
      id: 'pharmacy',
      pharmacyId: u.searchParams.get('id') ?? 'ph_01',
      query: u.searchParams.get('q') ?? '',
    };
  }
  if (id === 'saved') return { id: 'saved' };
  return { id: 'home' };
};
