// ============================================================================
// CarbonLens UI — single page: analyse → results → white-label report.
// ============================================================================

import { CONFIG } from './config.js';
import { runAudit } from './api.js';
import { co2PerView, rating, cleanerThan, annualImpact, fmtGrams, fmtBytes, fmtNum } from './co2.js';
import { buildRecommendations } from './recs.js';
import { buildReportHTML, typeLabel } from './report.js';
import { loadMeta, saveMeta } from './store.js';
import { validateKey, isUnlocked, storeUnlock } from './license.js';
import { t } from './i18n.js';

let meta = loadMeta();
let lang = meta.lang === 'de' || meta.lang === 'en' ? meta.lang : (navigator.language || 'en').startsWith('de') ? 'de' : 'en';
let audit = null; // current result

const $ = (s) => document.querySelector(s);

// ---------------------------------------------------------------------------
// Analyse flow
// ---------------------------------------------------------------------------

let longTimer = null;

async function analyse() {
  const input = $('#url-input').value;
  const status = $('#analyse-status');
  const btn = $('#analyse-btn');
  status.className = 'status';
  $('#results').hidden = true;
  $('#report-section').hidden = true;

  btn.disabled = true;
  status.textContent = t(lang, 'analysing');
  clearTimeout(longTimer);
  longTimer = setTimeout(() => { status.textContent = t(lang, 'analysingLong'); }, 20000);

  try {
    audit = await runAudit(input);
    status.textContent = '';
    renderResults();
  } catch (err) {
    const key = err.message === 'bad_url' ? 'errBadUrl' : err.message === 'psi_quota' ? 'errQuota' : 'errFailed';
    status.className = 'status error';
    status.textContent = t(lang, key);
    if (key === 'errQuota' && !CONFIG.psiApiKey) {
      status.textContent += ' ' + t(lang, 'errQuotaOperator');
    }
  } finally {
    clearTimeout(longTimer);
    btn.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Results rendering
// ---------------------------------------------------------------------------

function renderResults() {
  if (!audit) return;
  const green = audit.greenHost?.green === true;
  const co2 = co2PerView(audit.totalBytes, { greenHost: green });
  const grade = rating(co2.grams);
  const cleaner = Math.round(cleanerThan(co2.grams) * 100);
  const recs = buildRecommendations(audit, lang);

  const greenLine =
    audit.greenHost?.green === true ? `✅ ${t(lang, 'greenYes')}`
    : audit.greenHost?.green === false ? `❌ ${t(lang, 'greenNo')}`
    : `❔ ${t(lang, 'greenUnknown')}`;

  const breakdown = Object.entries(audit.breakdown || {})
    .filter(([, b]) => b > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([type, bytes]) => {
      const pct = (bytes / (audit.totalBytes || 1)) * 100;
      return `<tr><th>${typeLabel(type, lang)}</th>
        <td class="num">${fmtBytes(bytes, lang)}</td>
        <td class="bar-cell"><span class="bar" style="width:${Math.max(1, pct).toFixed(1)}%"></span> ${fmtNum(pct, lang, 0)}%</td></tr>`;
    })
    .join('');

  const recsHtml = recs.length
    ? `<ol class="recs">${recs.map((r) => `<li>
        <strong>${r.title}</strong>
        ${r.savingsGramsPerView ? `<span class="saves">${t(lang, 'recSaves', { g: fmtGrams(r.savingsGramsPerView, lang) })}</span>` : ''}
        <p>${r.tip}</p></li>`).join('')}</ol>`
    : `<p class="no-recs">${t(lang, 'noRecs')}</p>`;

  $('#results').innerHTML = `
    <p class="results-for">${t(lang, 'resultsFor')} <strong>${audit.finalUrl || audit.url}</strong></p>
    <div class="score-hero">
      <div class="grade grade-${grade.replace('+', 'plus')}">${grade}</div>
      <div class="score-numbers">
        <p class="grams">${fmtGrams(co2.grams, lang)} <span>${t(lang, 'perView')}</span></p>
        <p class="cleaner">${t(lang, 'cleanerThan', { pct: cleaner })}</p>
      </div>
    </div>
    <div class="facts-grid">
      <div class="fact"><span>${t(lang, 'pageWeight')}</span><strong>${fmtBytes(audit.totalBytes, lang)}</strong></div>
      ${audit.perfScore != null ? `<div class="fact"><span>${t(lang, 'perfScore')}</span><strong>${Math.round(audit.perfScore * 100)}/100</strong></div>` : ''}
      <div class="fact"><span>${t(lang, 'greenHosting')}</span><strong>${greenLine}</strong>${audit.greenHost?.hostedBy ? `<em>${t(lang, 'hostedBy')}: ${audit.greenHost.hostedBy}</em>` : ''}</div>
    </div>

    <h3>${t(lang, 'breakdownTitle')}</h3>
    <table class="breakdown"><tbody>${breakdown}</tbody></table>

    <h3>${t(lang, 'annualTitle')}</h3>
    <div class="annual-row">
      <label>${t(lang, 'monthlyViews')}
        <input type="number" id="monthly-views" min="0" step="any" inputmode="numeric" value="${meta.monthlyViews || 10000}">
      </label>
      <div id="annual-out"></div>
    </div>

    <h3>${t(lang, 'recsTitle')}</h3>
    ${recsHtml}

    <div class="report-cta">
      <button type="button" class="btn primary" id="report-btn">📄 ${t(lang, 'reportBtn')}</button>
    </div>`;

  $('#results').hidden = false;
  $('#monthly-views').addEventListener('input', () => {
    meta = loadMeta();
    meta.monthlyViews = $('#monthly-views').value;
    saveMeta(meta);
    renderAnnual();
    if (!$('#report-section').hidden) renderReport();
  });
  $('#report-btn').addEventListener('click', () => {
    renderReport();
    $('#report-section').hidden = false;
    $('#report-section').scrollIntoView({ behavior: 'smooth' });
  });
  renderAnnual();
}

function renderAnnual() {
  const green = audit.greenHost?.green === true;
  const co2 = co2PerView(audit.totalBytes, { greenHost: green });
  const a = annualImpact(co2.grams, $('#monthly-views')?.value);
  $('#annual-out').innerHTML = a
    ? `<div class="eq"><strong>${fmtNum(a.kgPerYear, lang, 1)} kg CO₂e</strong> ${t(lang, 'annualEmissions').toLowerCase()} ·
       ≈ ${fmtNum(a.kmByCar, lang)} ${t(lang, 'eqCar')} ·
       ≈ ${fmtNum(a.trees, lang, 1)} ${t(lang, 'eqTrees')} ·
       ≈ ${fmtNum(a.phoneCharges, lang)} ${t(lang, 'eqPhone')}</div>`
    : '';
}

// ---------------------------------------------------------------------------
// Report + branding + license
// ---------------------------------------------------------------------------

function renderReport() {
  const unlocked = isUnlocked();
  const generatedOn = new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const banner = unlocked
    ? `<div class="license-banner ok">✓ ${t(lang, 'unlockedBadge')}</div>`
    : `<div class="license-banner locked">
        <p>${t(lang, 'lockedBanner')}</p>
        <div class="banner-actions">
          ${CONFIG.purchaseUrl ? `<a class="btn secondary" href="${CONFIG.purchaseUrl}" target="_blank" rel="noopener">${t(lang, 'buyKey')} (${CONFIG.price})</a>` : ''}
          <button type="button" class="btn primary" id="btn-unlock">${t(lang, 'unlockCta')}</button>
        </div>
      </div>`;

  const brandingEditor = unlocked
    ? `<div class="branding no-print">
        <h4>${t(lang, 'brandingTitle')}</h4>
        <div class="branding-grid">
          <label>${t(lang, 'brandName')}<input type="text" id="brand-name" value="${(meta.branding?.name || '').replaceAll('"', '&quot;')}"></label>
          <label>${t(lang, 'preparedFor')}<input type="text" id="brand-client" value="${(meta.branding?.client || '').replaceAll('"', '&quot;')}"></label>
          <label>${t(lang, 'brandLogo')}<input type="file" id="brand-logo" accept="image/png,image/jpeg,image/svg+xml"></label>
          ${meta.branding?.logoDataUrl ? `<button type="button" class="btn secondary" id="brand-logo-remove">${t(lang, 'brandRemoveLogo')}</button>` : ''}
        </div>
      </div>`
    : '';

  $('#report-section').innerHTML = `
    <div class="report-toolbar no-print">
      ${banner}
      <button type="button" class="btn primary" id="btn-print">🖨 ${t(lang, 'reportBtn')}</button>
      <p class="hint">${t(lang, 'printHint')}</p>
      ${brandingEditor}
    </div>
    <div id="report-container">${buildReportHTML(audit, {
      lang,
      watermark: !unlocked,
      monthlyViews: $('#monthly-views')?.value,
      branding: unlocked ? meta.branding : null,
      generatedOn,
    })}</div>`;

  $('#btn-print').addEventListener('click', () => window.print());
  $('#btn-unlock')?.addEventListener('click', openUnlockDialog);
  $('#brand-name')?.addEventListener('input', (e) => setBranding({ name: e.target.value }));
  $('#brand-client')?.addEventListener('input', (e) => setBranding({ client: e.target.value }));
  $('#brand-logo')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 300 * 1024) { alert('≤ 300 KB'); return; }
    const reader = new FileReader();
    reader.onload = () => setBranding({ logoDataUrl: String(reader.result) }, true);
    reader.readAsDataURL(file);
  });
  $('#brand-logo-remove')?.addEventListener('click', () => setBranding({ logoDataUrl: '' }, true));
}

