import assert from 'node:assert/strict';
import test from 'node:test';
import { validateNow, liveItems } from './now.js';

test('now.json entries need every field and valid dates', () => {
  assert.deepEqual(validateNow({ items: [], lead: null }), []);
  const bad = validateNow({ items: [{ headline: 'x', href: '/', date: '2026-11-20', until: '2026-11-01' }], lead: { ward: 'nowhere', title: 't' } });
  assert.ok(bad.some((e) => e.includes('missing source')));
  assert.ok(bad.some((e) => e.includes('until is before date')));
  assert.ok(bad.some((e) => e.includes('unknown ward')));
  assert.ok(bad.some((e) => e.includes('lead: missing text')));
});

test('only items inside their dates are live, newest first', () => {
  const d = { items: [
    { headline: 'old', href: '/', source: 's', date: '2026-11-01', until: '2026-11-05' },
    { headline: 'a', href: '/', source: 's', date: '2026-11-10', until: '2026-11-20' },
    { headline: 'b', href: '/', source: 's', date: '2026-11-12', until: '2026-11-30' },
  ] };
  assert.deepEqual(liveItems('2026-11-15', d).map((x) => x.headline), ['b', 'a']);
});
