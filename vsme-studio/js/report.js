// ============================================================================
// Report generator — pure function, no DOM access (also runs in Node tests).
// Produces the HTML for the final A4 report; print.css turns it into a
// polished PDF via the browser's "Save as PDF".
// ============================================================================

import { SCHEMA, isVisible } from './schema.js';
import { computeB3, accidentRate, fmt } from './calc.js';
import { t } from './i18n.js';

export function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const filled = (v) => v !== undefined && v !== null && String(v).trim() !== '';

function displayValue(field, data, lang) {
  const raw = data[field.id];
  if (field.type === 'yesno') return t(lang, raw === 'yes' ? 'yes' : 'no');
  if (field.type === 'select') {
    const opt = (field.options || []).find((o) => o.value === raw);
    return opt ? opt[lang] || opt.en : esc(raw);
  }
  if (field.type === 'number') {
    const n = parseFloat(String(raw).replace(',', '.'));
    const numStr = Number.isFinite(n)
      ? n.toLocaleString(lang === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: 3 })
      : esc(raw);
    return field.unit ? `${numStr} ${esc(field.unit)}` : numStr;
  }
  if (field.type === 'textarea') return esc(raw).replaceAll('\n', '<br>');
  return esc(raw);
}

function kpiRow(label, value) {
  return `<tr><td>${esc(label)}</td><td class="kpi-value">${value}</td></tr>`;
}

function b3KpiTable(data, lang) {
  const r = computeB3(data);
  const unit = (v, u) => `${fmt(v, 1, lang)} ${u}`;
  return `
  <table class="kpi-table">
    <tbody>
      ${kpiRow(t(lang, 'totalEnergy'), unit(r.totalEnergyMwh, 'MWh'))}
      ${kpiRow(t(lang, 'renewableShare'), fmt(r.renewableShare * 100, 1, lang) + ' %')}
      ${kpiRow(t(lang, 'scope1'), unit(r.scope1T, 't CO₂e'))}
      ${kpiRow(t(lang, 'scope2'), unit(r.scope2T, 't CO₂e'))}
      ${kpiRow(t(lang, 'totalGhg'), unit(r.totalT, 't CO₂e'))}
      ${r.intensityPerMEur != null
        ? kpiRow(t(lang, 'intensity'), `${fmt(r.intensityPerMEur, 2, lang)} ${t(lang, 'perMEur')}`)
        : ''}
    </tbody>
  </table>`;
}

function methodologyNote(data, lang) {
  const r = computeB3(data);
  const f = r.factors;
  const de = lang === 'de';
  const factorList =
    `${de ? 'Strom' : 'Electricity'}: ${fmt(f.electricity, 3, lang)}; ` +
    `${de ? 'Erdgas' : 'Natural gas'}: ${fmt(f.naturalGas, 3, lang)}; ` +
    `${de ? 'Fernwärme' : 'District heating'}: ${fmt(f.districtHeating, 3, lang)} kg CO₂e/kWh; ` +
    `${de ? 'Heizöl' : 'Heating oil'}: ${fmt(f.heatingOil, 2, lang)}; ` +
    `Diesel: ${fmt(f.diesel, 2, lang)}; ` +
    `${de ? 'Benzin' : 'Petrol'}: ${fmt(f.petrol, 2, lang)}; ` +
    `LPG: ${fmt(f.lpg, 2, lang)} kg CO₂e/L`;
  const text = de
    ? `Scope-1-Emissionen umfassen die direkte Verbrennung von Brenn- und Kraftstoffen. Scope-2-Emissionen umfassen eingekauften Strom und Fernwärme (standortbasiert); zertifiziert erneuerbarer Strom wird mit 0 kg CO₂e/kWh angesetzt (marktbasierte Konvention). Verwendete Emissionsfaktoren: ${factorList}. Die Faktoren basieren auf gängigen veröffentlichten Durchschnittswerten und können im Werkzeug überschrieben werden.`
    : `Scope 1 covers direct combustion of fuels. Scope 2 covers purchased electricity and district heating (location-based); certified renewable electricity is accounted at 0 kg CO₂e/kWh (market-based convention). Emission factors used: ${factorList}. Factors are common published averages and can be overridden in the tool.`;
  return `<div class="method-note"><h4>${de ? 'Methodik (B3)' : 'Methodology (B3)'}</h4><p>${text}</p></div>`;
}

function disclaimer(lang) {
  return lang === 'de'
    ? 'Dieser Bericht wurde mit VSME Report Studio in Anlehnung an das Basismodul des VSME-Standards (EFRAG, Dezember 2024) erstellt. Er dient der Unterstützung der freiwilligen Nachhaltigkeitsberichterstattung und stellt keine Rechts- oder Prüfungsleistung dar. Die inhaltliche Verantwortung liegt beim berichtenden Unternehmen.'
    : 'This report was prepared with VSME Report Studio, following the Basic Module of the VSME standard (EFRAG, December 2024). It supports voluntary sustainability reporting and does not constitute legal advice or an audit. Responsibility for the content rests with the reporting undertaking.';
}

/**
 * Build the full report HTML.
 * @param {object} data questionnaire answers
 * @param {'en'|'de'} lang
 * @param {{watermark?: boolean, generatedOn?: string}} opts
 */
export function buildReportHTML(data, lang = 'en', opts = {}) {
  const company = filled(data.b1_company_name) ? esc(data.b1_company_name) : '—';
  const year = filled(data.b1_reporting_year) ? esc(data.b1_reporting_year) : '';
  const wm = opts.watermark
    ? `<div class="watermark" aria-hidden="true">${t(lang, 'previewWatermark')}</div>`
    : '';

  const sections = SCHEMA.map((section) => {
    const rows = section.fields
      .filter((f) => isVisible(f, data) && filled(data[f.id]))
      .map(
        (f) =>
          `<tr><th>${esc(f.label[lang] || f.label.en)}</th><td>${displayValue(f, data, lang)}</td></tr>`
      )
      .join('');

    let extras = '';
    if (section.id === 'b3') {
      extras = `<h4 class="kpi-heading">${t(lang, 'computedTitle').replace(' (live)', '')}</h4>` +
        b3KpiTable(data, lang) + methodologyNote(data, lang);
    }
    if (section.id === 'b9') {
      const rate = accidentRate(data.b9_accidents, data.b9_hours_worked);
      if (rate != null) {
        extras = `<table class="kpi-table"><tbody>${kpiRow(t(lang, 'accidentRate'), fmt(rate, 2, lang))}</tbody></table>`;
      }
    }

    if (!rows && !extras) return '';
    return `
    <section class="report-section">
      <h3><span class="code">${section.code}</span> ${esc(section.title[lang] || section.title.en)}</h3>
      ${rows ? `<table class="data-table"><tbody>${rows}</tbody></table>` : ''}
      ${extras}
    </section>`;
  }).join('');

  return `
  <div class="report${opts.watermark ? ' report--watermarked' : ''}" lang="${lang}">
    ${wm}
    <div class="report-cover">
      <p class="cover-kicker">${t(lang, 'reportSubtitle')}</p>
      <h1>${t(lang, 'reportTitle')}</h1>
      <h2>${company}</h2>
      ${year ? `<p class="cover-year">${year}</p>` : ''}
    </div>
    ${sections}
    <footer class="report-footer"><p>${disclaimer(lang)}</p>
    ${opts.generatedOn ? `<p class="generated-on">${esc(opts.generatedOn)}</p>` : ''}</footer>
  </div>`;
}
