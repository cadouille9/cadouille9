// ============================================================================
// White-label report generator — pure function (unit-tested in Node).
// print.css turns the returned HTML into a clean A4 PDF.
// ============================================================================

import { co2PerView, rating, cleanerThan, annualImpact, fmtGrams, fmtBytes, fmtNum } from './co2.js';
import { buildRecommendations } from './recs.js';
import { t } from './i18n.js';

export function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const TYPE_LABELS = {
  Document: { en: 'HTML documents', de: 'HTML-Dokumente' },
  Script: { en: 'JavaScript', de: 'JavaScript' },
  Stylesheet: { en: 'CSS', de: 'CSS' },
  Image: { en: 'Images', de: 'Bilder' },
  Media: { en: 'Video & audio', de: 'Video & Audio' },
  Font: { en: 'Fonts', de: 'Schriften' },
  XHR: { en: 'Data requests', de: 'Datenabrufe' },
  Fetch: { en: 'Data requests', de: 'Datenabrufe' },
  Other: { en: 'Other', de: 'Sonstiges' },
};

export function typeLabel(type, lang) {
  return TYPE_LABELS[type]?.[lang] || TYPE_LABELS[type]?.en || type;
}

function breakdownRows(audit, lang) {
  const entries = Object.entries(audit.breakdown || {})
    .filter(([, bytes]) => bytes > 0)
    .sort((a, b) => b[1] - a[1]);
  const total = audit.totalBytes || 1;
  return entries
    .map(([type, bytes]) => {
      const pct = (bytes / total) * 100;
      return `<tr>
        <th>${esc(typeLabel(type, lang))}</th>
        <td class="num">${fmtBytes(bytes, lang)}</td>
        <td class="bar-cell"><span class="bar" style="width:${Math.max(1, pct).toFixed(1)}%"></span> ${fmtNum(pct, lang, 0)}%</td>
      </tr>`;
    })
    .join('');
}

/**
 * Build the report HTML.
 * @param {object} audit   result of runAudit() (url, totalBytes, breakdown, perfScore, opportunities, greenHost)
 * @param {object} opts    { lang, watermark, monthlyViews, branding: {name, logoDataUrl, client}, generatedOn }
 */
export function buildReportHTML(audit, opts = {}) {
  const lang = opts.lang || 'en';
  const green = audit.greenHost?.green === true;
  const co2 = co2PerView(audit.totalBytes, { greenHost: green });
  const grade = rating(co2.grams);
  const cleaner = Math.round(cleanerThan(co2.grams) * 100);
  const recs = buildRecommendations(audit, lang);
  const annual = opts.monthlyViews ? annualImpact(co2.grams, opts.monthlyViews) : null;
  const brand = opts.branding || {};

  const wm = opts.watermark ? `<div class="watermark" aria-hidden="true">${t(lang, 'watermark')}</div>` : '';
  const logo = brand.logoDataUrl && brand.logoDataUrl.startsWith('data:image/')
    ? `<img class="brand-logo" src="${brand.logoDataUrl}" alt="">`
    : '';

  const greenLine =
    audit.greenHost?.green === true ? t(lang, 'greenYes')
    : audit.greenHost?.green === false ? t(lang, 'greenNo')
    : t(lang, 'greenUnknown');

  const recsHtml = recs.length
    ? `<ol class="recs">${recs
        .map(
          (r) => `<li>
            <strong>${esc(r.title)}</strong>
            ${r.savingsGramsPerView != null && r.savingsGramsPerView > 0
              ? `<span class="saves">${t(lang, 'recSaves', { g: fmtGrams(r.savingsGramsPerView, lang) })}</span>` : ''}
            <p>${esc(r.tip)}</p>
          </li>`
        )
        .join('')}</ol>`
    : `<p class="no-recs">${t(lang, 'noRecs')}</p>`;

  return `
  <div class="report${opts.watermark ? ' report--watermarked' : ''}" lang="${lang}">
    ${wm}
    <header class="report-head">
      <div>
        ${logo}
        ${brand.name ? `<p class="prepared-by">${t(lang, 'preparedBy')}: <strong>${esc(brand.name)}</strong></p>` : ''}
      </div>
      <div class="head-right">
        ${opts.generatedOn ? `<p>${t(lang, 'reportDate')}: ${esc(opts.generatedOn)}</p>` : ''}
        ${brand.client ? `<p>${esc(brand.client)}</p>` : ''}
      </div>
    </header>

    <h1>${t(lang, 'reportTitle')}</h1>
    <p class="report-url">${esc(audit.finalUrl || audit.url || '')}</p>

    <div class="score-hero">
      <div class="grade grade-${grade.replace('+', 'plus')}">${grade}</div>
      <div class="score-numbers">
        <p class="grams">${fmtGrams(co2.grams, lang)} <span>${t(lang, 'perView')}</span></p>
        <p class="cleaner">${t(lang, 'cleanerThan', { pct: cleaner })}</p>
      </div>
    </div>

    <table class="facts">
      <tbody>
        <tr><th>${t(lang, 'pageWeight')}</th><td>${fmtBytes(audit.totalBytes, lang)}</td></tr>
        ${audit.perfScore != null ? `<tr><th>${t(lang, 'perfScore')}</th><td>${Math.round(audit.perfScore * 100)}/100</td></tr>` : ''}
        <tr><th>${t(lang, 'greenHosting')}</th><td>${greenLine}${audit.greenHost?.hostedBy ? ` — ${esc(audit.greenHost.hostedBy)}` : ''}</td></tr>
      </tbody>
    </table>

    <section>
      <h2>${t(lang, 'breakdownTitle')}</h2>
      <table class="breakdown"><tbody>${breakdownRows(audit, lang)}</tbody></table>
    </section>

    ${annual ? `
    <section>
      <h2>${t(lang, 'annualTitle')}</h2>
      <table class="facts">
        <tbody>
          <tr><th>${t(lang, 'monthlyViews')}</th><td>${fmtNum(opts.monthlyViews, lang)}</td></tr>
          <tr><th>${t(lang, 'annualEmissions')}</th><td><strong>${fmtNum(annual.kgPerYear, lang, 1)} kg CO₂e</strong></td></tr>
          <tr><th>≈ ${t(lang, 'eqCar')}</th><td>${fmtNum(annual.kmByCar, lang)}</td></tr>
          <tr><th>≈ ${t(lang, 'eqTrees')}</th><td>${fmtNum(annual.trees, lang, 1)}</td></tr>
          <tr><th>≈ ${t(lang, 'eqPhone')}</th><td>${fmtNum(annual.phoneCharges, lang)}</td></tr>
        </tbody>
      </table>
    </section>` : ''}

    <section>
      <h2>${t(lang, 'recsTitle')}</h2>
      ${recsHtml}
    </section>

    <section class="method">
      <h2>${t(lang, 'methodTitle')}</h2>
      <p>${t(lang, 'methodText')}</p>
    </section>

    <footer class="report-footer"><p>${t(lang, 'disclaimer')}</p></footer>
  </div>`;
}
