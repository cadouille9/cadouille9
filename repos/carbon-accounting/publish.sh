#!/usr/bin/env bash
# One-time publish of this folder to github.com/cadouille9/carbon-accounting.
# Run from inside this folder on your machine (needs git + GitHub auth):
#   bash publish.sh
set -euo pipefail

REPO="https://github.com/cadouille9/carbon-accounting.git"

rm -rf .git
git init -b main
git add -A
git commit -m "Add VSME Report Studio — sellable sustainability-report web app for EU SMEs"
git remote add origin "$REPO"
# The repo was created with a README; overwrite its history with the product.
git push -u origin main --force

echo
echo "✅ Published. Now enable GitHub Pages: Settings → Pages → Source: GitHub Actions"
echo "   Then follow SETUP.md from Day 2."
