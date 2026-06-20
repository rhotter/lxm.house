import type { Metadata } from "next";
import feed from "./things-data.json";

export const metadata: Metadata = {
  title: "Things Aayush buys",
  description: "A feed of things Aayush buys, pulled from his /things live post.",
};

type Item = {
  name: string;
  url: string;
  price: string | null;
  section: string;
  description: string;
  firstSeen: string;
};

const items = feed.items as Item[];

// Sections in the order they first appear in the source post, so the feed reads
// the same top-to-bottom as blog.aayushg.com/things.
const sectionOrder: string[] = [];
for (const it of items) {
  if (!sectionOrder.includes(it.section)) sectionOrder.push(it.section);
}

// "Recently added": items stamped with the newest firstSeen value. The cron stamps
// freshly-discovered Amazon links with the run time, so this surfaces what changed in
// the /things post since the previous sync. Hidden on the initial snapshot (when every
// item shares one timestamp) — that's not a meaningful "recent" set.
const newestFirstSeen = items.reduce((max, it) => (it.firstSeen > max ? it.firstSeen : max), "");
const recentlyAdded = items.filter((it) => it.firstSeen === newestFirstSeen);
const showRecent = recentlyAdded.length > 0 && recentlyAdded.length < items.length;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ItemRow({ item }: { item: Item }) {
  return (
    <li className="mb-3">
      <a href={item.url} target="_blank" rel="noopener noreferrer">
        {item.name}
      </a>
      {item.price ? <span className="text-gray-500">{` — ${item.price}`}</span> : null}
      {item.description ? (
        <span className="block text-gray-500">{item.description}</span>
      ) : null}
    </li>
  );
}

export default function AmazonPage() {
  return (
    <>
      <h1>Things Aayush buys</h1>
      <p className="text-gray-500">
        A live feed of {feed.count} things Aayush has bought off Amazon, pulled from his{" "}
        <a href={feed.source} target="_blank" rel="noopener noreferrer">
          /things
        </a>{" "}
        post. Last updated {formatDate(feed.updatedAt)}.
      </p>

      {showRecent ? (
        <>
          <h2>Recently added</h2>
          <ul>
            {recentlyAdded.map((item) => (
              <ItemRow key={item.url} item={item} />
            ))}
          </ul>
        </>
      ) : null}

      {sectionOrder.map((section) => (
        <section key={section}>
          <h2>{section}</h2>
          <ul>
            {items
              .filter((it) => it.section === section)
              .map((item) => (
                <ItemRow key={item.url} item={item} />
              ))}
          </ul>
        </section>
      ))}
    </>
  );
}
