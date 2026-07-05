import test from 'node:test';
import assert from 'node:assert/strict';
import { computeB3, accidentRate, resolveFactors, EMISSION_FACTORS, fmt } from '../js/calc.js';

test('computeB3: empty data → all zeros, no intensity', () => {
  const r = computeB3({});
  assert.equal(r.totalEnergyMwh, 0);
  assert.equal(r.scope1T, 0);
  assert.equal(r.scope2T, 0);
  assert.equal(r.totalT, 0);
  assert.equal(r.intensityPerMEur, null);
});

test('computeB3: typical German SME', () => {
  const r = computeB3({
    b3_grid_country: 'DE',
    b3_electricity_nonrenewable_kwh: '50000',
    b3_electricity_renewable_kwh: '10000',
    b3_gas_kwh: '80000',
    b3_diesel_l: '3000',
    b1_turnover_eur: '2000000',
  });
  // Scope 1: 80000*0.202 + 3000*2.68 = 16160 + 8040 = 24200 kg = 24.2 t
  assert.ok(Math.abs(r.scope1T - 24.2) < 1e-9, `scope1 ${r.scope1T}`);
  // Scope 2: 50000*0.380 = 19000 kg = 19 t (renewable counts as 0)
  assert.ok(Math.abs(r.scope2T - 19.0) < 1e-9, `scope2 ${r.scope2T}`);
  assert.ok(Math.abs(r.totalT - 43.2) < 1e-9);
  // Energy: 50000+10000+80000+3000*9.96 = 169880 kWh = 169.88 MWh
  assert.ok(Math.abs(r.totalEnergyMwh - 169.88) < 1e-9, `energy ${r.totalEnergyMwh}`);
  // Renewable share: 10000/169880
  assert.ok(Math.abs(r.renewableShare - 10000 / 169880) < 1e-12);
  // Intensity: 43.2 t / 2 M€ = 21.6
  assert.ok(Math.abs(r.intensityPerMEur - 21.6) < 1e-9);
});

test('computeB3: accepts German decimal commas', () => {
  const r = computeB3({ b3_gas_kwh: '1000,5' });
  assert.ok(Math.abs(r.scope1T - (1000.5 * 0.202) / 1000) < 1e-12);
});

test('resolveFactors: grid default and user override', () => {
  assert.equal(resolveFactors({ b3_grid_country: 'FR' }).electricity, EMISSION_FACTORS.electricityKgPerKwh.FR);
  assert.equal(resolveFactors({}).electricity, EMISSION_FACTORS.electricityKgPerKwh.EU);
  assert.equal(resolveFactors({ b3_grid_country: 'DE', b3_ef_electricity: '0.1' }).electricity, 0.1);
  assert.equal(resolveFactors({ b3_ef_electricity: '' }).electricity, EMISSION_FACTORS.electricityKgPerKwh.EU);
});

test('accidentRate: per 200k hours, null without hours', () => {
  assert.equal(accidentRate(2, 200000), 2);
  assert.equal(accidentRate('3', '100000'), 6);
  assert.equal(accidentRate(2, 0), null);
  assert.equal(accidentRate(2, ''), null);
});

test('fmt: locale formatting and null handling', () => {
  assert.equal(fmt(null), '—');
  assert.equal(fmt(NaN), '—');
  assert.equal(fmt(1234.56, 1, 'en'), '1,234.6');
  assert.equal(fmt(1234.56, 1, 'de'), '1.234,6');
});
