import assert from 'node:assert/strict';
import test from 'node:test';
// The filters are plain functions; import them without Astro's content layer
const visible = (list) => list.filter((e) => e.data.consentPublish && !e.data.withdrawn);
const forTraining = (list) => visible(list).filter((e) => e.data.consentAiTraining);
import { readFileSync } from 'node:fs';

test('archive.js keeps the same consent rules as this test', () => {
  const src = readFileSync(new URL('./archive.js', import.meta.url), 'utf8');
  assert.ok(src.includes('e.data.consentPublish && !e.data.withdrawn'));
  assert.ok(src.includes('visible(list).filter((e) => e.data.consentAiTraining)'));
});
test('withdrawn items never show, and training needs its own consent', () => {
  const list = [
    { id: 'a', data: { consentPublish: true, withdrawn: false, consentAiTraining: true } },
    { id: 'b', data: { consentPublish: true, withdrawn: true, consentAiTraining: true } },
    { id: 'c', data: { consentPublish: true, withdrawn: false, consentAiTraining: false } },
  ];
  assert.deepEqual(visible(list).map((e) => e.id), ['a', 'c']);
  assert.deepEqual(forTraining(list).map((e) => e.id), ['a']);
});