let brandTimer = null;
function setBranding(patch, rerender = false) {
  // Re-read before writing: license.js also writes meta (unlock flag), and
  // saving a stale copy would silently wipe it.
  meta = loadMeta();
  meta.branding = { ...(meta.branding || {}), ...patch };
  saveMeta(meta);
  if (rerender) { renderReport(); return; }
  clearTimeout(brandTimer);
  brandTimer = setTimeout(() => {
    const el = $('#report-container');
    if (el) el.innerHTML = buildReportHTML(audit, {
      lang, watermark: !isUnlocked(), monthlyViews: $('#monthly-views')?.value,
      branding: isUnlocked() ? meta.branding : null,
    });
  }, 400);
}

function openUnlockDialog() {
  const dlg = $('#unlock-dialog');
  $('#unlock-title').textContent = t(lang, 'enterKey');
  $('#unlock-input').placeholder = t(lang, 'keyPlaceholder');
  $('#unlock-msg').textContent = '';
  $('#unlock-activate').textContent = t(lang, 'activate');
  $('#unlock-cancel').textContent = t(lang, 'cancel');
  const buy = $('#unlock-buy');
  if (CONFIG.purchaseUrl) {
    buy.href = CONFIG.purchaseUrl;
    buy.textContent = `${t(lang, 'buyKey')} (${CONFIG.price})`;
    buy.style.display = '';
  } else buy.style.display = 'none';
  dlg.showModal();
  $('#unlock-input').focus();
}

