import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReportHTML, esc } from '../js/report.js';

const SAMPLE = {
  b1_company_name: 'Müller Metallbau GmbH',
  b1_reporting_year: '1 January – 31 December 2025',
  b1_turnover_eur: '2000000',
  b2_climate: 'yes',
  b2_climate_note: 'Energy efficiency programme since 2024.',
  b3_grid_country: 'DE',
  b3_electricity_nonrenewable_kwh: '50000',
  b3_gas_kwh: '80000',
  b9_accidents: '2',
  b9_hours_worked: '100000',
  b11_convictions: '0',
  b11_fines_eur: '0',
};

test('report: renders cover with company and year', () => {
  const html = buildReportHTML(SAMPLE, 'en');
  assert.match(html, /Müller Metallbau GmbH/);
  assert.match(html, /Sustainability Report/);
  assert.match(html, /1 January – 31 December 2025/);
});

test('report: includes computed Scope 1+2 KPIs and methodology', () => {
  const html = buildReportHTML(SAMPLE, 'en');
  // Scope 1: 80000*0.202 = 16.2 t ; Scope 2: 50000*0.380 = 19.0 t ; total 35.2
  assert.match(html, /16\.2 t CO₂e/);
  assert.match(html, /19\.0 t CO₂e/);
  assert.match(html, /35\.2 t CO₂e/);
  assert.match(html, /Methodology \(B3\)/);
  // Accident rate: 2 per 100000 h → 4 per 200k
  assert.match(html, /4\.00/);
});

test('report: German output uses German labels and number format', () => {
  const html = buildReportHTML(SAMPLE, 'de');
  assert.match(html, /Nachhaltigkeitsbericht/);
  assert.match(html, /16,2 t CO₂e/);
  assert.match(html, /Methodik \(B3\)/);
});

test('report: empty sections are omitted, filled ones present', () => {
  const html = buildReportHTML(SAMPLE, 'en');
  assert.match(html, />B3<\/span>/);
  assert.match(html, />B11<\/span>/);
  assert.doesNotMatch(html, />B5<\/span>/); // nothing filled in B5
  assert.doesNotMatch(html, />B7<\/span>/);
});

test('report: watermark toggles with the option', () => {
  assert.match(buildReportHTML(SAMPLE, 'en', { watermark: true }), /class="watermark"/);
  assert.doesNotMatch(buildReportHTML(SAMPLE, 'en', { watermark: false }), /class="watermark"/);
});

test('report: user input is HTML-escaped', () => {
  const html = buildReportHTML(
    { b1_company_name: '<script>alert(1)</script>' },
    'en'
  );
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
});

test('report: yes/no values are translated', () => {
  const en = buildReportHTML({ b2_climate: 'yes' }, 'en');
  const de = buildReportHTML({ b2_climate: 'yes' }, 'de');
  assert.match(en, /<td>Yes<\/td>/);
  assert.match(de, /<td>Ja<\/td>/);
});

test('esc: escapes all dangerous characters', () => {
  assert.equal(esc(`<>&"'`), '&lt;&gt;&amp;&quot;&#39;');
});
