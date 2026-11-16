import assert from 'node:assert/strict';
import test from 'node:test';
import { fromPlaceVisits, fromRoadChecks, fromMarketPrices, fromSheetEvents, fromSheetVideos, fromSiteReports, merge } from './sync.mjs';
import { validateEvents } from '../../src/lib/places.js';

const ok = { uid: 'validation_status_approved', by_whom: 'reviewer1' };
const visit = { _id: 11, today: '2026-11-20', _validation_status: ok, privacy_ok: 'OK', ward: 'esise', place: 'nym-f0006', status: 'open', condition: 'fair',
  services: 'outpatient immunisation', water_available: 'no', power_available: 'unknown', method: 'visit', video_id: 'AbCdEfGhIjK', notes: 'Spoke to Jane, phone 0700' };

test('only approved place visits with the privacy box ticked become events, and notes never do', () => {
  const { events } = fromPlaceVisits([visit, { ...visit, _id: 12, _validation_status: { uid: 'validation_status_on_hold' } }, { ...visit, _id: 13, privacy_ok: '' }]);
  assert.deepEqual(events.map((e) => e.field), ['status', 'condition', 'service:outpatient', 'service:immunisation', 'service:running-water']);
  assert.ok(events.every((e) => e.source === 'kobo:place-visit:11' && e.evidence === 'verified' && e.reviewed_by === 'reviewer1' && e.video === 'AbCdEfGhIjK'));
  assert.ok(!JSON.stringify(events).includes('Jane') && !JSON.stringify(events).includes('0700'));
  assert.doesNotThrow(() => validateEvents(events));
});

test('a resident report is unverified, and a place not on the list goes to new places, not events', () => {
  const r = fromPlaceVisits([{ ...visit, method: 'resident-report' }]);
  assert.ok(r.events.every((e) => e.evidence === 'unverified'));
  const n = fromPlaceVisits([{ ...visit, place: 'new', new_place_name: 'Kebirigo Water Kiosk', new_place_type: 'Water' }]);
  assert.equal(n.events.length, 0);
  assert.equal(n.newPlaces[0].name, 'Kebirigo Water Kiosk');
});

test('road checks and market prices', () => {
  const { events } = fromRoadChecks([{ _id: 5, today: '2026-11-21', _validation_status: ok, privacy_ok: 'OK', road: 'NYM-R0001', condition: 'impassable', passable_by: 'foot', drainage: 'blocked', works_seen: 'no', method: 'visit' }]);
  assert.deepEqual(events.map((e) => `${e.field}=${e.value}`), ['condition=impassable', 'service:passable-by-foot=yes', 'service:drains=blocked']);
  assert.doesNotThrow(() => validateEvents(events));
  const prices = fromMarketPrices([{ _id: 7, today: '2026-11-22', _validation_status: ok, privacy_ok: 'OK', ward: 'township', market: 'new', new_market_name: 'Nyamira market', method: 'visit',
    price: [{ 'price/item': 'maize', 'price/unit': 'kg', 'price/quantity': '1', 'price/price_ksh': '60', 'price/seller': 'trader' }] }]);
  assert.equal(prices[0].price_ksh, 60);
  assert.equal(prices[0].name, 'Nyamira market');
});

test('sheet rows count only once reviewed; videos must name real places', () => {
  const csv = 'place_id,field,value,observed_on,method,source,evidence,reviewed_by,video_id,note\nNYM-F0006,status,closed,2026-11-23,document,County letter,official,KM,,\nnym-f0007,status,open,2026-11-23,document,County letter,official,,,';
  const rows = fromSheetEvents(csv);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].place, 'nym-f0006');
  assert.throws(() => fromSheetVideos('video_id,title,youtube_id,published_on,places,summary,reviewed_by\nv-1,T,AbCdEfGhIjK,2026-11-25,nym-x0000,S,KM'), /unknown place/);
});

test('each channel read replaces its own events; other channels are kept', () => {
  const old = [{ place: 'nym-f0006', field: 'status', value: 'open', observed_on: '2026-01-01', source: 'kobo:place-visit:1', via: 'kobo-place-visit' },
    { place: 'nym-f0006', field: 'status', value: 'closed', observed_on: '2026-02-01', source: 'Letter', via: 'sheet' }];
  const merged = merge(old, [], ['kobo-place-visit']);
  assert.deepEqual(merged.map((e) => e.via), ['sheet']);
});

test('the site\'s own reviewed reports become resident reports', () => {
  const ev = fromSiteReports([{ id: 'FO-1', facilityId: 'NYM-F0006', capability: 'Maternity care', status: 'reported-unavailable', observedOn: '2026-11-01', evidence: 'unverified' }],
    [{ id: 'RC-1', roadId: 'NYM-R0001', grade: 'poor', observedOn: '2026-11-02', evidence: 'unverified' }]);
  assert.deepEqual(ev.map((e) => `${e.place} ${e.field}=${e.value}`), ['nym-f0006 service:maternity-care=no', 'nym-r0001 condition=poor']);
});

test('a video keeps its links as address and label, and refuses a link off the site', () => {
  const head = 'video_id,title,youtube_id,published_on,places,links,summary,reviewed_by';
  const [v] = fromSheetVideos(`${head}\nv-1,T,AbCdEfGhIjK,2026-11-25,nym-f0006,/place/nym-f0006/ Chepngombe Health Centre; /money/ Money,S,KM`);
  assert.deepEqual(v.links, [{ href: '/place/nym-f0006/', label: 'Chepngombe Health Centre' }, { href: '/money/', label: 'Money' }]);
  assert.throws(() => fromSheetVideos(`${head}\nv-2,T,AbCdEfGhIjK,2026-11-25,,https://evil.example/ x,S,KM`), /site address/);
});
