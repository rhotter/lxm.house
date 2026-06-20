#!/usr/bin/env node
// Fetches Aayush's "/things" live blog post, parses every Amazon item out of it,
// and writes app/amazon/things-data.json — the static snapshot the /amazon page renders.
//
// WHY this exists: the old amazon.lxm.house tracker pulled "real-time orders" from
// the Amazon SP-API, which broke (API access). Instead, Aayush's purchases live in his
// hand-maintained live post at blog.aayushg.com/things. This script turns that post into
// a structured feed. It is meant to run on a cron (e.g. a small GCP VM) that then commits
// + pushes the regenerated JSON, which redeploys the site. See README "Amazon feed".
//
// NOTE: zero dependencies on purpose — runs with a bare `node` on any box, no `npm install`.
// Node 18+ (global fetch). Override the source with THINGS_URL, or feed local HTML via
// THINGS_HTML_FILE (used to regenerate offline / in tests).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const SOURCE_URL = process.env.THINGS_URL || "https://blog.aayushg.com/things";
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../app/amazon/things-data.json");

// REASON: minimal entity decoder instead of a library — the post only uses this handful
// of named/numeric entities. Order matters: decode &amp; last so we don't double-decode.
function decodeEntities(s) {
  return s
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&");
}

function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

function parse(html) {
  // Map each section heading to its character offset so we can label items by position.
  const sections = [];
  const headingRe = /<h1 id="([^"]+)">([\s\S]*?)<\/h1>/g;
  for (let m; (m = headingRe.exec(html)); ) {
    const id = m[1];
    if (id === "table-of-contents") continue; // not a product section
    sections.push({ index: m.index, name: stripTags(m[2]) });
  }
  const sectionAt = (pos) => {
    let name = "";
    for (const s of sections) {
      if (s.index <= pos) name = s.name;
      else break;
    }
    return name;
  };

  // Every product entry starts with `<strong><a href="https://amzn.to/...">NAME</a>`.
  // We slice from one such marker to the next so the chunk holds exactly one item
  // (its price + description), independent of <br>/<p> nesting.
  const itemRe = /<strong>\s*<a href="(https:\/\/amzn\.to\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const starts = [];
  for (let m; (m = itemRe.exec(html)); ) {
    starts.push({ pos: m.index, url: m[1], name: stripTags(m[2]), afterAnchor: itemRe.lastIndex });
  }

  const items = [];
  for (let i = 0; i < starts.length; i++) {
    const cur = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1].pos : html.length;
    const chunk = html.slice(cur.pos, end);

    // Price: first "$NN" in the chunk (entries read "... </a> - $25.").
    const priceMatch = chunk.match(/\$\s?([\d,]+)/);
    const price = priceMatch ? `$${priceMatch[1].replace(/\s/g, "")}` : null;

    // Description: text after the closing </strong> (name+price live inside <strong>),
    // bounded to this entry's line. Each entry ends at a <br> (next entry follows) or,
    // for the last entry in a block, at </p> / the next heading. Without this bound the
    // final item on the page would swallow the footer markup and trailing <script>.
    let afterStrong = chunk.slice(chunk.indexOf("</strong>") + "</strong>".length);
    const boundary = afterStrong.search(/<br\b|<\/p>|<h[1-6]\b|<footer\b|<script\b/i);
    if (boundary !== -1) afterStrong = afterStrong.slice(0, boundary);
    let description = stripTags(afterStrong);
    // Drop a leading stray "." left over from prices written as "$10</strong>."
    description = description.replace(/^\.\s*/, "");

    items.push({ name: cur.name, url: cur.url, price, section: sectionAt(cur.pos), description });
  }
  return items;
}

async function loadHtml() {
  if (process.env.THINGS_HTML_FILE) {
    return readFile(process.env.THINGS_HTML_FILE, "utf8");
  }
  const res = await fetch(SOURCE_URL, {
    headers: { "user-agent": "lxm.house-amazon-feed/1.0 (+https://lxm.house/amazon)" },
  });
  if (!res.ok) throw new Error(`fetch ${SOURCE_URL} -> ${res.status}`);
  return res.text();
}

async function readPrevious() {
  try {
    return JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    return null; // first run, or file missing
  }
}

async function main() {
  const now = new Date().toISOString();
  const html = await loadHtml();
  const parsed = parse(html);
  if (parsed.length === 0) {
    // REASON: refuse to overwrite a good snapshot with an empty one if the post layout
    // changed or the fetch returned junk — the cron would otherwise blank the live page.
    throw new Error("parsed 0 items — refusing to overwrite snapshot (source layout may have changed)");
  }

  // Carry forward firstSeen per item (keyed by Amazon URL) so the page can surface the
  // genuinely most-recently-added entries. New URLs get stamped with this run's time.
  const prev = await readPrevious();
  const prevFirstSeen = new Map((prev?.items || []).map((it) => [it.url, it.firstSeen || prev.updatedAt]));
  const items = parsed.map((it) => ({
    ...it,
    firstSeen: prevFirstSeen.get(it.url) || now,
  }));

  const out = {
    source: SOURCE_URL,
    updatedAt: now,
    count: items.length,
    items,
  };
  await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
  const added = items.filter((it) => it.firstSeen === now).length;
  console.log(`wrote ${items.length} items to ${OUT_PATH}` + (prev ? ` (${added} new since last run)` : " (initial snapshot)"));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
