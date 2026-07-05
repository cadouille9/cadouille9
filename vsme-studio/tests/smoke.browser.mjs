// ============================================================================
// End-to-end smoke test: drives the real app in headless Chromium.
//   node tests/smoke.browser.mjs
// Chromium is resolved from $PW_CHROMIUM, then common locations.
// Exits non-zero on the first failed assertion.
// ============================================================================

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
};

const CANDIDATES = [
  process.env.PW_CHROMIUM,
  '/opt/pw-browsers/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.log('SKIP: no Chromium found (set $PW_CHROMIUM). Unit tests still cover the logic.');
  process.exit(0);
}

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
    if (!file.startsWith(ROOT)) throw new Error('forbidden');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage();
page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); process.exitCode = 1; });

let step = '';
try {
  step = 'landing page loads';
  await page.goto(`${base}/index.html`);
  assert.match(await page.title(), /VSME Report Studio/);

  step = 'app loads with sidebar (11 sections + report)';
  await page.goto(`${base}/app.html`);
  await page.waitForSelector('#nav-sections .nav-item');
  assert.equal(await page.locator('#nav-sections .nav-item').count(), 12);

  step = 'force English UI for stable assertions';
  await page.click('#lang-en');

  step = 'B1: fill company name, autosave persists across reload';
  await page.fill('#f_b1_company_name', 'ACME Test GmbH');
  await page.fill('#f_b1_turnover_eur', '2000000');
  await page.waitForTimeout(500); // autosave debounce
  await page.reload();
  await page.waitForSelector('#f_b1_company_name');
  assert.equal(await page.inputValue('#f_b1_company_name'), 'ACME Test GmbH');

  step = 'B1: conditional field appears when omissions = yes';
  assert.equal(await page.locator('#f_b1_omissions_note').count(), 0);
  await page.check('input[data-field="b1_omissions"][value="yes"]');
  await page.waitForSelector('#f_b1_omissions_note');

  step = 'B3: live CO₂ computation';
  await page.click('#nav-sections .nav-item:nth-child(3)');
  await page.selectOption('#f_b3_grid_country', 'DE');
  await page.fill('#f_b3_electricity_nonrenewable_kwh', '50000');
  await page.fill('#f_b3_gas_kwh', '80000');
  const panel = page.locator('#computed-panel');
  await page.waitForFunction(() =>
    document.querySelector('#computed-panel')?.textContent.includes('35.2')
  );
  const panelText = await panel.textContent();
  assert.match(panelText, /16\.2/); // scope 1
  assert.match(panelText, /19\.0/); // scope 2

  step = 'report preview shows watermark when locked';
  await page.click('#nav-sections .nav-report');
  await page.waitForSelector('#report-container .report');
  assert.equal(await page.locator('.watermark').count(), 1);
  assert.match(await page.locator('.report-cover').textContent(), /ACME Test GmbH/);

  step = 'unlock with demo key removes watermark';
  await page.click('#btn-unlock');
  await page.fill('#unlock-input', 'VSME-DEMO-2026-0001');
  await page.click('#unlock-activate');
  await page.waitForSelector('.license-banner.ok', { timeout: 5000 });
  assert.equal(await page.locator('.watermark').count(), 0);

  step = 'invalid key is rejected (fresh profile)';
  const page2 = await (await browser.newContext()).newPage();
  await page2.goto(`${base}/app.html`);
  await page2.waitForSelector('#nav-sections .nav-item');
  await page2.click('#nav-sections .nav-report');
  await page2.click('#btn-unlock');
  await page2.fill('#unlock-input', 'VSME-WRONG-KEY-0000');
  await page2.click('#unlock-activate');
  await page2.waitForSelector('.unlock-msg.error');
  assert.equal(await page2.locator('.watermark').count(), 1);
  await page2.close();

  step = 'German UI renders';
  await page.click('#lang-de');
  await page.waitForFunction(() => document.documentElement.lang === 'de');
  assert.match(await page.locator('#report-container').textContent(), /Nachhaltigkeitsbericht/);

  console.log('✓ smoke test passed (all steps)');
} catch (err) {
  console.error(`✗ smoke test failed at step: ${step}`);
  console.error(err);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
