// ============================================================================
// License validation — zero-backend, three interchangeable providers.
//
// 'offline'      → SHA-256 of the key must match a hash in config.js.
//                  Works with any payment provider (Stripe Payment Links,
//                  bank transfer, invoicing) — you deliver keys yourself.
// 'gumroad'      → verified against Gumroad's public license endpoint.
// 'lemonsqueezy' → verified against Lemon Squeezy's public license endpoint.
//
// Note: with a purely static app the gate is client-side by design. A
// determined user can bypass it; the target customers (SMEs producing an
// official report) overwhelmingly won't. See SETUP.md § "How the paywall works".
// ============================================================================

import { CONFIG } from './config.js';
import { loadMeta, saveMeta } from './store.js';

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function validateOffline(key) {
  const hash = await sha256Hex(key.trim());
  const ok = CONFIG.licensing.offlineKeyHashes.includes(hash);
  return { ok, reason: ok ? '' : 'invalid_key' };
}

async function validateGumroad(key) {
  const body = new URLSearchParams({
    product_id: CONFIG.licensing.gumroadProductId,
    license_key: key.trim(),
    increment_uses_count: 'false',
  });
  const res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (json.success && json.purchase && !json.purchase.refunded && !json.purchase.chargebacked) {
    return { ok: true, reason: '' };
  }
  return { ok: false, reason: json.success ? 'refunded' : 'invalid_key' };
}

async function validateLemonSqueezy(key) {
  const res = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ license_key: key.trim() }),
  });
  const json = await res.json().catch(() => ({}));
  const storeOk =
    !CONFIG.licensing.lemonSqueezyStoreId ||
    String(json?.meta?.store_id) === String(CONFIG.licensing.lemonSqueezyStoreId);
  if (json.valid && storeOk && json?.license_key?.status !== 'disabled') {
    return { ok: true, reason: '' };
  }
  return { ok: false, reason: 'invalid_key' };
}

/**
 * Validate a key with the configured provider.
 * Returns { ok, reason } where reason ∈ '', 'invalid_key', 'refunded', 'network'.
 */
export async function validateKey(key) {
  if (!key || !key.trim()) return { ok: false, reason: 'invalid_key' };
  try {
    switch (CONFIG.licensing.provider) {
      case 'none':
        return { ok: true, reason: '' };
      case 'gumroad':
        return await validateGumroad(key);
      case 'lemonsqueezy':
        return await validateLemonSqueezy(key);
      case 'offline':
      default:
        return await validateOffline(key);
    }
  } catch {
    return { ok: false, reason: 'network' };
  }
}

/** Is the app currently unlocked (or free by configuration)? */
export function isUnlocked() {
  if (CONFIG.licensing.provider === 'none') return true;
  return !!loadMeta().unlocked;
}

export function storeUnlock(key) {
  const meta = loadMeta();
  meta.unlocked = true;
  meta.licenseKey = key.trim();
  meta.unlockedAt = new Date().toISOString();
  saveMeta(meta);
}
