// ============================================================================
// End-to-end smoke test in headless Chromium. External APIs (PageSpeed
// Insights, greencheck) are stubbed with local fixtures so the test is
// deterministic and offline.
//   node tests/smoke.browser.mjs
// ============================================================================

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };

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
    const pathname = new URL(req.url, 'http://x').pathname;
    let file;
    if (pathname.startsWith('/stub/quota')) { res.writeHead(429); res.end('{}'); return; }
    if (pathname.startsWith('/stub/psi')) file = path.join(ROOT, 'tests/fixtures/psi.json');
    else if (pathname.startsWith('/stub/green')) file = path.join(ROOT, 'tests/fixtures/green.json');
    else file = path.join(ROOT, pathname === '/' ? 'index.html' : decodeURIComponent(pathname));
    if (!file.startsWith(ROOT)) throw new Error('forbidden');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ executablePath });
const context = await browser.newContext();
await context.addInitScript(`window.__CARBONLENS_ENDPOINTS = { psi: '${base}/stub/psi?url=', greencheck: '${base}/stub/green/' };`);
const page = await context.newPage();
page.on('pageerror', (e) => { console.error('PAGE ERROR:', e.message); process.exitCode = 1; });

let step = '';
try {
  step = 'page loads';
  await page.goto(`${base}/index.html`);
  assert.match(await page.title(), /CarbonLens/);
  await page.click('#lang-en');

  step = 'analyse a URL against the stubbed APIs';
  await page.fill('#url-input', 'example.com');
  await page.click('#analyse-btn');
  await page.waitForSelector('#results:not([hidden])');

  step = 'score card: grams, grade D, green hosting';
  const results = await page.locator('#results').textContent();
  assert.match(results, /0\.607/); // 2.1 MB, green-hosted
  assert.equal(await page.locator('.grade').textContent(), 'D');
  assert.match(results, /GreenHost GmbH/);
  assert.match(results, /62\/100/);

  step = 'breakdown table has resource rows';
  assert.ok((await page.locator('.breakdown tr').count()) >= 4);

  step = 'annual impact reacts to monthly views input';
  await page.fill('#monthly-views', '10000');
  await page.waitForFunction(() => document.querySelector('#annual-out')?.textContent.includes('72.9'));
  // 0.607 g × 10000 × 12 / 1000 ≈ 72.9 kg

  step = 'recommendations ranked with CO₂ savings';
  const firstRec = await page.locator('ol.recs li').first().textContent();
  assert.match(firstRec, /modern formats/);
  assert.match(firstRec, /saves ~/);

  step = 'report preview is watermarked while locked';
  await page.click('#report-btn');
  await page.waitForSelector('#report-section:not([hidden])');
  assert.equal(await page.locator('.watermark').count(), 1);

  step = 'unlock with demo key';
  await page.click('#btn-unlock');
  await page.fill('#unlock-input', 'LENS-DEMO-2026-0001');
  await page.click('#unlock-activate');
  await page.waitForSelector('.license-banner.ok', { timeout: 5000 });
  assert.equal(await page.locator('.watermark').count(), 0);

  step = 'branding appears on the report';
  await page.fill('#brand-name', 'Douillet Digital');
  await page.fill('#brand-client', 'ACME GmbH');
  await page.waitForFunction(() => document.querySelector('#report-container')?.textContent.includes('Douillet Digital'));
  assert.match(await page.locator('#report-container').textContent(), /ACME GmbH/);

  step = 'invalid key rejected in a fresh profile';
  const ctx2 = await browser.newContext();
  await ctx2.addInitScript(`window.__CARBONLENS_ENDPOINTS = { psi: '${base}/stub/psi?url=', greencheck: '${base}/stub/green/' };`);
  const page2 = await ctx2.newPage();
  await page2.goto(`${base}/index.html`);
  await page2.fill('#url-input', 'example.com');
  await page2.click('#analyse-btn');
  await page2.waitForSelector('#results:not([hidden])');
  await page2.click('#report-btn');
  await page2.click('#btn-unlock');
  await page2.fill('#unlock-input', 'LENS-WRONG-0000-0000');
  await page2.click('#unlock-activate');
  await page2.waitForSelector('.unlock-msg.error');
  assert.equal(await page2.locator('.watermark').count(), 1);
  await ctx2.close();

  step = 'German UI';
  await page.click('#lang-de');
  await page.waitForFunction(() => document.documentElement.lang === 'de');
  assert.match(await page.locator('#report-container').textContent(), /Website-CO₂-Audit/);
  assert.match(await page.locator('#results').textContent(), /0,607/);

  step = 'quota (429) shows rate-limit message with operator hint';
  const ctx3 = await browser.newContext();
  await ctx3.addInitScript(`window.__CARBONLENS_ENDPOINTS = { psi: '${base}/stub/quota?url=', greencheck: '${base}/stub/green/' };`);
  const page3 = await ctx3.newPage();
  await page3.goto(`${base}/index.html`);
  await page3.click('#lang-en');
  await page3.fill('#url-input', 'example.com');
  await page3.click('#analyse-btn');
  await page3.waitForSelector('.status.error');
  const quotaMsg = await page3.locator('#analyse-status').textContent();
  assert.match(quotaMsg, /rate-limited/);
  assert.match(quotaMsg, /PageSpeed API key/); // operator hint (no key configured)
  await ctx3.close();

  step = 'bad URL error message';
  await page.fill('#url-input', 'nodots');
  await page.click('#analyse-btn');
  await page.waitForSelector('.status.error');

  console.log('✓ smoke test passed (all steps)');
} catch (err) {
  console.error(`✗ smoke test failed at step: ${step}`);
  console.error(err);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
