import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeUrl, parsePsi } from '../js/api.js';

const psi = JSON.parse(await readFile(new URL('./fixtures/psi.json', import.meta.url), 'utf8'));

test('normalizeUrl: adds https, validates, rejects junk', () => {
  assert.equal(normalizeUrl('www.example.com'), 'https://www.example.com/');
  assert.equal(normalizeUrl('http://example.com/page'), 'http://example.com/page');
  assert.equal(normalizeUrl('  example.com  '), 'https://example.com/');
  assert.equal(normalizeUrl(''), null);
  assert.equal(normalizeUrl('nodots'), null);
  assert.equal(normalizeUrl('ht tp://x y'), null);
});

test('parsePsi: totals and per-type breakdown from network requests', () => {
  const r = parsePsi(psi);
  assert.equal(r.finalUrl, 'https://example.com/');
  assert.equal(r.perfScore, 0.62);
  assert.equal(r.totalBytes, 2100000);
  assert.equal(r.breakdown.Script, 500000);
  assert.equal(r.breakdown.Image, 1400000);
  assert.equal(r.breakdown.Font, 120000);
});

test('parsePsi: opportunities sorted by savings, tiny ones dropped', () => {
  const r = parsePsi(psi);
  assert.deepEqual(
    r.opportunities.map((o) => o.id),
    ['modern-image-formats', 'unused-javascript', 'uses-text-compression']
  );
  assert.equal(r.opportunities[0].savingsBytes, 600000);
  // 500-byte unused-css-rules is below the 1 KB threshold
  assert.ok(!r.opportunities.some((o) => o.id === 'unused-css-rules'));
});

test('parsePsi: falls back to total-byte-weight without network requests', () => {
  const clone = structuredClone(psi);
  delete clone.lighthouseResult.audits['network-requests'];
  const r = parsePsi(clone);
  assert.equal(r.totalBytes, 2100000);
  assert.deepEqual(r.breakdown, {});
});

test('parsePsi: malformed response throws psi_malformed', () => {
  assert.throws(() => parsePsi({}), /psi_malformed/);
  assert.throws(() => parsePsi(null), /psi_malformed/);
});
