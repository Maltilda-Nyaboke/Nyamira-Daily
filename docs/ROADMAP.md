# Roadmap

Status as of 16 Nov 2026, after the refocus on the map and the money (`docs/refocus/PLAN.md`, decisions #110 to #118). The history of earlier phases is in `docs/STATUS_ARCHIVE.md` and the decisions log.

## Built

- **Map:** the county map (wards, facilities and ward money views), 20 ward pages, 686 place pages (facilities, roads, county projects) with status, condition, last check, who is responsible and what you can do; Health and Education; Report a place.
- **Money:** the FY2025/26 budget by department and programme, spending to date, revenue, twelve years of history, the Nyamira economy, Farming, one contracts page with search, the budget calendar with the Assembly's money laws, fees.
- **Watch:** video pages tied to places and figures (none published yet), explainers, the number of the week.
- **Administration:** who holds each seat; what the county must do (Fourth Schedule).
- **About:** who runs us, how we work, right of reply, open data, glossary, terms, privacy.
- **Living data:** three KoboToolbox forms, a four-tab Google Sheet layout, the sync, and the changes list (`/review/changes/`).

## Waiting for a person

| What | What is needed |
|---|---|
| Field data | Create the KoboToolbox projects from `fieldwork/kobo/*.xlsx`, set up the Google Sheet, set the variables in `fieldwork/README.md`, run `npm run living:sync` |
| The first videos | Publish on YouTube, add a row to the sheet's videos tab |
| Corrections and reports from the site | The Cloudflare D1 review workflow is built; it needs Cloudflare set up, a retention period, reviewer access and someone to monitor it |
| Contact channel | A WhatsApp number or email in `src/config.js` |
| Kenya Budget Explained | Its own repository (phase R7 of the plan) |

## Next (suggested order)

1. **First field visits.** Start with the 125 health facilities: visit, film where useful, record on the place visit form.
2. **Add missing places** from `src/data/living/new-places.json` to the registry after each sync.
3. **The economy, deeper:** load the KNBS Gross County Product report; find milk prices and tea volumes; record market prices on market days.
4. **Facility locations:** 178 of the 247 facilities have no coordinates; the place visit form records them.
5. **Domain and hosting:** choose a domain, set it for the build, deploy to Cloudflare Pages with a rebuild on every commit to `main`.

## Recurring jobs

| How often | Job |
|---|---|
| After each field day | Approve submissions in Kobo, run the sync, check `/review/changes/`, rebuild |
| Weekly | Number of the week (`src/content/numbers/`) |
| Monthly | New Assembly Hansards: money bills and Acts (`assembly.json`) |
| Each Dec–Mar | New Auditor-General reports (`audit.json`) |
| After each Controller of Budget report | The money registry (`data/county/nyamira/`) |
| Each June/July | The new budget's ward lines and departments |
| As they happen | Seat holders (by-elections, court rulings), corrections |

## Before public launch

- Check the Fourth Schedule summaries on `/administration/duties/` against the official text.
- Native-speaker review of the Kiswahili summaries.
- Confirm the Speaker's position and the Rigoma and Bokeira MCA court outcomes.
- Set the domain, the contact channel and privacy-friendly analytics.
