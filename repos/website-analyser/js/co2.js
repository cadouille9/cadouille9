// ============================================================================
// CO₂ model — Sustainable Web Design (SWD) v3, as popularised by
// websitecarbon.com and The Green Web Foundation's co2.js.
// Pure functions, no DOM — unit-tested in Node.
//
// Model constants (SWD v3):
//   0.81 kWh of energy per GB transferred, split across system segments:
//   consumer devices 52%, networks 14%, data centers 15%, production 19%.
//   Grid intensity 442 gCO₂e/kWh (global average); verified green hosting
//   replaces the data-center segment's intensity with 50.9 gCO₂e/kWh
//   (renewables average). Review yearly — see MAINTENANCE.md.
// ============================================================================

export const SWD = {
  kwhPerGb: 0.81,
  segments: { device: 0.52, network: 0.14, dataCenter: 0.15, production: 0.19 },
  gridIntensity: 442, // gCO2e per kWh, global average
  renewableIntensity: 50.9, // gCO2e per kWh for verified green hosting
};

// Digital Carbon Ratings scale (Sustainable Web Design, based on HTTP Archive
// percentiles) — grams CO₂e per page view.
export const RATING_SCALE = [
  { grade: 'A+', max: 0.095 },
  { grade: 'A', max: 0.186 },
  { grade: 'B', max: 0.341 },
  { grade: 'C', max: 0.493 },
  { grade: 'D', max: 0.656 },
  { grade: 'E', max: 0.846 },
  { grade: 'F', max: Infinity },
];

// Everyday equivalents (commonly used public figures, disclosed in the report)
export const EQUIVALENTS = {
  gramsPerKmCar: 171, // average EU passenger car, lifecycle
  kgPerTreeYear: 25, // CO₂ absorbed by one mature tree per year
  gramsPerPhoneCharge: 8.2, // one smartphone full charge (grid average)
};

const GB = 1024 * 1024 * 1024;

/**
 * Emissions for transferring `bytes` once.
 * Returns grams CO₂e plus the per-segment breakdown.
 */
export function co2PerView(bytes, { greenHost = false } = {}) {
  const b = Number(bytes);
  if (!Number.isFinite(b) || b <= 0) {
    return { grams: 0, energyKwh: 0, segments: { device: 0, network: 0, dataCenter: 0, production: 0 } };
  }
  const energyKwh = (b / GB) * SWD.kwhPerGb;
  const segs = {};
  let grams = 0;
  for (const [name, share] of Object.entries(SWD.segments)) {
    const intensity = name === 'dataCenter' && greenHost ? SWD.renewableIntensity : SWD.gridIntensity;
    segs[name] = energyKwh * share * intensity;
    grams += segs[name];
  }
  return { grams, energyKwh, segments: segs };
}

/** Digital Carbon Rating grade for grams-per-view. */
export function rating(gramsPerView) {
  return RATING_SCALE.find((r) => gramsPerView <= r.max).grade;
}

/**
 * Share of pages this page is "cleaner than", derived from the same
 * HTTP Archive percentiles the rating scale is built on (rough linear
 * interpolation between the known percentile anchors).
 */
export function cleanerThan(gramsPerView) {
  // Anchors: (grams, percentile of pages DIRTIER than this)
  const anchors = [
    [0.095, 0.95],
    [0.186, 0.9],
    [0.341, 0.8],
    [0.493, 0.7],
    [0.656, 0.6],
    [0.846, 0.5],
    [2.0, 0.2],
    [4.0, 0.05],
  ];
  if (gramsPerView <= anchors[0][0]) return anchors[0][1];
  for (let i = 1; i < anchors.length; i++) {
    const [g1, p1] = anchors[i - 1];
    const [g2, p2] = anchors[i];
    if (gramsPerView <= g2) {
      return p1 + ((gramsPerView - g1) / (g2 - g1)) * (p2 - p1);
    }
  }
  return 0.02;
}

/**
 * Annual projection for a given monthly page-view count.
 * Returns kg CO₂e per year plus everyday equivalents.
 */
export function annualImpact(gramsPerView, monthlyViews) {
  const views = Number(monthlyViews);
  if (!Number.isFinite(views) || views <= 0) return null;
  const kgPerYear = (gramsPerView * views * 12) / 1000;
  return {
    kgPerYear,
    kmByCar: (kgPerYear * 1000) / EQUIVALENTS.gramsPerKmCar,
    trees: kgPerYear / EQUIVALENTS.kgPerTreeYear,
    phoneCharges: (kgPerYear * 1000) / EQUIVALENTS.gramsPerPhoneCharge,
  };
}

/**
 * CO₂ saved per view if `savingsBytes` were eliminated (used to rank
 * Lighthouse opportunities by climate impact).
 */
export function savingsPerView(savingsBytes, opts) {
  return co2PerView(savingsBytes, opts).grams;
}

/** Format grams with sensible precision. */
export function fmtGrams(g, lang = 'en') {
  const locale = lang === 'de' ? 'de-DE' : 'en-GB';
  if (g >= 100) return g.toLocaleString(locale, { maximumFractionDigits: 0 });
  if (g >= 1) return g.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return g.toLocaleString(locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

export function fmtBytes(bytes, lang = 'en') {
  const locale = lang === 'de' ? 'de-DE' : 'en-GB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return mb.toLocaleString(locale, { maximumFractionDigits: 2 }) + ' MB';
  return (bytes / 1024).toLocaleString(locale, { maximumFractionDigits: 0 }) + ' KB';
}

export function fmtNum(n, lang = 'en', decimals = 0) {
  return Number(n).toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
