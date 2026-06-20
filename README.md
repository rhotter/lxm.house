# Light and Matter

## Getting Started

Install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Link redirects

The short links on the homepage are first-party redirects defined in `next.config.mjs`
(`async redirects()`), replacing the old `*.lxm.house` subdomains (which were plain-http
and triggered browser insecure-link warnings):

- `/zinenight` → the mmm.page zine
- `/art` → the Notion art brainstorm

To add another, append an entry to that array.

## Amazon feed (`/amazon`)

`/amazon` ("Things Aayush buys") renders a **static** snapshot committed at
`app/amazon/things-data.json`, so it loads instantly. The snapshot is parsed from
Aayush's live post at [blog.aayushg.com/things](https://blog.aayushg.com/things).

- `scripts/update-amazon-feed.mjs` — zero-dependency Node script (Node 18+) that fetches
  `/things`, extracts every Amazon item (name, price, section, description), preserves a
  `firstSeen` timestamp per item so newly-added entries can surface as "Recently added",
  and writes the JSON. Regenerate locally with `node scripts/update-amazon-feed.mjs`.
- `scripts/sync-amazon-feed.sh` — cron entrypoint for a small always-on box (e.g. a GCP
  e2-micro). It regenerates the snapshot and, only if it changed, commits + pushes to
  `main`, which redeploys the site. See the header of that script for VM setup + the
  crontab line.

> Note: `amazon-sp-api` and `paapi5-nodejs-sdk` in `package.json` are leftovers from the
> old SP-API-based tracker and are no longer used — safe to remove.
