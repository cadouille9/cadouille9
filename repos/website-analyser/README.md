# 🌍 CarbonLens — Website CO₂ Audit

**Enter a URL, get a carbon audit of the website in ~30 seconds — and sell
white-label PDF audit reports to agencies and their clients.**

The average web page emits about half a gram of CO₂e per view; multiplied by
real traffic that's tonnes per year for a busy site. Sustainability-minded
companies want this number (and how to improve it), and web agencies want to
sell exactly that advice. CarbonLens gives the audit away free and charges
agencies **€149/year** for unlimited white-label reports with their own logo.

## What the app does

- **Real measurements, not guesses**: runs a Lighthouse audit via the free
  Google PageSpeed Insights API (mobile emulation) and reads the actual
  transfer size of every resource.
- **Green hosting check** via The Green Web Foundation's public API.
- **Science-based CO₂ estimate**: the Sustainable Web Design model v3
  (the same model behind websitecarbon.com), with the Digital Carbon Rating
  scale (A+ … F) and "cleaner than X% of pages" percentile.
- **Annual impact**: monthly page views → kg CO₂e/year, translated into km
  by car, trees and smartphone charges.
- **Ranked recommendations**: Lighthouse optimisation opportunities converted
  into plain-language advice, ordered by grams of CO₂ saved per view —
  bilingual **English / German**.
- **White-label PDF reports** (the paid part): agency name + logo + client
  field on a clean A4 report via print-to-PDF. Locked behind a license key
  (Gumroad, Lemon Squeezy, or self-issued offline keys).

## Why it's cheap to run

100% static app — GitHub Pages hosting (€0), no backend, no database, zero
npm dependencies, no build step. The two external APIs are free and called
directly from the visitor's browser. Payment via merchant-of-record
(Gumroad/Lemon Squeezy), so EU VAT is handled for you.

## Repository layout

```
website-analyser/
├── index.html          The whole product: landing + analyser + report
├── css/main.css        App + report styles
├── css/print.css       Print stylesheet → A4 PDF
├── js/config.js        ★ THE file you edit to start selling
├── js/co2.js           SWD v3 CO₂ model, ratings, equivalents (pure)
├── js/api.js           PageSpeed Insights + greencheck fetchers (parse = pure)
├── js/recs.js          Bilingual recommendation engine (pure)
├── js/report.js        White-label report HTML generator (pure)
├── js/license.js       License validation (gumroad | lemonsqueezy | offline)
├── js/i18n.js          UI strings EN/DE
├── js/app.js           UI wiring
├── tools/generate-keys.mjs   License key generator for offline sales
└── tests/              22 unit tests + stubbed-API browser smoke test
```

## Development

```bash
python3 -m http.server 8080     # then open http://localhost:8080
```

### Tests

```bash
node --test 'tests/*.test.mjs'      # model, parsing, recommendations, report
node tests/smoke.browser.mjs        # full user flow (APIs stubbed, offline)
```

CI runs both on every push; pushes to `main` auto-deploy to GitHub Pages.

## Getting to revenue

- **`SETUP.md`** — the launch plan (deploy → payments → legal → distribution).
- **`MAINTENANCE.md`** — the ~4-hours-a-week operating routine.

## Notes on accuracy

Estimates follow the public Sustainable Web Design model and are intended for
comparison, communication and improvement tracking — the report's methodology
section says exactly what was measured and how. PageSpeed Insights works
without an API key for light usage; add a free key in `js/config.js` for
higher quotas.
