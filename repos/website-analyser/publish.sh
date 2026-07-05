#!/usr/bin/env bash
# One-time publish of this folder to github.com/cadouille9/website-analyser.
# Run from inside this folder on your machine (needs git + GitHub auth):
#   bash publish.sh
set -euo pipefail

REPO="https://github.com/cadouille9/website-analyser.git"

rm -rf .git
git init -b main
git add -A
git commit -m "Add CarbonLens — website CO₂ audit tool with white-label agency reports"
git remote add origin "$REPO"
# The repo was created with a README; overwrite its history with the product.
git push -u origin main --force

echo
echo "✅ Published. Now enable GitHub Pages: Settings → Pages → Source: GitHub Actions"
echo "   Then follow SETUP.md from Day 1, step 2."
