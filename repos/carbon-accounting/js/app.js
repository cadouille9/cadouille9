// ============================================================================
// Wizard UI — renders the questionnaire, autosaves, previews the report.
// ============================================================================

import { CONFIG } from './config.js';
import { SCHEMA, isVisible, completion } from './schema.js';
import { computeB3, accidentRate, fmt } from './calc.js';
import { loadData, saveData, loadMeta, saveMeta, clearAll, exportJson, importJson } from './store.js';
import { validateKey, isUnlocked, storeUnlock } from './license.js';
import { buildReportHTML } from './report.js';
import { t } from './i18n.js';

let data = loadData();
let meta = loadMeta();
let lang = meta.lang === 'de' || meta.lang === 'en' ? meta.lang : (navigator.language || 'en').startsWith('de') ? 'de' : 'en';
let stepIndex = 0; // 0..SCHEMA.length-1 = sections, SCHEMA.length = report
const REPORT_STEP = SCHEMA.length;

const $ = (sel) => document.querySelector(sel);

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveData(data);
    updateProgress();
    const el = $('#save-indicator');
    if (el) {
      el.textContent = '✓ ' + t(lang, 'autosaved');
      el.classList.add('visible');
      setTimeout(() => el.classList.remove('visible'), 2000);
    }
  }, 300);
}

// ---------------------------------------------------------------------------
// Sidebar + progress
// ---------------------------------------------------------------------------

function renderSidebar() {
  const nav = $('#nav-sections');
  nav.innerHTML = '';
  SCHEMA.forEach((section, i) => {
    const done = section.fields.some((f) => {
      const v = data[f.id];
      return v !== undefined && String(v).trim() !== '';
    });
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-item' + (i === stepIndex ? ' active' : '') + (done ? ' touched' : '');
    btn.innerHTML = `<span class="nav-code">${section.code}</span><span>${section.title[lang]}</span>`;
    btn.addEventListener('click', () => goTo(i));
    nav.appendChild(btn);
  });
  const reportBtn = document.createElement('button');
  reportBtn.type = 'button';
  reportBtn.className = 'nav-item nav-report' + (stepIndex === REPORT_STEP ? ' active' : '');
  reportBtn.innerHTML = `<span class="nav-code">📄</span><span>${t(lang, 'navReport')}</span>`;
  reportBtn.addEventListener('click', () => goTo(REPORT_STEP));
  nav.appendChild(reportBtn);
}

function updateProgress() {
  const pct = Math.round(completion(data) * 100);
  $('#progress-fill').style.width = pct + '%';
  $('#progress-label').textContent = `${pct}% ${t(lang, 'progress')}`;
}

// ---------------------------------------------------------------------------
// Form rendering
// ---------------------------------------------------------------------------

function fieldControl(field) {
  const value = data[field.id] ?? '';
  const id = 'f_' + field.id;
  if (field.type === 'textarea') {
    return `<textarea id="${id}" data-field="${field.id}" rows="3">${escAttr(value)}</textarea>`;
  }
  if (field.type === 'select') {
    const opts = [`<option value="">${t(lang, 'select')}</option>`]
      .concat(
        (field.options || []).map(
          (o) => `<option value="${o.value}" ${value === o.value ? 'selected' : ''}>${o[lang] || o.en}</option>`
        )
      )
      .join('');
    return `<select id="${id}" data-field="${field.id}">${opts}</select>`;
  }
  if (field.type === 'yesno') {
    return `
      <div class="yesno" role="radiogroup">
        <label class="pill"><input type="radio" name="${id}" data-field="${field.id}" value="yes" ${value === 'yes' ? 'checked' : ''}><span>${t(lang, 'yes')}</span></label>
        <label class="pill"><input type="radio" name="${id}" data-field="${field.id}" value="no" ${value === 'no' ? 'checked' : ''}><span>${t(lang, 'no')}</span></label>
      </div>`;
  }
  const type = field.type === 'number' ? 'number' : 'text';
  const unit = field.unit ? `<span class="unit">${field.unit}</span>` : '';
  return `<div class="input-row"><input type="${type}" ${type === 'number' ? 'step="any" min="0" inputmode="decimal"' : ''} id="${id}" data-field="${field.id}" value="${escAttr(value)}">${unit}</div>`;
}

function escAttr(s) {
  return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
}

