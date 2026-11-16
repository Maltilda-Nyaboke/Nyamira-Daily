// Site navigation, used by Base.astro.
// Five sections (decision #110). On desktop each opens a mega menu of cards; on phones the hamburger sheet lists them all
// (src/components/SiteHeader.astro). Section pages also get a secondary bar of their pages (SectionTabs.astro).
// Labels are kept short for the lists; each section's index page keeps the longer titles and descriptions.
// Add a new page to its section's `pages` here so readers can reach it from the menu.
import { topics } from './data/topics.js';
import wards from './data/wards.json';
import { planned } from './config.js';

import { county } from './county.js';

// The county's constituencies (its sub-county units), from the county kit (decision #74).
export const subCounties = county.constituencies;
export const anchorFor = (name) => name.toLowerCase().split(' ').join('-');

// The Money section's own pages (decision #105)
const moneyPages = [
  { href: '/data/money/2025-26/', label: 'Budget 2025/26', also: ['/data/money/2025-26/departments/'] },
  { href: '/data/money/track/', label: 'What was spent' },
  { href: '/data/money/revenue/', label: 'Where it comes from' },
  { href: '/data/money/history/', label: 'Since 2013' },
];
const topic = (slug) => topics.find((t) => t.slug === slug);

// Each section: `overview` names its own page, `desc` introduces it in the menu, `icon` is from
// src/lib/icons.js. Each page has a short `desc` for the menu cards; pages can hold pages of their own.
// Five sections (decision #110): the map, the money, the videos, who holds each seat, and about us.
// Phase R2b moves the map and money pages to /map/ and /money/; until then they keep their old addresses.
export const sections = [
  { href: '/maps/', label: 'Map', icon: 'map', overview: 'The county map',
    desc: 'Every ward and every place we list: what is there, and what condition it is in.', pages: [
    { href: '/ward/', label: 'Wards', icon: 'ward', desc: 'All 20 wards', also: ['/facility/', '/projects/'], pages: subCounties.map((s) => ({
      href: `/ward/#${anchorFor(s)}`, label: s,
      pages: wards.filter((w) => w.subCounty === s).map((w) => ({ href: `/ward/${w.slug}/`, label: w.name })),
    })) },
    { href: '/road/', label: 'Roads', icon: 'road', desc: 'Road money and questions to ask' },
    { href: '/data/health/', label: topic('health').title, icon: 'health', desc: 'Clinics, mothers and children' },
    { href: '/data/education/', label: topic('education').title, icon: 'education', desc: 'Schools and learners' },
    { href: '/report/', label: 'Report a place', icon: 'check', desc: 'Tell us what you saw' },
  ] },
  { href: '/data/money/', label: 'Money', icon: 'money', overview: "Nyamira's money",
    desc: 'The county budget, what was spent, where the money comes from, and the local economy.', pages: [
    ...moneyPages,
    { href: '/data/farming/', label: topic('farming').title, icon: 'farming', desc: 'Tea bonuses and farm spending' },
    { href: '/tracker/', label: 'Contracts', icon: 'source', desc: 'Every contract: who, how much, when' },
    { href: '/learn/budget-calendar/', label: 'Budget calendar', icon: 'calendar', desc: 'When money decisions are made' },
    { href: '/learn/fees/', label: 'Fees you pay', icon: 'money', desc: 'County fees and charges' },
  ] },
  { href: '/watch/', label: 'Watch', icon: 'camera', overview: 'Watch',
    desc: 'Our videos, each with the figures and sources behind it.', pages: [
    { href: '/explainers/', label: 'Explainers', icon: 'stories', desc: 'Short guides to big topics' },
    { href: '/number-of-the-week/', label: 'Number of the week', icon: 'chart', desc: 'One figure, explained' },
  ] },
  { href: '/administration/', label: 'Administration', icon: 'people', overview: 'Who holds each seat',
    desc: 'Who holds each county seat now, with sources. For information only.', pages: [] },
  { href: '/about/', label: 'About', icon: 'source', overview: 'About Nyamira Daily',
    desc: 'Who we are, how we check facts, how corrections work and how to reach us.', pages: [
    { href: '/who-runs-us/', label: 'Who runs us', icon: 'people', desc: 'Our publisher and independence' },
    { href: '/how-we-work/', label: 'How we work', icon: 'check', desc: 'Our rules for facts and fairness' },
    { href: '/how-we-work/#evidence', label: 'Evidence labels', icon: 'source', desc: 'What each label on a figure means' },
    { href: '/how-we-work/#corrections', label: 'Corrections', icon: 'question', desc: 'What we corrected, and how to tell us' },
    { href: '/right-of-reply/', label: 'Right of reply', icon: 'question', desc: 'How anyone named can respond' },
    { href: '/data/open-data/', label: 'Use our data', icon: 'data', desc: 'Free to reuse, with credit' },
    { href: '/learn/glossary/', label: 'Glossary', icon: 'learn', desc: 'Terms explained' },
    { href: '/terms/', label: 'Terms and reuse', icon: 'source', desc: 'Our data licence and its limits' },
    { href: '/privacy/', label: 'Privacy', icon: 'check', desc: 'What we keep, and what we never do' },
  ] },
];

// Section colours are retired (decision #111): every page reads the same tokens. Kept so pages still build.
export const sectionTone = {};
export function toneFor() { return 'deep'; }

// aria-current for a menu entry on this page: "page" if it is this page, "true" if it contains it
// (a page listed under it, or an address it covers, like the articles under Devolution).
export function stateFor(item, path) {
  if (item.href === path) return 'page';
  if ((item.pages ?? []).some((p) => stateFor(p, path))) return 'true';
  if ((item.also ?? []).some((href) => path.startsWith(href))) return 'true';
  // A page under a listed page (a road under Roads, a person under Nyamira's people) is inside it
  if (item.href !== '/' && item.href.endsWith('/') && path.startsWith(item.href)) return 'true';
  return undefined;
}

// The section a page belongs to: by its address, or because it is listed in the section
// (Opportunities and Have your say sit under Today).
export function sectionFor(path) {
  return sections.find((s) => (s.href === '/' ? path === '/' : path.startsWith(s.href)) || s.pages.some((p) => stateFor(p, path)));
}
