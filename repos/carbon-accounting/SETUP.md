# 🚀 SETUP — from this repo to first revenue in 5 days

Everything below assumes ~2–4 focused hours per day. The app itself is
finished and tested; these five days are about **launching**, not coding.

---

## Day 1 — Put it live

1. **Enable GitHub Pages**: repo → *Settings → Pages → Source: GitHub Actions*.
   The included workflow deploys the app on every push to `main`. Your app is
   now at `https://cadouille9.github.io/carbon-accounting/` (landing) and
   `…/app.html`.
2. **Recommended — own domain** (~€10/year): buy e.g. `vsme-studio.de` or
   `vsme-report.eu` at any registrar, add a `CNAME` record pointing to
   `cadouille9.github.io`, then set the custom domain in the Pages settings.
   A real domain roughly doubles conversion for a paid tool.

**Done when:** you can open the landing page on your phone.

---

## Day 2 — Payments (pick ONE path)

Target price: **€149 per report year** (a consultant costs 30–100× more;
don't undercharge). You can A/B a €99 launch price with a discount code.

### Path A — Gumroad (fastest, recommended to start)

Gumroad is a **merchant of record**: they sell to the customer and handle EU
VAT/invoices — that's the "without too much effort" part.

1. Create a product *"VSME Report Studio — license key"*, price €149.
2. In the product settings, enable **"Generate a unique license key per sale"**.
3. Copy the product ID (product settings) into `js/config.js`:
   ```js
   provider: 'gumroad',
   gumroadProductId: 'YOUR_PRODUCT_ID',
   purchaseUrl: 'https://YOURNAME.gumroad.com/l/vsme',
   supportEmail: 'you@yourdomain.eu',
   ```
4. Buy your own product once (create a 100% discount code) and activate the
   key in the app → watermark disappears. Refund flow: refunded keys are
   rejected automatically.

### Path B — Offline keys (works with ANY provider: Stripe, invoice, bank transfer)

1. Generate keys: `node tools/generate-keys.mjs 200 > keys-PRIVATE.txt`
   (this file is gitignored — **never commit it**).
2. Paste the printed `offlineKeyHashes: [...]` block into `js/config.js`
   and set `provider: 'offline'`.
3. Deliver one key per sale: attach the key list as the product "content" on
   Gumroad/Lemon Squeezy (auto-delivery), or email keys manually for
   invoice-based sales to bigger clients.

### Either path — before you publish

- **Remove the DEMO hash** from `offlineKeyHashes` in `js/config.js`
  (it's marked with a comment; the demo key is `VSME-DEMO-2026-0001`).
- Set `purchaseUrl` and `supportEmail`, commit, push to `main` → auto-deploys.

> **How the paywall works (honest note):** the app is fully static, so the
> gate runs client-side. A developer could bypass it with browser dev tools.
> Your customers are SME managers producing an official document for their
> customers and banks — this risk is negligible at €149, and it's the price
> of zero infrastructure. If it ever becomes a real problem, that's a luxury
> problem: move validation behind a €0 Cloudflare Worker then.

**Done when:** a test purchase → key → unlock → clean PDF works end-to-end.

---

## Day 3 — Legal basics (Germany/EU, ~2h)

1. **Impressum**: legally required in Germany even for a side business. Add
   name, address, email to the landing page footer (`index.html`, the
   `#imprint` placeholder marks the spot).
2. **Privacy policy**: unusually easy here — the app stores data only in the
   user's browser and you set no cookies. Disclose: GitHub Pages server logs
   (IP addresses, by GitHub), the license check request to Gumroad/Lemon
   Squeezy on activation, and the payment provider's own processing.
   A generator (e.g. e-recht24) plus those three points is fine.
3. **Terms**: state that the tool is a preparation aid, no legal advice, no
   audit; 14-day refund policy (Gumroad handles refunds mechanically).
4. **Side-business check**: as a Detecon/DTAG employee, get your employer's
   *Nebentätigkeitsgenehmigung* (secondary employment approval) if you don't
   have one yet — usually a formality for a non-competing side product, but
   do it before you invoice the first euro.

**Done when:** footer shows Impressum + privacy policy and you've sent the
side-business form.

---

## Day 4 — Quality pass

1. Fill in the questionnaire for a realistic fictional company (or your
   Friseur/Handwerker friend's real one — that's your first case study).
2. Export the PDF in German **and** English. Read every page like a picky
   customer. Fix texts directly in `js/schema.js` / `index.html`.
3. Check on a phone; check Chrome + Firefox + Safari print output.
4. Ask two people from your network to try it for 15 minutes while you watch.
   Fix the top 3 confusions they hit. Nothing else.

**Done when:** you'd be comfortable showing the PDF to a client of your own.

---

## Day 5 — First customers (distribution beats features)

Your unfair advantage is your consulting network. Work it:

1. **LinkedIn launch post** (DE): "Großkunde schickt euch einen
   ESG-Fragebogen? Hier ist der offizielle EU-Weg für KMU, einmal sauber zu
   antworten — in einem Tag statt in Wochen." Show a screenshot of the
   report. Post, then DM it to 10 people who serve SMEs.
2. **Multiplier outreach** (this is the channel): Steuerberater,
   IHK/Handwerkskammer contacts, SME-focused consultants, EcoVadis/bank
   supply-chain teams. Offer: 3 free license keys to try with their clients,
   or a 20% partner code. One tax advisor with 80 SME clients is worth more
   than 10,000 impressions.
3. **Listings** (30 min each, evergreen SEO): relevant tool directories,
   "VSME Tools" lists that industry associations maintain, an answer on the
   common "Wie beantworte ich den ESG-Fragebogen meines Kunden?" questions in
   LinkedIn groups / forums, each linking to the landing page.
4. Set up a free **Plausible/GoatCounter**-style counter *only if you want
   numbers* — remember to then update the privacy policy. Skipping analytics
   entirely is also fine at this stage; sales are the only metric that counts.

**Done when:** the post is live and 10 personal messages are sent.

---

## Pricing & upsell ladder (later, zero code required)

| Offer | Price | Effort |
|---|---|---|
| Self-service license (this product) | €149 | none |
| "Done-with-you": 2h video call while they fill it in | €490 | 2h/sale |
| White-label for consultants/tax advisors (10-key bundle) | €990 | none |
| Next year's report (returning customers, new reporting year) | €149/yr | none |

Realistic math: 4 sales/month self-service + 1 done-with-you ≈ **€1,100/month**
for ~4h/week — and each done-with-you call is market research for free.
