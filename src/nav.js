// Site navigation, used by Base.astro.
// Five sections (decision #110). On desktop each opens a mega menu of cards; on phones the hamburger sheet lists them all
// (src/components/SiteHeader.astro). Section pages also get a secondary bar of their pages (SectionTabs.astro).
// Labels are kept short for the lists; each section's index page keeps the longer titles and descriptions.
// Add a new page to its section's `pages` here so readers can reach it from the menu.
import { topics } from './data/topics.js';
import wards from './data/wards.json' with { type: 'json' };
import { planned } from './config.js';

import { county } from './county.js';

// The county's constituencies (its sub-county units), from the county kit (decision #74).
export const subCounties = county.constituencies;
export const anchorFor = (name) => name.toLowerCase().split(' ').join('-');

// The Money section's own pages (decision #105)
const moneyPages = [
  { href: '/money/2025-26/', label: 'Budget 2025/26', group: 'This year', also: ['/money/2025-26/departments/'] },
  { href: '/money/track/', label: 'What was spent', group: 'This year' },
  { href: '/money/revenue/', label: 'Where it comes from', group: 'This year' },
  { href: '/money/history/', label: 'Since 2013', group: 'Over time' },
];
const topic = (slug) => topics.find((t) => t.slug === slug);

// Each section: `overview` names its own page, `desc` introduces it in the menu, `icon` is from
// src/lib/icons.js. Each page has a short `desc` for the menu cards; pages can hold pages of their own.
// Five sections (decisions #110, #119, #122): the map, the money, the community, the videos, about.
// `group` puts a page under a heading in the section switcher and side list (SectionNav.astro); `groups` gives their order.
// `rail: false` keeps a section's pages full width (the switcher only): the Map pages need the whole width.
// Map pages live under /map/ and /ward/, money pages under /money/ (phase R2b).
export const sections = [
  { href: '/map/', label: 'Map', icon: 'map', overview: 'The county map', rail: false, groups: ['Places', 'Help us'],
    desc: 'Every ward and every place we list: what is there, and what condition it is in.', pages: [
    { href: '/ward/', label: 'Wards', icon: 'ward', group: 'Places', desc: 'All 20 wards', also: ['/place/'], pages: subCounties.map((s) => ({
      href: `/ward/#${anchorFor(s)}`, label: s,
      pages: wards.filter((w) => w.subCounty === s).map((w) => ({ href: `/ward/${w.slug}/`, label: w.name })),
    })) },
    { href: '/road/', label: 'Roads', icon: 'road', group: 'Places', desc: 'Road money and questions to ask' },
    { href: '/map/health/', label: topic('health').title, icon: 'health', group: 'Places', desc: 'Clinics, mothers and children' },
    { href: '/map/education/', label: topic('education').title, icon: 'education', group: 'Places', desc: 'Schools and learners' },
    { href: '/report/', label: 'Report a place', icon: 'check', group: 'Help us', desc: 'Tell us what you saw' },
  ] },
  { href: '/money/', label: 'Money', icon: 'money', overview: "Nyamira's money", groups: ['This year', 'Over time', 'Follow it'],
    desc: 'The county budget, what was spent, where the money comes from, and the local economy.', pages: [
    ...moneyPages,
    { href: '/money/contracts/', label: 'Contracts', icon: 'source', group: 'Follow it', desc: 'Every contract: who, how much, when' },
    { href: '/money/economy/', label: 'The economy', icon: 'chart', group: 'Follow it', desc: 'Money coming into Nyamira, and how it moves' },
    { href: '/money/farming/', label: topic('farming').title, icon: 'farming', group: 'Follow it', desc: 'Tea bonuses and farm spending' },
    { href: '/money/calendar/', label: 'Budget calendar', icon: 'calendar', group: 'Over time', desc: 'When money decisions are made' },
    { href: '/money/fees/', label: 'Fees you pay', icon: 'money', group: 'Follow it', desc: 'County fees and charges' },
  ] },
  { href: '/community/', label: 'Community', icon: 'people', overview: 'Community', groups: ['Our heritage', 'Take part'],
    desc: 'The Abagusii, their culture and language, recorded with consent and kept for the community.', pages: [
    { href: '/community/abagusii/', label: 'The Abagusii', group: 'Our heritage', icon: 'people', desc: 'History and culture, with sources' },
    { href: '/community/archive/', label: 'Culture archive', group: 'Our heritage', icon: 'stories', desc: 'Recordings, stories and knowledge' },
    { href: '/community/language/', label: 'Ekegusii language', group: 'Our heritage', icon: 'learn', desc: 'An open Ekegusii text and speech dataset' },
    { href: '/community/share/', label: 'Share or volunteer', group: 'Take part', icon: 'check', desc: 'Offer a story, record with us, send a concern' },
  ] },
  { href: '/watch/', label: 'Watch', icon: 'camera', overview: 'Watch', groups: ['Also on Watch'],
    desc: 'Our videos, each with the figures and sources behind it.', pages: [
    { href: '/explainers/', label: 'Explainers', icon: 'stories', group: 'Also on Watch', desc: 'Short guides to big topics' },
    { href: '/number-of-the-week/', label: 'Number of the week', icon: 'chart', group: 'Also on Watch', desc: 'One figure, explained' },
  ] },
  { href: '/about/', label: 'About', icon: 'source', overview: 'About', groups: ['Nyamira County', 'Work with us', 'Legal'],
    desc: 'Nyamira County, how to reach us and work with us, and our legal pages.', pages: [
    { href: '/about/nyamira/', label: 'About Nyamira County', group: 'Nyamira County', icon: 'map', desc: 'Facts, figures and places to know' },
    { href: '/administration/duties/', label: 'How it is governed', group: 'Nyamira County', icon: 'government', desc: 'What the county must do, and how' },
    { href: '/administration/', label: 'Who holds each seat', group: 'Nyamira County', icon: 'people', desc: 'Each county seat and its holder, with sources' },
    { href: '/about/glossary/', label: 'Glossary', group: 'Nyamira County', icon: 'learn', desc: 'Terms explained' },
    { href: '/about/contact/', label: 'Contact us', group: 'Work with us', icon: 'question', desc: 'Messages, tips, concerns and corrections' },
    { href: '/about/careers/', label: 'Careers and volunteering', group: 'Work with us', icon: 'people', desc: 'Ward correspondents and culture volunteers' },
    { href: '/about/partners/', label: 'Partner with us', group: 'Work with us', icon: 'data', desc: 'Data, research and sponsorship', also: ['/about/data/'] },
    { href: '/about/publisher/', label: 'Publisher', group: 'Legal', icon: 'source', desc: 'Who publishes Nyamira Daily' },
    { href: '/terms/', label: 'Terms and reuse', group: 'Legal', icon: 'source', desc: 'Our data licence and its limits' },
    { href: '/privacy/', label: 'Privacy', group: 'Legal', icon: 'check', desc: 'What we keep, and what we never do' },
    { href: '/how-we-work/#corrections', label: 'Corrections', group: 'Legal', icon: 'question', desc: 'What we corrected, and how to tell us', also: ['/how-we-work/'] },
    { href: '/right-of-reply/', label: 'Right of reply', group: 'Legal', icon: 'question', desc: 'How anyone named can respond' },
  ] },
];

// A section's pages in their groups, in order, for the switcher and the side list (decision #119).
export function groupsOf(section) {
  const names = section.groups ?? [...new Set(section.pages.map((p) => p.group ?? ''))];
  return names.map((label) => ({ label, pages: section.pages.filter((p) => (p.group ?? '') === label) })).filter((g) => g.pages.length);
}

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
