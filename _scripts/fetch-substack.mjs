// Pulls the public Substack feed into _data/substack.json so the Writing page can list those posts.
// Node 18+, no dependencies. Run from the repo root: node _scripts/fetch-substack.mjs
import { writeFileSync } from "node:fs";

const FEED = "https://grnch.substack.com/feed";
const OUT = new URL("../_data/substack.json", import.meta.url);

const res = await fetch(FEED);
if (!res.ok) throw new Error(`${FEED} returned ${res.status}`);
const xml = await res.text();

const field = (item, tag) => {
  const m = item.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
  return m ? m[1].trim() : "";
};

const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
  const image = (item.match(/<enclosure url="([^"]+)"/) || [])[1] || null;
  return {
    title: field(item, "title"),
    description: field(item, "description"),
    url: field(item, "link"),
    date: new Date(field(item, "pubDate")).toISOString(),
    image,
    // substackcdn resizes on request; covers are often 4000px+ originals
    thumb: image && image.replace(",f_auto", ",w_320,f_auto"),
  };
});

if (!posts.length) throw new Error("feed had no items; leaving _data/substack.json alone");
writeFileSync(OUT, JSON.stringify(posts, null, 2) + "\n");
console.log(`wrote ${posts.length} posts to _data/substack.json`);
