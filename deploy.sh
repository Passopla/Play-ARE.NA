#!/usr/bin/env bash
# Build the game branch and publish it to GitHub Pages (gh-pages branch), which the Amanzi site
# embeds. Vercel keeps serving master. Usage: ./deploy.sh
set -e
cd "$(dirname "$0")"

# MSYS_NO_PATHCONV: Git Bash would turn the /Play-ARE.NA/ base into a Windows path
MSYS_NO_PATHCONV=1 VITE_ARENA_API=https://www.amanziconnexions.com/api/arena npx vite build --base=/Play-ARE.NA/ --outDir pages-dist

PAGES=$(mktemp -d)
cp -r pages-dist/. "$PAGES"
touch "$PAGES/.nojekyll"
git -C "$PAGES" init -q -b gh-pages
git -C "$PAGES" add -A
git -C "$PAGES" commit -q -m "Game build $(git rev-parse --short HEAD)"
git -C "$PAGES" push -q -f "$(git remote get-url origin)" gh-pages
rm -rf "$PAGES" pages-dist