function renderComputedPanel(section) {
  if (section.id === 'b3') {
    const r = computeB3(data);
    const rows = [
      [t(lang, 'totalEnergy'), `${fmt(r.totalEnergyMwh, 1, lang)} MWh`],
      [t(lang, 'renewableShare'), `${fmt(r.renewableShare * 100, 1, lang)} %`],
      [t(lang, 'scope1'), `${fmt(r.scope1T, 1, lang)} t CO₂e`],
      [t(lang, 'scope2'), `${fmt(r.scope2T, 1, lang)} t CO₂e`],
      [t(lang, 'totalGhg'), `${fmt(r.totalT, 1, lang)} t CO₂e`],
    ];
    if (r.intensityPerMEur != null) rows.push([t(lang, 'intensity'), `${fmt(r.intensityPerMEur, 2, lang)} ${t(lang, 'perMEur')}`]);
    return computedBox(rows);
  }
  if (section.id === 'b9') {
    const rate = accidentRate(data.b9_accidents, data.b9_hours_worked);
    if (rate == null) return '';
    return computedBox([[t(lang, 'accidentRate'), fmt(rate, 2, lang)]]);
  }
  return '';
}

function computedBox(rows) {
  return `
  <aside class="computed-panel" id="computed-panel">
    <h4>${t(lang, 'computedTitle')}</h4>
    <table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
  </aside>`;
}

function renderSection() {
  const section = SCHEMA[stepIndex];
  const main = $('#main');
  const fieldsHtml = section.fields
    .filter((f) => isVisible(f, data))
    .map(
      (f) => `
      <div class="field">
        <label for="f_${f.id}">${f.label[lang]}</label>
        ${f.help ? `<p class="help">${f.help[lang]}</p>` : ''}
        ${fieldControl(f)}
      </div>`
    )
    .join('');

  main.innerHTML = `
    <div class="section-form">
      <header class="section-header">
        <span class="section-code">${section.code}</span>
        <h2>${section.title[lang]}</h2>
        <p class="section-intro">${section.intro[lang]}</p>
      </header>
      ${fieldsHtml}
      ${renderComputedPanel(section)}
      <div class="step-buttons">
        ${stepIndex > 0 ? `<button type="button" class="btn secondary" id="btn-prev">${t(lang, 'prev')}</button>` : '<span></span>'}
        <button type="button" class="btn primary" id="btn-next">${stepIndex === SCHEMA.length - 1 ? t(lang, 'toReport') : t(lang, 'next')}</button>
      </div>
    </div>`;

  main.querySelectorAll('[data-field]').forEach((el) => {
    const fieldId = el.dataset.field;
    const field = section.fields.find((f) => f.id === fieldId);
    const rerenders = section.fields.some((f) => f.showIf?.field === fieldId);
    const onInput = () => {
      data[fieldId] = el.type === 'radio' ? el.value : el.value;
      scheduleSave();
      if (section.id === 'b3' || section.id === 'b9') refreshComputed(section);
    };
    if (field.type === 'yesno' || field.type === 'select') {
      el.addEventListener('change', () => {
        data[fieldId] = el.value;
        scheduleSave();
        if (rerenders) renderSection();
        else if (section.id === 'b3' || section.id === 'b9') refreshComputed(section);
      });
    } else {
      el.addEventListener('input', onInput);
    }
  });

  $('#btn-prev')?.addEventListener('click', () => goTo(stepIndex - 1));
  $('#btn-next')?.addEventListener('click', () => goTo(stepIndex + 1));
  window.scrollTo({ top: 0 });
}

function refreshComputed(section) {
  const panel = $('#computed-panel');
  if (!panel) return;
  const html = renderComputedPanel(section);
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  panel.replaceWith(tmp.firstElementChild || panel);
}

// ---------------------------------------------------------------------------
// Report step
// ---------------------------------------------------------------------------

