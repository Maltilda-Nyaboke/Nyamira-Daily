// The living-data sync (decision #115): reviewed KoboToolbox submissions and Google Sheet rows become the files in
// src/data/living/. Only reviewed rows count (Kobo "Approved", or initials in the sheet's reviewed_by column), and
// only the fields named below are copied: names, phone numbers, notes and photos never leave Kobo.
//
//   node scripts/living/sync.mjs                  # from Kobo and the published sheet (see fieldwork/README.md)
//   node scripts/living/sync.mjs --from-dir DIR   # from exported files: place-visit.json, road-check.json,
//                                                 # market-prices.json, events.csv, videos.csv (any may be missing)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateEvents, placeById } from '../../src/lib/places.js';
import { parseCsv } from '../fieldwork/build-forms.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const living = path.join(root, 'src', 'data', 'living');
const APPROVED = 'validation_status_approved';
const evidenceFor = (method) => (method === 'visit' ? 'verified' : 'unverified');
const dateOf = (s) => (s.today || s._submission_time || '').slice(0, 10);
const reviewerOf = (s) => s._validation_status?.by_whom || 'kobo-approved';
const approved = (list) => list.filter((s) => s?._validation_status?.uid === APPROVED && s.privacy_ok);
const words = (v) => String(v ?? '').split(' ').filter(Boolean);

// --- Kobo forms -> events ---------------------------------------------------------------------------
export function fromPlaceVisits(subs) {
  const events = []; const newPlaces = [];
  for (const s of approved(subs)) {
    const base = { observed_on: dateOf(s), method: s.method, source: `kobo:place-visit:${s._id}`, via: 'kobo-place-visit', evidence: evidenceFor(s.method), reviewed_by: reviewerOf(s), ...(s.video_id ? { video: s.video_id } : {}) };
    if (s.place === 'new') { newPlaces.push({ name: s.new_place_name, type: s.new_place_type, ward: s.ward, location: s.location ?? null, observed_on: base.observed_on, source: base.source }); continue; }
    const place = String(s.place).toLowerCase();
    if (s.status) events.push({ place, field: 'status', value: s.status, ...base });
    if (s.condition) events.push({ place, field: 'condition', value: s.condition, ...base });
    for (const svc of words(s.services).filter((x) => x !== 'none')) events.push({ place, field: `service:${svc}`, value: 'yes', ...base });
    for (const [q, svc] of [['water_available', 'running-water'], ['power_available', 'electricity']]) {
      if (s[q] === 'yes' || s[q] === 'no') events.push({ place, field: `service:${svc}`, value: s[q], ...base });
    }
  }
  return { events, newPlaces };
}
export function fromRoadChecks(subs) {
  const events = []; const newPlaces = [];
  for (const s of approved(subs)) {
    const base = { observed_on: dateOf(s), method: s.method, source: `kobo:road-check:${s._id}`, via: 'kobo-road-check', evidence: evidenceFor(s.method), reviewed_by: reviewerOf(s), ...(s.video_id ? { video: s.video_id } : {}) };
    if (s.road === 'new') { newPlaces.push({ name: s.new_road_name, type: 'Road', ward: s.ward, location: s.location ?? null, observed_on: base.observed_on, source: base.source }); continue; }
    const place = String(s.road).toLowerCase();
    if (s.condition) events.push({ place, field: 'condition', value: s.condition, ...base });
    for (const mode of words(s.passable_by)) events.push({ place, field: `service:passable-by-${mode}`, value: 'yes', ...base });
    if (s.drainage && s.drainage !== 'unknown') events.push({ place, field: 'service:drains', value: s.drainage, ...base });
    if (s.works_seen === 'yes') events.push({ place, field: 'status', value: 'under-construction', ...base });
  }
  return { events, newPlaces };
}
export function fromMarketPrices(subs) {
  const prices = [];
  for (const s of approved(subs)) {
    const market = s.market === 'new' ? { name: s.new_market_name } : { place: String(s.market).toLowerCase() };
    for (const p of s.price ?? []) {
      const g = (k) => p[`price/${k}`] ?? p[k];
      prices.push({ ...market, ward: s.ward, item: g('item'), unit: g('unit'), quantity: Number(g('quantity')), price_ksh: Number(g('price_ksh')), seller: g('seller') ?? 'unknown',
        observed_on: dateOf(s), method: s.method, evidence: evidenceFor(s.method), source: `kobo:market-prices:${s._id}`, reviewed_by: reviewerOf(s) });
    }
  }
  return prices;
}

// --- the sheet ----------------------------------------------------------------------------------
const table = (csv) => { const [head, ...rows] = parseCsv(csv); return rows.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()]))); };
export function fromSheetEvents(csv) {
  return table(csv).filter((r) => r.reviewed_by && r.place_id).map((r) => ({
    place: r.place_id.toLowerCase(), field: r.field, value: r.value, observed_on: r.observed_on, method: r.method,
    source: r.source, via: 'sheet', evidence: r.evidence, reviewed_by: r.reviewed_by, ...(r.video_id ? { video: r.video_id } : {}),
  }));
}
export function fromSheetVideos(csv) {
  return table(csv).filter((r) => r.reviewed_by && r.video_id).map((r) => {
    if (!/^[A-Za-z0-9_-]{11}$/.test(r.youtube_id)) throw new Error(`video ${r.video_id}: youtube_id must be 11 characters`);
    const places = words(r.places).map((p) => p.toLowerCase());
    for (const p of places) if (!placeById.has(p)) throw new Error(`video ${r.video_id}: unknown place ${p}`);
    return { id: r.video_id, title: r.title, youtube_id: r.youtube_id, published_on: r.published_on, places, summary: r.summary };
  });
}

