# 🚀 SETUP — CarbonLens, from repo to revenue

The app is finished and tested. This plan takes ~3 focused days; it pairs
well with the VSME Report Studio launch (same payment provider, same legal
pages, same audience of sustainability-minded SMEs and agencies).

---

## Day 1 — Go live

1. **Enable GitHub Pages**: repo → *Settings → Pages → Source: GitHub Actions*.
   Every push to `main` auto-deploys. Your tool is live at
   `https://cadouille9.github.io/website-analyser/`.
2. **Own domain** (~€10/yr, strongly recommended for this one — it's a
   shareable free tool, the domain IS the marketing): e.g. `carbonlens.eu`.
   CNAME → `cadouille9.github.io`, set it in Pages settings.
3. **Optional, free PSI API key**: the tool works without one, but a key
   raises the Google quota. Create one (free) at
   https://developers.google.com/speed/docs/insights/v5/get-started,
   restrict it to the PageSpeed API + your domain, paste into `js/config.js`.

## Day 2 — Payments

Same playbook as VSME Report Studio (see that repo's SETUP.md for details):

1. Gumroad product *"CarbonLens agency license"*, **€149/year**
   (set it as a membership/recurring product for annual renewals, or sell
   yearly keys manually at first).
2. Either enable Gumroad license keys (`provider: 'gumroad'` + product ID in
   `js/config.js`), or generate offline keys:
   `node tools/generate-keys.mjs 100 > keys-PRIVATE.txt` and paste the hash
   block into `js/config.js`.
3. **Remove the DEMO hash** (key `LENS-DEMO-2026-0001`) from `js/config.js`.
4. Set `purchaseUrl` and `supportEmail`. Test the full buy → key → unlock →
   branded PDF flow once.

## Day 3 — Legal + distribution

1. **Impressum + privacy policy** in the footer (`index.html`, `#imprint`
   placeholder). Privacy note: no cookies/tracking; the URL a visitor
   analyses is sent to Google (PageSpeed Insights) and the hostname to The
   Green Web Foundation — say so.
2. **Distribution — the free tool is the funnel:**
   - The audit itself is shareable: post audits of well-known German sites
     on LinkedIn ("X.de emits Y g CO₂ per visit — here's what they could fix").
     Tag nobody, shame nobody, teach something. Repeat weekly.
   - Direct outreach to web agencies with a sustainability page: "White-label
     website carbon audits for your clients, €149/yr." Ten emails beat any ad.
   - Submit to tool directories (green web tools lists, agency toolkits).
   - Cross-sell: every VSME Report Studio customer has a website and B2B
     customers asking about digital sustainability.

---

## Pricing ladder (later, zero code)

| Offer | Price |
|---|---|
| On-screen audits | free, forever (that's the funnel) |
| Agency white-label license | €149 / year |
| "Audit + 1h improvement workshop" (you or partner agencies) | €490 |
| Monitoring retainer (you re-audit monthly, send the PDF) | €49 / month |

## How the paywall works (honest note)

Static app → the license gate runs client-side and a developer could bypass
it. The buyers are agencies putting their name on a client deliverable —
they need the license to be legitimate, not the watermark removed. Zero
infrastructure is worth this trade-off; escalate to a Cloudflare Worker
only if real abuse ever shows up.
