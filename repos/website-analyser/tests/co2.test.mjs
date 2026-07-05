import test from 'node:test';
import assert from 'node:assert/strict';
import { co2PerView, rating, cleanerThan, annualImpact, savingsPerView, fmtGrams, fmtBytes, SWD } from '../js/co2.js';

const GB = 1024 * 1024 * 1024;

test('co2PerView: 1 GB conventional = 0.81 kWh × 442 g', () => {
  const r = co2PerView(GB);
  assert.ok(Math.abs(r.energyKwh - 0.81) < 1e-12);
  assert.ok(Math.abs(r.grams - 0.81 * 442) < 1e-9); // 358.02 g
});

test('co2PerView: green hosting lowers only the data-center share', () => {
  const grey = co2PerView(GB).grams;
  const green = co2PerView(GB, { greenHost: true }).grams;
  const expectedGreen = 0.81 * (0.85 * SWD.gridIntensity + 0.15 * SWD.renewableIntensity);
  assert.ok(Math.abs(green - expectedGreen) < 1e-9);
  assert.ok(green < grey);
  // device+network+production unchanged
  const g1 = co2PerView(GB).segments;
  const g2 = co2PerView(GB, { greenHost: true }).segments;
  assert.equal(g1.device, g2.device);
  assert.equal(g1.network, g2.network);
  assert.ok(g2.dataCenter < g1.dataCenter);
});

test('co2PerView: zero / invalid input → zeros', () => {
  assert.equal(co2PerView(0).grams, 0);
  assert.equal(co2PerView('abc').grams, 0);
  assert.equal(co2PerView(-5).grams, 0);
});

test('rating: Digital Carbon Rating boundaries', () => {
  assert.equal(rating(0.05), 'A+');
  assert.equal(rating(0.095), 'A+');
  assert.equal(rating(0.1), 'A');
  assert.equal(rating(0.3), 'B');
  assert.equal(rating(0.45), 'C');
  assert.equal(rating(0.6), 'D');
  assert.equal(rating(0.8), 'E');
  assert.equal(rating(2.5), 'F');
});

test('cleanerThan: monotonically decreasing, bounded 0..1', () => {
  let prev = 1;
  for (const g of [0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 1.5, 3, 10]) {
    const p = cleanerThan(g);
    assert.ok(p <= prev, `${g} → ${p}`);
    assert.ok(p >= 0 && p <= 1);
    prev = p;
  }
});

test('annualImpact: 0.5 g × 10k views/month', () => {
  const a = annualImpact(0.5, 10000);
  assert.ok(Math.abs(a.kgPerYear - 60) < 1e-9);
  assert.ok(Math.abs(a.kmByCar - 60000 / 171) < 1e-9);
  assert.ok(Math.abs(a.trees - 2.4) < 1e-9);
  assert.equal(annualImpact(0.5, 0), null);
  assert.equal(annualImpact(0.5, ''), null);
});

test('savingsPerView proportional to bytes', () => {
  assert.ok(Math.abs(savingsPerView(GB / 2) - co2PerView(GB).grams / 2) < 1e-9);
});

test('formatting', () => {
  assert.equal(fmtGrams(0.6072934), '0.607');
  assert.equal(fmtGrams(1.5), '1.50');
  assert.equal(fmtGrams(250.4), '250');
  assert.equal(fmtGrams(0.6072934, 'de'), '0,607');
  assert.equal(fmtBytes(2100000), '2 MB');
  assert.equal(fmtBytes(51200), '50 KB');
});
