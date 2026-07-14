const PROVIDER_DATA_CHANGED_EVENT = "clearview:provider-data-changed";

export function notifyProviderDataChanged(): void {
  window.dispatchEvent(new Event(PROVIDER_DATA_CHANGED_EVENT));
}

export function onProviderDataChanged(callback: () => void): () => void {
  window.addEventListener(PROVIDER_DATA_CHANGED_EVENT, callback);
  return () => window.removeEventListener(PROVIDER_DATA_CHANGED_EVENT, callback);
}
