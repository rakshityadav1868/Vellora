export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return;

  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch {
    // no-op for MVP
  }
};