function renderReport() {
  const main = $('#main');
  const unlocked = isUnlocked();
  const generatedOn = new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const banner = unlocked
    ? `<div class="license-banner ok">✓ ${t(lang, 'unlockedBadge')}</div>`
    : `
    <div class="license-banner locked">
      <p>${t(lang, 'lockedBanner')}</p>
      <div class="banner-actions">
        ${CONFIG.purchaseUrl ? `<a class="btn secondary" href="${CONFIG.purchaseUrl}" target="_blank" rel="noopener">${t(lang, 'buyKey')} (${CONFIG.price})</a>` : ''}
        <button type="button" class="btn primary" id="btn-unlock">${t(lang, 'unlockCta')}</button>
      </div>
    </div>`;

  main.innerHTML = `
    <div class="report-toolbar no-print">
      ${banner}
      <button type="button" class="btn primary" id="btn-print">🖨 ${t(lang, 'downloadPdf')}</button>
      <p class="hint">${t(lang, 'printHint')}</p>
    </div>
    <div id="report-container">${buildReportHTML(data, lang, { watermark: !unlocked, generatedOn })}</div>`;

  $('#btn-print').addEventListener('click', () => window.print());
  $('#btn-unlock')?.addEventListener('click', openUnlockDialog);
  window.scrollTo({ top: 0 });
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
  } else {
    buy.style.display = 'none';
  }
  dlg.showModal();
  $('#unlock-input').focus();
}

async function activateKey() {
  const input = $('#unlock-input');
  const msg = $('#unlock-msg');
  const btn = $('#unlock-activate');
  btn.disabled = true;
  msg.className = 'unlock-msg';
  msg.textContent = '…';
  const result = await validateKey(input.value);
  btn.disabled = false;
  if (result.ok) {
    storeUnlock(input.value);
    msg.className = 'unlock-msg ok';
    msg.textContent = t(lang, 'unlockSuccess');
    setTimeout(() => {
      $('#unlock-dialog').close();
      renderReport();
    }, 900);
  } else {
    msg.className = 'unlock-msg error';
    msg.textContent = t(
      lang,
      result.reason === 'network' ? 'unlockNetwork' : result.reason === 'refunded' ? 'unlockRefunded' : 'unlockInvalid'
    );
  }
}

// ---------------------------------------------------------------------------
// Toolbar: language, backup, reset
// ---------------------------------------------------------------------------

function setLang(next) {
  lang = next;
  // Re-read before writing: license.js also writes meta (unlock flag), and
  // saving a stale copy would silently wipe it.
  meta = loadMeta();
  meta.lang = next;
  saveMeta(meta);
  renderChrome();
  render();
}

function downloadBackup() {
  const blob = new Blob([exportJson(data)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vsme-report-data.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function restoreBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      data = importJson(String(reader.result));
      saveData(data);
      render();
      updateProgress();
    } catch {
      alert(t(lang, 'importError'));
    }
  };
  reader.readAsText(file);
}

function renderChrome() {
  document.documentElement.lang = lang;
  $('#tagline').textContent = t(lang, 'appTagline');
  $('#privacy-note').textContent = '🔒 ' + t(lang, 'privacy');
  $('#btn-export').textContent = '⬇ ' + t(lang, 'exportJson');
  $('#btn-import-label').textContent = '⬆ ' + t(lang, 'importJson');
  $('#btn-reset').textContent = '🗑 ' + t(lang, 'resetAll');
  $('#lang-en').classList.toggle('active', lang === 'en');
  $('#lang-de').classList.toggle('active', lang === 'de');
  const support = $('#support-note');
  if (CONFIG.supportEmail) {
    support.innerHTML = `${t(lang, 'supportLabel')} <a href="mailto:${CONFIG.supportEmail}">${CONFIG.supportEmail}</a>`;
  }
}

// ---------------------------------------------------------------------------

function goTo(i) {
  stepIndex = Math.max(0, Math.min(REPORT_STEP, i));
  render();
}

function render() {
  renderSidebar();
  if (stepIndex === REPORT_STEP) renderReport();
  else renderSection();
}

function init() {
  $('#lang-en').addEventListener('click', () => setLang('en'));
  $('#lang-de').addEventListener('click', () => setLang('de'));
  $('#btn-export').addEventListener('click', downloadBackup);
  $('#btn-import').addEventListener('change', (e) => {
    if (e.target.files[0]) restoreBackup(e.target.files[0]);
    e.target.value = '';
  });
  $('#btn-reset').addEventListener('click', () => {
    if (confirm(t(lang, 'resetConfirm'))) {
      clearAll();
      data = {};
      goTo(0);
      updateProgress();
    }
  });
  $('#unlock-activate').addEventListener('click', activateKey);
  $('#unlock-cancel').addEventListener('click', () => $('#unlock-dialog').close());
  $('#unlock-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      activateKey();
    }
  });

  renderChrome();
  updateProgress();
  render();
}

init();
