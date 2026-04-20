const key = (k: string) => `velora:${k}`;

export const storage = {
  getJSON<T>(k: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key(k));
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  setJSON(k: string, v: unknown) {
    localStorage.setItem(key(k), JSON.stringify(v));
  },
};
