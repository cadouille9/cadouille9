# 🌱 VSME Report Studio

**A guided web app that lets EU SMEs create a sustainability report aligned with
the VSME standard (EFRAG Basic Module, Dec 2024) — and a micro-business you can
run in ~4 hours a week.**

Large companies and banks must report on their value chains, so they push ESG
questionnaires down to their SME suppliers. The EU's official answer for SMEs
is the **VSME standard**. Consultants charge €5,000–15,000 for such a report;
this tool guides an SME through it in a day. You sell the PDF export for €149.

## What the app does

- **Guided questionnaire** covering all 11 VSME Basic Module disclosures
  (B1–B11), in plain language, fully bilingual **English / German**, with hints
  on where to find every number (utility bill, payroll, waste contractor…).
- **Built-in CO₂ calculator**: users enter kWh and litres from their invoices;
  Scope 1 & 2 emissions, energy mix, renewable share and GHG intensity are
  computed live with transparent, overridable emission factors.
- **Polished PDF report** with cover page, KPI tables, and a methodology note —
  generated via the browser's print-to-PDF with a dedicated print stylesheet.
- **Freemium paywall**: everything is free to fill in; the watermark-free
  export requires a license key (Gumroad, Lemon Squeezy, or self-issued
  offline keys — see `SETUP.md`).
- **Radical privacy** (and your best sales argument): a 100% static app. Data
  lives only in the user's browser (localStorage + JSON backup download).
  No accounts, no server, no cookies, no tracking.

## Why it's cheap to run

| | |
|---|---|
| Hosting | GitHub Pages — **€0**, nothing to patch |
| Backend | none — nothing to break at 3am |
| Payments | Gumroad / Lemon Squeezy as merchant of record — **they handle EU VAT** |
| Stack | plain HTML/CSS/JS ES modules, **zero dependencies, zero build step** |

## Repository layout

```
carbon-accounting/
├── index.html          Landing page (bilingual, self-contained)
├── app.html            The app shell
├── css/main.css        App + report styles
├── css/print.css       Print stylesheet → A4 PDF
├── js/config.js        ★ THE file you edit to start selling (price, keys…)
├── js/schema.js        VSME B1–B11 questionnaire (bilingual)
├── js/calc.js          Energy & GHG math (pure, unit-tested)
├── js/report.js        Report HTML generator (pure, unit-tested)
├── js/license.js       License validation (gumroad | lemonsqueezy | offline)
├── js/store.js         localStorage + JSON backup
├── js/i18n.js          UI strings EN/DE
├── js/app.js           Wizard UI
├── tools/generate-keys.mjs   License key generator for offline sales
└── tests/              Unit tests + headless-browser smoke test
```

## Development

No build step. Serve the folder and open it:

```bash
python3 -m http.server 8080     # then open http://localhost:8080
```

### Tests

```bash
node --test 'tests/*.test.mjs'      # logic: calculations, schema, report, backup
node tests/smoke.browser.mjs        # full user flow in headless Chromium
```

CI runs both on every push (`.github/workflows/test.yml`). Pushes to `main`
auto-deploy to GitHub Pages (`.github/workflows/deploy-pages.yml`).

## Getting to revenue

- **`SETUP.md`** — the 5-day launch plan (deploy → payments → legal → QA → first customers).
- **`MAINTENANCE.md`** — the 4-hours-a-week operating routine.

## Disclaimer

VSME Report Studio is an independent preparation aid aligned with the VSME
standard; it is not affiliated with EFRAG or the European Commission and does
not provide legal advice or audit services.
