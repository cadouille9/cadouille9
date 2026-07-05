// ============================================================================
// CarbonLens — product configuration
// This is the ONLY file you need to edit to start selling. See SETUP.md.
// ============================================================================

export const CONFIG = {
  productName: 'CarbonLens',
  version: '1.0.0',

  // White-label license shown on the landing/pricing UI.
  price: '€149 / year',

  // Where customers buy a license key (Gumroad / Lemon Squeezy product URL).
  purchaseUrl: '',

  // Support contact shown in the footer and unlock dialog.
  supportEmail: '',

  // Optional Google PageSpeed Insights API key. The tool works WITHOUT a key
  // (Google allows a small number of anonymous requests per IP); add a free
  // key from https://developers.google.com/speed/docs/insights/v5/get-started
  // to raise the quota. The key is public-facing by design (client-side app) —
  // restrict it to the PageSpeed API + your domain in the Google console.
  psiApiKey: '',

  licensing: {
    // 'gumroad' | 'lemonsqueezy' | 'offline' | 'none'  (see SETUP.md)
    provider: 'offline',
    gumroadProductId: '',
    lemonSqueezyStoreId: '',
    // SHA-256 hashes of valid keys — generate with: node tools/generate-keys.mjs 100
    // The demo hash matches LENS-DEMO-2026-0001. REMOVE IT BEFORE LAUNCH.
    offlineKeyHashes: [
      'f56c1b19796dda380edaeb28ebb7c4af5ef0d8d3e4069b57bf7b6a4c9f8c8db1', // DEMO — remove before launch
    ],
  },
};
