// ============================================================================
// External data sources — both free, both CORS-enabled, both callable
// straight from the browser (that's what keeps this app backend-free):
//
//  1. Google PageSpeed Insights v5 — runs a real Lighthouse audit and
//     returns per-request transfer sizes + optimisation opportunities.
//     Works without an API key (small anonymous quota per IP).
//  2. Green Web Foundation greencheck v3 — is the site hosted green?
//
// parsePsi() is pure and unit-tested; fetchers are thin wrappers.
// Test hook: set window.__CARBONLENS_ENDPOINTS to point at fixtures.
// ============================================================================

import { CONFIG } from './config.js';

const DEFAULT_ENDPOINTS = {
  psi: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?category=performance&strategy=mobile&url=',
  greencheck: 'https://api.thegreenwebfoundation.org/api/v3/greencheck/',
};

function endpoints() {
  return (typeof window !== 'undefined' && window.__CARBONLENS_ENDPOINTS) || DEFAULT_ENDPOINTS;
}

/** Normalise user input into a fetchable URL, or null if hopeless. */
export function normalizeUrl(input) {
  let s = String(input || '').trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    if (!u.hostname.includes('.')) return null;
    return u.href;
  } catch {
    return null;
  }
}

// Lighthouse opportunity audits worth surfacing, with the byte field to read.
const OPPORTUNITY_AUDITS = [
  'modern-image-formats',
  'uses-optimized-images',
  'uses-responsive-images',
  'offscreen-images',
  'unused-javascript',
  'unused-css-rules',
  'legacy-javascript',
  'uses-text-compression',
  'efficient-animated-content',
];

/**
 * Extract everything we need from a raw PSI response. Pure.
 * Returns { finalUrl, perfScore, totalBytes, breakdown, opportunities }.
 */
export function parsePsi(psi) {
  const lr = psi?.lighthouseResult;
  if (!lr) throw new Error('psi_malformed');

  const audits = lr.audits || {};
  const items = audits['network-requests']?.details?.items || [];

  const breakdown = {};
  let totalBytes = 0;
  for (const it of items) {
    const size = Number(it.transferSize) || 0;
    const type = it.resourceType || 'Other';
    breakdown[type] = (breakdown[type] || 0) + size;
    totalBytes += size;
  }
  // Fallback when network-requests is unavailable
  if (totalBytes === 0) {
    totalBytes = Number(audits['total-byte-weight']?.numericValue) || 0;
  }

  const opportunities = [];
  for (const id of OPPORTUNITY_AUDITS) {
    const a = audits[id];
    const savingsBytes = Number(a?.details?.overallSavingsBytes) || 0;
    if (savingsBytes > 1024) {
      opportunities.push({ id, title: a.title || id, savingsBytes });
    }
  }
  opportunities.sort((x, y) => y.savingsBytes - x.savingsBytes);

  return {
    finalUrl: lr.finalDisplayedUrl || lr.finalUrl || lr.requestedUrl || '',
    perfScore: lr.categories?.performance?.score ?? null,
    totalBytes,
    breakdown,
    opportunities,
  };
}

/** Run the Lighthouse audit via PSI. Throws 'psi_quota' | 'psi_failed'. */
export async function fetchPsi(url) {
  const key = CONFIG.psiApiKey ? `&key=${encodeURIComponent(CONFIG.psiApiKey)}` : '';
  const res = await fetch(endpoints().psi + encodeURIComponent(url) + key);
  if (res.status === 429) throw new Error('psi_quota');
  if (!res.ok) throw new Error('psi_failed');
  return parsePsi(await res.json());
}

/** Green hosting check. Fails soft — returns { green: null } on any error. */
export async function fetchGreencheck(url) {
  try {
    const host = new URL(url).hostname;
    const res = await fetch(endpoints().greencheck + encodeURIComponent(host));
    if (!res.ok) return { green: null, hostedBy: '' };
    const json = await res.json();
    return { green: !!json.green, hostedBy: json.hosted_by || '' };
  } catch {
    return { green: null, hostedBy: '' };
  }
}

/** Full audit: PSI + greencheck in parallel. */
export async function runAudit(rawUrl) {
  const url = normalizeUrl(rawUrl);
  if (!url) throw new Error('bad_url');
  const [psi, green] = await Promise.all([fetchPsi(url), fetchGreencheck(url)]);
  return { url, ...psi, greenHost: green };
}
