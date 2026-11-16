// Content collections: Markdown files anyone can add (one file per entry, frontmatter as below).
// Entries with `draft: true` (the EXAMPLE entries) are left out of the built site unless ND_DRAFTS=1.
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const source = z.object({ name: z.string(), url: z.string().optional().default(''), page: z.string().optional(), date: z.coerce.date().optional() });
const evidence = z.enum(['verified', 'audit', 'official', 'unverified']);
const photo = z.object({ src: z.string(), alt: z.string(), credit: z.string(), consent: z.boolean().default(false) });
const publication = { draft: z.boolean().default(false), publishAt: z.coerce.date().optional() };
const md = (dir: string) => glob({ pattern: '**/*.md', base: `./src/content/${dir}` });

// 1.6 Number of the week
const numbers = defineCollection({ loader: md('numbers'), schema: z.object({
  week: z.coerce.date(), figure: z.string(), sentence: z.string(), explanation: z.string(),
  evidenceLabel: evidence, sources: z.array(source).min(1), radioScript: z.string(), swSummary: z.string().optional(), ...publication,
}) });

// 1.7 Explainers, fact-checks, what's working, people, heritage
const explainers = defineCollection({ loader: md('explainers'), schema: z.object({
  title: z.string(), summary: z.string(), topic: z.string(), sources: z.array(source).min(1), updated: z.coerce.date(),
  swSummary: z.string().optional(), readingLevel: z.enum(['easy', 'standard']).default('easy'), ...publication,
}) });
// 1.8 Alerts and incidents (docs/EDITORIAL_RULES.md section 11)
const projectlogs = defineCollection({ loader: md('projectlogs'), schema: z.object({
  projectId: z.string(), date: z.coerce.date(), photo: photo.optional(), note: z.string(),
  observer: z.string().default('Volunteer'), consent: z.boolean(), ...publication,
}) });

// Today: news briefs (decision #63, docs/EDITORIAL_RULES.md section 13): short, dated, sourced, each tied to the
// data it changes, so news never stands apart from (or above) the data.
const pageLink = z.object({ label: z.string(), href: z.string().startsWith('/') });
// Today: the daily show (YouTube) and NY Watch, the podcast with decision makers (decision #63, section 14).
// Video loads only when the reader taps it; audio uses the browser's player and loads nothing until played.
// Community: the cultural knowledge archive (decision #65, section 12). Recorded only with the knowledge
// holder's consent; only what they agreed to make public is published. Medicine is heritage, never advice.
export const collections = {numbers, explainers, projectlogs };
