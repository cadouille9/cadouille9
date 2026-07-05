import test from 'node:test';
import assert from 'node:assert/strict';
import { exportJson, importJson } from '../js/store.js';

test('backup: export → import round-trips the data', () => {
  const data = { b1_company_name: 'ACME GmbH', b3_gas_kwh: '80000' };
  const restored = importJson(exportJson(data));
  assert.deepEqual(restored, data);
});

test('backup: rejects foreign or malformed files', () => {
  assert.throws(() => importJson('{"foo": 1}'));
  assert.throws(() => importJson('not json'));
  assert.throws(() => importJson('{"app":"other-app","data":{}}'));
});
