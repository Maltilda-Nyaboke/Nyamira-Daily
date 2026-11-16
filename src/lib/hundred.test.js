import test from 'node:test';
import assert from 'node:assert/strict';
import data from '../data/budget-sectors.json' with { type: 'json' };
import { hundred, outOf100 } from './hundred.js';

test('outOf100 always adds up to 100', () => {
  assert.equal(outOf100([1, 1, 1]).reduce((a, b) => a + b, 0), 100);
  assert.deepEqual(outOf100([50, 50]), [50, 50]);
});

test('every department is in one sector and the sectors add up to the county total', () => {
  const rows = hundred(data.departments);
  assert.equal(rows.reduce((a, r) => a + r.amount, 0), data.countyTotal.total);
  assert.equal(rows.reduce((a, r) => a + r.share, 0), 100);
});
