// ============================================================================
// Persistence — meta (license, language, branding) in localStorage.
// Audit results are ephemeral by design; nothing leaves the browser.
// ============================================================================

const META_KEY = 'carbonlens-meta-v1';

export function loadMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}
