#!/usr/bin/env bash
# Cron entrypoint for keeping the /amazon feed fresh from blog.aayushg.com/things.
#
# Run this on a small always-on box (e.g. a GCP e2-micro). It pulls latest main,
# regenerates app/amazon/things-data.json from the live /things post, and — only if the
# snapshot actually changed — commits and pushes. The push triggers the site's redeploy,
# so the static /amazon page always loads instantly while staying current.
#
# Setup on the GCP VM:
#   1. Install Node 18+ and git.
#   2. Clone with a push-capable remote (deploy key or a PAT in the remote URL):
#        git clone git@github.com:rhotter/lxm.house.git ~/lxm.house
#   3. Set git identity for the commits:
#        git -C ~/lxm.house config user.name  "amazon-feed-bot"
#        git -C ~/lxm.house config user.email "bot@lxm.house"
#   4. Add to crontab (every 6 hours; adjust as you like) — note REPO_DIR:
#        0 */6 * * * REPO_DIR=$HOME/lxm.house /bin/bash $HOME/lxm.house/scripts/sync-amazon-feed.sh >> $HOME/amazon-feed.log 2>&1
set -euo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BRANCH="${BRANCH:-main}"
cd "$REPO_DIR"

echo "[$(date -u +%FT%TZ)] sync start"

# Start from a clean, up-to-date main so the bot never fights a human edit.
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

node scripts/update-amazon-feed.mjs

# Nothing to do if the parsed snapshot is byte-identical to what's committed.
if git diff --quiet -- app/amazon/things-data.json; then
  echo "[$(date -u +%FT%TZ)] no changes; nothing to push"
  exit 0
fi

git add app/amazon/things-data.json
git commit -m "chore(amazon): sync /things feed snapshot"
git push origin "$BRANCH"
echo "[$(date -u +%FT%TZ)] pushed updated snapshot"