// --- the site's own report forms (decision #49) -> events ------------------------------------------
const slug = (s) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join('-');
export function fromSiteReports(facilityObs, roadReports) {
  const fac = facilityObs.map((o) => ({ place: o.facilityId.toLowerCase(), field: `service:${slug(o.capability)}`, value: { 'reported-available': 'yes', 'reported-unavailable': 'no' }[o.status] ?? 'unknown',
    observed_on: o.observedOn, method: 'resident-report', source: `site-report:${o.id}`, via: 'site-report', evidence: o.evidence, reviewed_by: 'site-review' }));
  const road = roadReports.map((r) => ({ place: r.roadId.toLowerCase(), field: 'condition', value: r.grade, observed_on: r.observedOn,
    method: 'resident-report', source: `site-report:${r.id}`, via: 'site-report', evidence: r.evidence, reviewed_by: 'site-review' }));
  return [...fac, ...road];
}

// --- merge: each channel read this run replaces its own events in full (so an event un-approved in Kobo, or
// deleted from the sheet, disappears); events from channels not read this run are kept as they are.
export function merge(existing, incoming, channelsRead) {
  const kept = existing.filter((e) => !channelsRead.includes(e.via));
  return [...kept, ...incoming].sort((a, b) => a.observed_on.localeCompare(b.observed_on) || a.place.localeCompare(b.place) || a.field.localeCompare(b.field) || a.source.localeCompare(b.source));
}

// --- fetching ------------------------------------------------------------------------------------
async function kobo(uid) {
  const server = process.env.KOBO_SERVER || 'https://kf.kobotoolbox.org';
  if (!uid || !process.env.KOBO_TOKEN) return null;
  const out = []; let url = `${server}/api/v2/assets/${uid}/data/?format=json&limit=1000`;
  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Token ${process.env.KOBO_TOKEN}` } });
    if (!res.ok) throw new Error(`Kobo ${uid}: HTTP ${res.status}`);
    const page = await res.json(); out.push(...page.results); url = page.next;
  }
  return out;
}
async function sheet(url) { if (!url) return null; const res = await fetch(url); if (!res.ok) throw new Error(`sheet: HTTP ${res.status}`); return res.text(); }
function local(dir, name) {
  const f = path.join(dir, name); if (!fs.existsSync(f)) return null;
  const s = fs.readFileSync(f, 'utf8'); if (!name.endsWith('.json')) return s;
  const j = JSON.parse(s); return Array.isArray(j) ? j : j.results;
}
const readJson = (f, fallback) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : fallback);
const writeJson = (f, v) => { const s = JSON.stringify(v, null, 2) + '\n'; if (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== s) { fs.writeFileSync(f, s); return true; } return false; };

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const i = process.argv.indexOf('--from-dir'); const dir = i > 0 ? path.resolve(process.argv[i + 1]) : null;
  const get = dir
    ? { visit: local(dir, 'place-visit.json'), road: local(dir, 'road-check.json'), market: local(dir, 'market-prices.json'), events: local(dir, 'events.csv'), videos: local(dir, 'videos.csv') }
    : { visit: await kobo(process.env.KOBO_PLACE_VISIT), road: await kobo(process.env.KOBO_ROAD_CHECK), market: await kobo(process.env.KOBO_MARKET_PRICES), events: await sheet(process.env.SHEET_EVENTS_CSV), videos: await sheet(process.env.SHEET_VIDEOS_CSV) };
  const pv = get.visit ? fromPlaceVisits(get.visit) : null;
  const rc = get.road ? fromRoadChecks(get.road) : null;
  const incoming = [...(pv?.events ?? []), ...(rc?.events ?? []), ...(get.events ? fromSheetEvents(get.events) : []),
    ...fromSiteReports(readJson(path.join(root, 'src/data/facility-observations.json'), []), readJson(path.join(root, 'src/data/road-conditions.json'), []))];
  const channels = ['site-report', ...(pv ? ['kobo-place-visit'] : []), ...(rc ? ['kobo-road-check'] : []), ...(get.events ? ['sheet'] : [])];
  const events = merge(readJson(path.join(living, 'events.json'), []), incoming, channels);
  validateEvents(events);
  const changed = [];
  if (writeJson(path.join(living, 'events.json'), events)) changed.push(`events.json (${events.length})`);
  if (get.market && writeJson(path.join(living, 'prices.json'), fromMarketPrices(get.market))) changed.push('prices.json');
  if (get.videos && writeJson(path.join(living, 'videos.json'), fromSheetVideos(get.videos))) changed.push('videos.json');
  const newPlaces = [...(pv?.newPlaces ?? []), ...(rc?.newPlaces ?? [])];
  if ((pv || rc) && writeJson(path.join(living, 'new-places.json'), newPlaces)) changed.push(`new-places.json (${newPlaces.length} to add by hand)`);
  const missing = Object.entries(get).filter(([, v]) => v == null).map(([k]) => k);
  console.log(changed.length ? `Updated: ${changed.join(', ')}` : 'No changes.');
  if (missing.length) console.log(`Not read (no file or no settings): ${missing.join(', ')}`);
}
