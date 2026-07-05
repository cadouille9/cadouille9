import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHEMA, allFieldIds, isVisible, completion } from '../js/schema.js';

test('schema: 11 sections, B1..B11 in order', () => {
  assert.equal(SCHEMA.length, 11);
  assert.deepEqual(
    SCHEMA.map((s) => s.code),
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11']
  );
});

test('schema: field ids are unique', () => {
  const ids = allFieldIds();
  assert.equal(ids.length, new Set(ids).size);
});

test('schema: every field/section is fully bilingual', () => {
  for (const s of SCHEMA) {
    assert.ok(s.title.en && s.title.de, s.id);
    assert.ok(s.intro.en && s.intro.de, s.id);
    for (const f of s.fields) {
      assert.ok(f.label?.en && f.label?.de, f.id);
      if (f.help) assert.ok(f.help.en && f.help.de, f.id);
      for (const o of f.options || []) assert.ok(o.en && o.de && o.value, f.id);
    }
  }
});

test('schema: showIf references existing fields, valid types', () => {
  const ids = new Set(allFieldIds());
  const types = new Set(['text', 'textarea', 'number', 'select', 'yesno', 'note']);
  for (const s of SCHEMA) {
    for (const f of s.fields) {
      assert.ok(types.has(f.type), `${f.id} type ${f.type}`);
      if (f.showIf) assert.ok(ids.has(f.showIf.field), `${f.id} showIf → ${f.showIf.field}`);
    }
  }
});

test('isVisible: hides conditional fields until trigger matches', () => {
  const omitNote = SCHEMA[0].fields.find((f) => f.id === 'b1_omissions_note');
  assert.equal(isVisible(omitNote, {}), false);
  assert.equal(isVisible(omitNote, { b1_omissions: 'no' }), false);
  assert.equal(isVisible(omitNote, { b1_omissions: 'yes' }), true);
});

test('completion: 0 for empty, grows monotonically, ≤ 1', () => {
  assert.equal(completion({}), 0);
  const some = completion({ b1_company_name: 'ACME GmbH' });
  assert.ok(some > 0 && some < 1);
  const full = {};
  for (const id of allFieldIds()) full[id] = 'x';
  assert.equal(completion(full), 1);
});
