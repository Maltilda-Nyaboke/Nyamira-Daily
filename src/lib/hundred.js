// "Where KSh 100 goes": the county's budget by broad sector, as whole shillings out of 100.
// Each department vote in src/data/budget-sectors.json belongs to exactly one sector here.
export const SECTORS = [
  { name: 'Health', votes: ['Medical Services', 'Primary Healthcare'] },
  { name: 'Running the county government', votes: ['County Executive', 'Finance and Accounting services', 'Public Service Management', 'CPSB', 'The County Attorney', 'Economic Planning, Resources Mobilization and ICT', 'Nyamira revenue board', 'Nyamira Investment Board'] },
  { name: 'County Assembly', votes: ['County Assembly'] },
  { name: 'Lands, housing and towns', votes: ['Land, Physical Planning, Housing and Urban Development', 'Nyamira Municipality', 'Keroka municipality'] },
  { name: 'Education and training', votes: ['Education & Vocational Training'] },
  { name: 'Roads and public works', votes: ['Transport & Public Works,'] },
  { name: 'Water and environment', votes: ['Environment, Water, Energy & Natural Resources', 'Water Sanitation and Irrigation', 'Nyamira Water and sanitation company'] },
  { name: 'Farming', votes: ['Crop Development', 'Livestock and Fisheries Services'] },
  { name: 'Trade and co-operatives', votes: ['Trade, Tourism and Co-operatives Development'] },
  { name: 'Youth, gender, culture and social services', votes: ['Youth, Gender, Culture and Social services', 'Nyamira disability board'] },
];

// Whole numbers that add up to exactly 100 (largest-remainder rounding).
export function outOf100(amounts) {
  const total = amounts.reduce((a, b) => a + b, 0);
  const raw = amounts.map((a) => (a * 100) / total);
  const out = raw.map(Math.floor);
  let left = 100 - out.reduce((a, b) => a + b, 0);
  raw.map((r, i) => [r - out[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { out[i] += 1; left -= 1; } });
  return out;
}

export function hundred(departments) {
  const byName = new Map(departments.map((d) => [d.name, d.total]));
  const used = new Set();
  const rows = SECTORS.map((s) => ({ name: s.name, amount: s.votes.reduce((sum, v) => {
    if (!byName.has(v)) throw new Error(`hundred: no department named "${v}"`);
    used.add(v); return sum + byName.get(v);
  }, 0) }));
  const missing = departments.filter((d) => !used.has(d.name));
  if (missing.length) throw new Error(`hundred: departments not in any sector: ${missing.map((d) => d.name).join(', ')}`);
  const shares = outOf100(rows.map((r) => r.amount));
  return rows.map((r, i) => ({ ...r, share: shares[i] })).sort((a, b) => b.amount - a.amount);
}
