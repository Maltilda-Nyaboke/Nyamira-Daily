// The contracts search file (decision #116): every contract in one compact list, fetched by /money/contracts/ only
// when a reader starts a search, so the page itself stays light on a cheap phone. Each row keeps its source and page.
import { contracts, sources, groups, constituencyName } from '../../../lib/contracts.js';
import wards from '../../../data/wards.json' with { type: 'json' };

const wardName = (s) => wards.find((w) => w.slug === s)?.name ?? s;
export function GET() {
  const rows = contracts.map((c) => ({
    i: c.id, t: c.title, c: c.contractor ?? null, x: c.contractorWithheld ? 1 : 0, k: c.kind, ag: c.agency ?? null,
    a: c.amount ?? null, al: c.amountLabel, y: c.fy ?? null, g: c.group, n: c.national ? 1 : 0,
    w: c.wards.map(wardName), ws: c.wards, cs: c.constituency ? constituencyName[c.constituency] : null,
    r: c.road ?? null, s: c.source, p: c.page ?? null, pr: c.progress ?? null, tn: c.tenderNo ?? null,
  }));
  const src = Object.fromEntries(Object.entries(sources).map(([id, s]) => [id, { t: s.title, u: s.url ?? null }]));
  const g = Object.fromEntries(Object.entries(groups).map(([id, x]) => [id, x.label]));
  return new Response(JSON.stringify({ rows, sources: src, groups: g }));
}
