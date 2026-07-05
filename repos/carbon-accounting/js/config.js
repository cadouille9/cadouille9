// ============================================================================
// VSME Report Studio — product configuration
// This is the ONLY file you need to edit to start selling.
// See SETUP.md for the step-by-step launch guide.
// ============================================================================

export const CONFIG = {
  productName: 'VSME Report Studio',
  version: '1.0.0',

  // Shown on the landing page and in the app's unlock dialog.
  price: '€149',

  // Where customers buy a license key (your Gumroad / Lemon Squeezy product URL).
  // Leave empty to hide the buy button while you set up.
  purchaseUrl: '',

  // Support contact shown in the app footer and unlock dialog.
  supportEmail: '',

  licensing: {
    // 'gumroad'      → keys are verified against the Gumroad license API
    // 'lemonsqueezy' → keys are verified against the Lemon Squeezy license API
    // 'offline'      → keys are verified against the SHA-256 hashes below
    //                  (works with ANY payment provider: generate keys with
    //                   tools/generate-keys.mjs and deliver them after purchase)
    // 'none'         → everything is free (no watermark, no unlock dialog)
    provider: 'offline',

    // Gumroad: the product ID from your product's settings page.
    gumroadProductId: '',

    // Lemon Squeezy: your numeric store ID (used to reject keys from other stores).
    lemonSqueezyStoreId: '',

    // Offline keys: SHA-256 hex digests of valid keys. Generate with:
    //   node tools/generate-keys.mjs 100
    // The demo hash below matches the key VSME-DEMO-2026-0001 so you can test
    // the unlock flow. REMOVE IT BEFORE LAUNCH.
    offlineKeyHashes: [
      'd6afa5f066ef8946b5b1011ced6a7be2faaf810496de7a0bbc1c6c535c444b08', // DEMO — remove before launch
    ],
  },
};