async function activateKey() {
  const msg = $('#unlock-msg');
  const btn = $('#unlock-activate');
  btn.disabled = true;
  msg.className = 'unlock-msg';
  msg.textContent = '…';
  const result = await validateKey($('#unlock-input').value);
  btn.disabled = false;
  if (result.ok) {
    storeUnlock($('#unlock-input').value);
    meta = loadMeta(); // pick up the unlock flag license.js just wrote
    msg.className = 'unlock-msg ok';
    msg.textContent = t(lang, 'unlockSuccess');
    setTimeout(() => { $('#unlock-dialog').close(); renderReport(); }, 900);
  } else {
    msg.className = 'unlock-msg error';
    msg.textContent = t(lang, result.reason === 'network' ? 'unlockNetwork' : result.reason === 'refunded' ? 'unlockRefunded' : 'unlockInvalid');
  }
}

// ---------------------------------------------------------------------------
// Chrome / init
// ---------------------------------------------------------------------------

function setLang(next) {
  lang = next;
  meta = loadMeta();
  meta.lang = next;
  saveMeta(meta);
  renderChrome();
  if (audit) {
    renderResults();
    if (!$('#report-section').hidden) renderReport();
  }
}

function renderChrome() {
  document.documentElement.lang = lang;
  document.body.classList.toggle('lang-de', lang === 'de');
  $('#tagline').textContent = t(lang, 'tagline');
  $('#sub').textContent = t(lang, 'sub');
  $('#url-input').placeholder = t(lang, 'inputPlaceholder');
  $('#analyse-btn').textContent = t(lang, 'analyse');
  $('#footer-privacy').textContent = t(lang, 'footerPrivacy');
  $('#lang-en').classList.toggle('active', lang === 'en');
  $('#lang-de').classList.toggle('active', lang === 'de');
  const support = $('#support-note');
  if (CONFIG.supportEmail) {
    support.innerHTML = `${t(lang, 'supportLabel')} <a href="mailto:${CONFIG.supportEmail}">${CONFIG.supportEmail}</a>`;
  }
}

function init() {
  $('#lang-en').addEventListener('click', () => setLang('en'));
  $('#lang-de').addEventListener('click', () => setLang('de'));
  $('#analyse-btn').addEventListener('click', analyse);
  $('#url-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); analyse(); }
  });
  $('#unlock-activate').addEventListener('click', activateKey);
  $('#unlock-cancel').addEventListener('click', () => $('#unlock-dialog').close());
  $('#unlock-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); activateKey(); }
  });
  renderChrome();
}

init();
