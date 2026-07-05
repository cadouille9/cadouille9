import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parsePsi } from '../js/api.js';
import { buildRecommendations } from '../js/recs.js';
import { buildReportHTML, esc } from '../js/report.js';

const psi = JSON.parse(await readFile(new URL('./fixtures/psi.json', import.meta.url), 'utf8'));
const auditGreen = { url: 'https://example.com/', ...parsePsi(psi), greenHost: { green: true, hostedBy: 'GreenHost GmbH' } };
const auditGrey = { ...auditGreen, greenHost: { green: false, hostedBy: '' } };

test('recommendations: localised, ranked, with CO₂ savings', () => {
  const recs = buildRecommendations(auditGreen, 'en');
  assert.equal(recs[0].id, 'modern-image-formats');
  assert.match(recs[0].title, /modern formats/);
  assert.ok(recs[0].savingsGramsPerView > 0);
  const de = buildRecommendations(auditGreen, 'de');
  assert.match(de[0].title, /modernen Formaten/);
});

test('recommendations: green-host advice only for grey hosting', () => {
  assert.ok(buildRecommendations(auditGrey, 'en').some((r) => r.id === 'green-host'));
  assert.ok(!buildRecommendations(auditGreen, 'en').some((r) => r.id === 'green-host'));
});

test('report: grade, grams, URL and host present', () => {
  const html = buildReportHTML(auditGreen, { lang: 'en' });
  // 2.1 MB green-hosted → 0.607 g → grade D
  assert.match(html, /0\.607/);
  assert.match(html, /grade-D/);
  assert.match(html, /https:\/\/example\.com\//);
  assert.match(html, /GreenHost GmbH/);
  assert.match(html, /62\/100/);
});

test('report: annual section only with monthlyViews', () => {
  const without = buildReportHTML(auditGreen, { lang: 'en' });
  const withViews = buildReportHTML(auditGreen, { lang: 'en', monthlyViews: 10000 });
  assert.doesNotMatch(without, /Annual impact/);
  assert.match(withViews, /Annual impact/);
  assert.match(withViews, /kg CO₂e/);
});

test('report: watermark toggles; branding rendered when provided', () => {
  assert.match(buildReportHTML(auditGreen, { watermark: true }), /class="watermark"/);
  assert.doesNotMatch(buildReportHTML(auditGreen, { watermark: false }), /class="watermark"/);
  const branded = buildReportHTML(auditGreen, {
    branding: { name: 'Douillet Digital', client: 'ACME GmbH', logoDataUrl: 'data:image/png;base64,AAAA' },
  });
  assert.match(branded, /Douillet Digital/);
  assert.match(branded, /ACME GmbH/);
  assert.match(branded, /img class="brand-logo" src="data:image\/png/);
});

test('report: non-data logo URLs are ignored (no external/script injection)', () => {
  const html = buildReportHTML(auditGreen, {
    branding: { name: 'x', logoDataUrl: 'https://evil.example/x.png' },
  });
  assert.doesNotMatch(html, /evil\.example/);
});

test('report: user strings are escaped', () => {
  const html = buildReportHTML(
    { ...auditGreen, finalUrl: '<script>alert(1)</script>' },
    { branding: { name: '<img onerror=x>' } }
  );
  assert.doesNotMatch(html, /<script>alert/);
  assert.doesNotMatch(html, /<img onerror/);
});

test('report: German output', () => {
  const html = buildReportHTML(auditGreen, { lang: 'de', monthlyViews: 5000 });
  assert.match(html, /Website-CO₂-Audit/);
  assert.match(html, /Jährliche Auswirkung/);
  assert.match(html, /0,607/);
});

test('esc: escapes dangerous characters', () => {
  assert.equal(esc(`<>&"'`), '&lt;&gt;&amp;&quot;&#39;');
});
