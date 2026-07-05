# 🔧 MAINTENANCE — CarbonLens

No servers, no database, no dependencies. The routine below fits inside the
same ~4 h/week you already spend on VSME Report Studio — the two products
share support inbox, payment provider and audience.

## Weekly (≈ 1–2 h when run alongside VSME Studio)

| Time | Task |
|---|---|
| ~30m | Support inbox. Most questions are "why is my score X?" — the report's methodology section answers them; link it. |
| ~1h | One distribution action: a published audit of a known site on LinkedIn, or 10 outreach emails to agencies. |
| ~15m | Health check: run one live audit on the production URL (this exercises PSI + greencheck + render). CI green on the last push? |
| ~15m | Sales dashboard + key fulfillment (if selling offline keys). |

## Monthly

- Renewals: if selling yearly keys manually, check which licenses expire and
  send a friendly renewal mail (offline keys don't expire technically —
  renewal is a business convention; Gumroad memberships automate it).

## Yearly (half a day, each January)

1. **Model constants** in `js/co2.js`: the Sustainable Web Design model and
   grid intensity get revised (watch sustainablewebdesign.org / co2.js
   releases). Update `SWD`, `RATING_SCALE` if a new version is out — the
   report's methodology text in `js/i18n.js` states the version, keep it in
   sync.
2. **API drift check**: PageSpeed Insights occasionally renames Lighthouse
   audits. Run the unit tests + one live audit; if an opportunity audit
   disappeared, update `OPPORTUNITY_AUDITS` in `js/api.js` and `REC_TEXTS`
   in `js/recs.js`.
3. Bump `version` in `js/config.js`, refresh legal pages.

## If something breaks

- **"Quota exhausted" errors for visitors**: add/rotate the free PSI API key
  in `js/config.js` (Day 1 of SETUP.md).
- **Greencheck failing**: it fails soft (shows "could not be verified") —
  check https://www.thegreenwebfoundation.org status; nothing to do in the app.
- **App down**: GitHub Pages status → re-run the deploy workflow.

## What NOT to do

Don't add crawling of whole sites, scheduled monitoring, or user accounts to
the free tool — that's the €49/month retainer service (you run it manually)
or a future paid tier, not free infrastructure.
