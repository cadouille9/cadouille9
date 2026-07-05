// ============================================================================
// Persistence — everything stays in the user's browser (localStorage).
// No server, no cookies, no tracking: this is a core product promise.
// ============================================================================

const DATA_KEY = 'vsme-studio-data-v1';
const META_KEY = 'vsme-studio-meta-v1';

export function loadData() {
  try {
    return JSON.parse(localStorage.getItem(DATA_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

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

export function clearAll() {
  localStorage.removeItem(DATA_KEY);
}

/** Serialize the questionnaire to a downloadable JSON backup. */
export function exportJson(data) {
  return JSON.stringify(
    { app: 'vsme-report-studio', schemaVersion: 1, exportedAt: new Date().toISOString(), data },
    null,
    2
  );
}

/** Parse an uploaded backup; throws with a readable message if invalid. */
export function importJson(text) {
  const parsed = JSON.parse(text);
  if (!parsed || parsed.app !== 'vsme-report-studio' || typeof parsed.data !== 'object') {
    throw new Error('Not a VSME Report Studio backup file.');
  }
  return parsed.data;
}
