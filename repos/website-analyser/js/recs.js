// ============================================================================
// Recommendation engine — maps Lighthouse opportunity audits to
// plain-language, bilingual advice with estimated CO₂ savings.
// Pure module (unit-tested in Node).
// ============================================================================

import { savingsPerView } from './co2.js';

export const REC_TEXTS = {
  'modern-image-formats': {
    en: { title: 'Serve images in modern formats', tip: 'Convert JPEG/PNG images to WebP or AVIF — typically 30–70% smaller at the same visual quality. Most CMS and build tools can do this automatically.' },
    de: { title: 'Bilder in modernen Formaten ausliefern', tip: 'JPEG/PNG-Bilder zu WebP oder AVIF konvertieren — bei gleicher Qualität typischerweise 30–70 % kleiner. Die meisten CMS und Build-Tools können das automatisch.' },
  },
  'uses-optimized-images': {
    en: { title: 'Compress images properly', tip: 'Run images through a compressor (e.g. built into your CMS, or squoosh.app). Uncompressed photos are the most common cause of heavy pages.' },
    de: { title: 'Bilder richtig komprimieren', tip: 'Bilder durch einen Kompressor laufen lassen (im CMS integriert oder z. B. squoosh.app). Unkomprimierte Fotos sind die häufigste Ursache schwerer Seiten.' },
  },
  'uses-responsive-images': {
    en: { title: 'Size images for the screens that view them', tip: 'Serve smaller image variants to phones (srcset). Sending a 2000px image to a 400px screen wastes most of its bytes.' },
    de: { title: 'Bildgrößen an Bildschirme anpassen', tip: 'Kleinere Bildvarianten für Smartphones ausliefern (srcset). Ein 2000-px-Bild auf einem 400-px-Bildschirm verschwendet die meisten Bytes.' },
  },
  'offscreen-images': {
    en: { title: 'Lazy-load images below the fold', tip: 'Add loading="lazy" so images load only when scrolled into view — visitors who leave early never download them.' },
    de: { title: 'Bilder unterhalb des Sichtbereichs nachladen', tip: 'Mit loading="lazy" laden Bilder erst beim Scrollen — Besucher, die früh abspringen, laden sie nie herunter.' },
  },
  'unused-javascript': {
    en: { title: 'Remove unused JavaScript', tip: 'Large JS bundles often ship code that never runs. Audit third-party scripts and tracking tags — each one costs CO₂ on every single visit.' },
    de: { title: 'Ungenutztes JavaScript entfernen', tip: 'Große JS-Bundles enthalten oft Code, der nie ausgeführt wird. Prüfen Sie Drittanbieter-Skripte und Tracking-Tags — jedes kostet bei jedem Besuch CO₂.' },
  },
  'unused-css-rules': {
    en: { title: 'Remove unused CSS', tip: 'Strip unused styles (e.g. from frameworks or themes). Tools like PurgeCSS automate this.' },
    de: { title: 'Ungenutztes CSS entfernen', tip: 'Ungenutzte Styles entfernen (z. B. aus Frameworks oder Themes). Tools wie PurgeCSS automatisieren das.' },
  },
  'legacy-javascript': {
    en: { title: 'Stop shipping legacy JavaScript', tip: 'Modern browsers don\'t need old polyfills and transpiled code. Update your build targets to cut bundle weight.' },
    de: { title: 'Kein Legacy-JavaScript mehr ausliefern', tip: 'Moderne Browser brauchen alte Polyfills und transpilierten Code nicht. Build-Targets aktualisieren und Bundle-Gewicht senken.' },
  },
  'uses-text-compression': {
    en: { title: 'Enable text compression', tip: 'Turn on gzip or Brotli on your server/CDN — a one-line config change that shrinks HTML, CSS and JS by 60–80%.' },
    de: { title: 'Textkomprimierung aktivieren', tip: 'gzip oder Brotli auf Server/CDN aktivieren — eine Konfigurationszeile, die HTML, CSS und JS um 60–80 % verkleinert.' },
  },
  'efficient-animated-content': {
    en: { title: 'Replace animated GIFs with video', tip: 'Animated GIFs are enormous. MP4/WebM versions are typically 80–90% smaller.' },
    de: { title: 'Animierte GIFs durch Video ersetzen', tip: 'Animierte GIFs sind riesig. MP4/WebM-Versionen sind typischerweise 80–90 % kleiner.' },
  },
};

// Advice shown even without byte savings when relevant.
export const GREEN_HOST_REC = {
  en: { title: 'Switch to a green host', tip: 'Your hosting provider is not verified as running on renewable energy. Moving to a verified green host (see the Green Web Foundation directory) cuts the data-center share of every page view.' },
  de: { title: 'Zu einem grünen Hoster wechseln', tip: 'Ihr Hosting-Anbieter ist nicht als erneuerbar betrieben verifiziert. Ein Wechsel zu einem verifizierten grünen Hoster (siehe Green-Web-Foundation-Verzeichnis) senkt den Rechenzentrumsanteil jedes Seitenaufrufs.' },
};

/**
 * Build the ranked recommendation list for an audit result.
 * Each entry: { id, title, tip, savingsBytes, savingsGramsPerView } (localised).
 */
export function buildRecommendations(audit, lang = 'en') {
  const out = [];
  for (const opp of audit.opportunities || []) {
    const text = REC_TEXTS[opp.id]?.[lang] || { title: opp.title, tip: '' };
    out.push({
      id: opp.id,
      title: text.title,
      tip: text.tip,
      savingsBytes: opp.savingsBytes,
      savingsGramsPerView: savingsPerView(opp.savingsBytes, { greenHost: audit.greenHost?.green === true }),
    });
  }
  if (audit.greenHost && audit.greenHost.green === false) {
    out.push({ id: 'green-host', ...GREEN_HOST_REC[lang], savingsBytes: 0, savingsGramsPerView: null });
  }
  return out;
}
