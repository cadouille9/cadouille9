# 🔧 MAINTENANCE — the 4-hours-a-week routine

The product has no servers, no database, no dependencies and no build step.
"Maintenance" is therefore mostly a *business* routine, not a technical one.

## Weekly (≈ 4 hours)

| Time | Task |
|---|---|
| ~1h | **Support inbox.** Typical questions are content questions ("where do I find my NACE code?"), not bugs. Answer, and when a question repeats, add its answer to the FAQ on the landing page or as a `help` text in `js/schema.js` — that's how support time shrinks every month. |
| ~2h | **One distribution action.** One LinkedIn post, or 10 outreach messages to multipliers (tax advisors, chambers, consultants), or one listing/backlink. Never zero, never more than one focused action. |
| ~30m | **Sales & fulfillment check.** Gumroad/Lemon Squeezy dashboard: sales, refunds, payout. If you sell offline keys manually: send pending keys. |
| ~30m | **Health check.** Open the live app, fill one field, export the PDF preview once. GitHub → Actions: CI green? (It runs the full browser smoke test on every push.) |

## Monthly (≈ 1 hour, inside the weekly budget)

- Skim EFRAG/VSME news (a Google Alert for "VSME standard" is enough).
  If EFRAG publishes guidance updates, adjust wording in `js/schema.js`.
- Review which questionnaire step users ask about most — improve that one
  `help` text.

## Yearly (≈ half a day, each January)

1. **Update emission factors** in `js/calc.js` (`EMISSION_FACTORS`):
   grid electricity factors (UBA for DE, AIB European Residual Mix / EEA for
   EU averages) and fuel factors (UK DEFRA/BEIS conversion factors are the
   de-facto public reference). The values are commented in the file; the
   report discloses whatever factors are used, so this is a transparency
   update, not a correctness emergency.
2. **New reporting year = new sales.** Email past buyers: "Time for your
   2027 report — your data is still in your browser, update the numbers and
   export." That's the cheapest revenue you'll ever earn.
3. Bump `version` in `js/config.js`, refresh the year in legal pages.

## When something breaks (rare by construction)

- **App down?** It's GitHub Pages — check https://www.githubstatus.com, then
  Actions → last deploy run. Re-run the workflow.
- **License checks failing?** Only relevant for `gumroad`/`lemonsqueezy`
  providers — check the provider's status page. The `offline` provider cannot
  fail (validation is local).
- **A field/formula is wrong?** Fix it in `js/schema.js` / `js/calc.js`,
  run `node --test 'tests/*.test.mjs'`, push to `main` → auto-deploy.

## What NOT to do

- Don't add a backend, accounts, or a database. The zero-ops property is the
  moat that makes this sustainable at 4h/week.
- Don't add features before 20 paying customers ask for the same one.
  (The recorded exception: the VSME *Comprehensive Module* (C1–C9) as a
  higher-priced tier once corporate buyers ask for it.)
