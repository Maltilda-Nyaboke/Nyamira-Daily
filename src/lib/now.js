// "Coming fast" and the home page lead (decision #121), from src/data/living/now.json.
// Every item needs a headline, a link, a source and two ISO dates; a bad entry fails the build.
import data from '../data/living/now.json' with { type: 'json' };
import wards from '../data/wards.json' with { type: 'json' };

const iso = /^\d{4}-\d{2}-\d{2}$/;
export function validateNow(d) {
  const errors = [];
  (d.items ?? []).forEach((it, i) => {
    for (const k of ['headline', 'href', 'source', 'date', 'until']) if (!it[k]) errors.push(`items[${i}]: missing ${k}`);
    for (const k of ['date', 'until']) if (it[k] && !iso.test(it[k])) errors.push(`items[${i}]: ${k} must be YYYY-MM-DD`);
    if (it.date && it.until && it.until < it.date) errors.push(`items[${i}]: until is before date`);
  });
  if (d.lead) {
    for (const k of ['ward', 'title', 'text', 'href', 'source']) if (!d.lead[k]) errors.push(`lead: missing ${k}`);
    if (d.lead.ward && !wards.some((w) => w.slug === d.lead.ward)) errors.push(`lead: unknown ward ${d.lead.ward}`);
  }
  return errors;
}
const problems = validateNow(data);
if (problems.length) throw new Error('src/data/living/now.json: ' + problems.join('; '));

// Items live on the given day (the build date by default), newest first
export function liveItems(today = new Date().toISOString().slice(0, 10), d = data) {
  return (d.items ?? []).filter((it) => it.date <= today && today <= it.until).sort((a, b) => b.date.localeCompare(a.date));
}
export const lead = data.lead ?? null;
