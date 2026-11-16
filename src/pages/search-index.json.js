// Builds a small search index at build time: the pages of the five sections (decision #110), wards, places,
// roads, county projects, money pages, fees, seat holders and published explainers.
import wards from '../data/wards.js';
import { roads, roadPath, subtypeLabel, wardName } from '../lib/roads.js';
import leaders from '../data/leaders.json';
import { topics, topicPath } from '../data/topics.js';
import { departments, departmentPath, programmePath, yearPath, FY } from '../lib/county-budget.js';
import { planned } from '../config.js';
import F from '../data/fees.json';
import W from '../data/wardspend.json';
import { entries } from '../lib/content.js';

export async function GET() {
  const items = [];
  const add = (t, u, k = '', g = 'Page') => items.push({ t, u, k, g });
  const pages = [
    ['Home', '/'], ['Map of Nyamira', '/map/', 'map wards facilities'], ['Wards', '/ward/'],
    ['Report a place', '/report/', 'report water point borehole dispensary streetlight road bridge market broken'], ['Clinic check', '/report/clinic/', 'health centre dispensary medicines waiting'],
    ['Budget calendar', '/money/calendar/', 'cidp adp budget estimates dates hearing'],
    ['Fees you pay', '/money/fees/', 'finance act business permit market cess parking boda boda matatu slaughter building approval land rates liquor'],
    ['Contracts', '/tracker/', 'tenders contractors project tracker'],
    ['Watch', '/watch/', 'videos explainers'], ['Explainers', '/explainers/'], ['Number of the week', '/number-of-the-week/'],
    ['Administration: who holds each seat', '/administration/', 'governor deputy speaker mca senator mp woman representative'],
    ['About', '/about/'], ['Who runs us', '/who-runs-us/'], ['How we work', '/how-we-work/', 'evidence labels corrections'],
    ['Right of reply', '/right-of-reply/'], ['Glossary', '/about/glossary/'], ['Terms and reuse', '/terms/'], ['Privacy', '/privacy/'],
  ];
  for (const [t, u, k] of pages) if (!planned.has(u)) add(t, u, k);
  for (const t of topics) if (!planned.has(topicPath[t.slug])) add(t.title, topicPath[t.slug], t.question);
  add('County budget and spending', '/money/', 'money budget spending pending bills revenue controller of budget absorption');
  // The county budget pages (decision #105): each department and programme can be found by name
  add(`Nyamira's budget ${FY}`, yearPath(), 'budget estimates ksh 100 staff pay wage bill development equitable share', 'Money');
  add(`The 24 departments, ${FY}`, `${yearPath()}departments/`, 'departments votes ministries staff pay change', 'Money');
  add('What the county spent this year', '/money/track/', 'spending absorption quarter report questions to ask unspent', 'Money');
  add('Where the money comes from', '/money/revenue/', 'revenue equitable share allocated received own source revenue fees grants', 'Money');
  add("Nyamira's money since 2013", '/money/history/', 'history budget spending development pending bills since 2013', 'Money');
  for (const d of departments()) {
    add(d.name, departmentPath(d.vote), `vote ${d.vote} ${d.short} department budget ${FY}`, `Department · vote ${d.vote}`);
    for (const p of d.programmes) add(p.name, programmePath(d.vote, p.slug), `${d.name} ${d.short} programme ${p.rows.map((r) => r.name ?? '').join(' ')}`, `Programme · ${d.short}`);
  }
  for (const w of wards) {
    add(`${w.name} Ward`, `/ward/${w.slug}/`, `${w.subCounty} ${w.places.map((p) => p.name).join(' ')}`, 'Ward');
    for (const f of w.facilities) add(f.name, `/facility/${f.id.toLowerCase()}/`, `${f.id} ${f.category} ${f.subtype} ${w.name} ${w.subCounty}`, `Facility · ${f.category}`);
  }
  add('Roads', '/road/', 'roads bridges culverts road works money questions to ask', 'Map');
  for (const r of roads) {
    const where = r.wards.map(wardName).join(', ');
    add(r.name, roadPath(r.id), `${r.id} road ${subtypeLabel[r.subtype]} ${where}`, where ? `Road · ${where}` : 'Road');
  }
  // Seat holders link to the Administration page only: no profiles (decision #110)
  for (const l of [...leaders.county, ...leaders.national]) add(l.name, '/administration/', l.office, l.office);
  for (const [slug, m] of Object.entries(leaders.mcas)) add(m.name, `/administration/#ward-${slug}`, 'mca', `MCA, ${wards.find((w) => w.slug === slug)?.name}`);
  for (const f of F.fees) add(f.item, '/money/fees/', `${f.group} fee ${f.amountText}`, 'Fee');
  for (const p of W.projects) if (p.ward) add(p.name, `/projects/${p.projectId.toLowerCase()}/`, `${p.department} project ${p.fy}`, `Project in ${wards.find((w) => w.slug === p.ward)?.name}`);
  for (const e of await entries('explainers')) add(e.data.title, `/explainers/${e.id}/`, e.data.summary ?? '', 'Explainer');
  for (const e of await entries('numbers')) add(`${e.data.figure} ${e.data.sentence}`, `/number-of-the-week/#${e.id}`, e.data.explanation, 'Number of the week');
  return new Response(JSON.stringify(items));
}
