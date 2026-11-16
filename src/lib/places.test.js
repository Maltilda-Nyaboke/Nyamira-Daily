import assert from 'node:assert/strict';
import test from 'node:test';
import { places, placeById, responsibleFor, validateEvents, currentState, placePath } from './places.js';

test('every facility, road and county project is one place with a unique id', () => {
  const ids = places.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const kind of ['facility', 'road', 'project']) assert.ok(places.some((p) => p.kind === kind), kind);
  assert.equal(placePath('NYM-F0001'), '/place/nym-f0001/');
});

test('who is responsible follows the Fourth Schedule, and says so when unknown', () => {
  const health = places.find((p) => p.kind === 'facility' && p.type === 'Health' && /Ministry of Health/.test(p.owner ?? ''));
  assert.match(responsibleFor(health).why, /item 2/);
  const school = places.find((p) => p.kind === 'facility' && /^primary school$/i.test(p.subtype ?? '') && !p.owner);
  assert.match(responsibleFor(school).who, /national government/);
  const road = places.find((p) => p.kind === 'road');
  assert.match(responsibleFor(road).why, /item 5/);
  const office = places.find((p) => p.kind === 'facility' && p.type === 'Public office');
  assert.equal(responsibleFor(office).who, null);
});

test('living events are checked before the site uses them', () => {
  const id = places[0].id;
  const good = { place: id, field: 'status', value: 'open', observed_on: '2026-11-16', method: 'visit', source: 'Kobo form 1', evidence: 'verified', reviewed_by: 'editor' };
  assert.doesNotThrow(() => validateEvents([good]));
  assert.throws(() => validateEvents([{ ...good, place: 'nym-x9999' }]), /unknown place/);
  assert.throws(() => validateEvents([{ ...good, value: 'fine' }]), /unknown status/);
  assert.throws(() => validateEvents([{ ...good, observed_on: '16/11/2026' }]), /YYYY-MM-DD/);
  assert.throws(() => validateEvents([{ ...good, source: '' }]), /source/);
});

test('a place nobody has checked says so; a county project shows the county\'s own status', () => {
  const facility = places.find((p) => p.kind === 'facility');
  const s = currentState(facility);
  assert.equal(s.status, null);
  assert.equal(s.lastChecked, null);
  const project = places.find((p) => p.kind === 'project' && p.records.some((r) => r.status));
  const ps = currentState(project);
  assert.equal(ps.status.method, 'document');
  assert.equal(ps.status.evidence, 'official');
  assert.ok(placeById.get(project.id));
});
