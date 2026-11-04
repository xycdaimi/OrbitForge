import fs from "node:fs";
import path from "node:path";
import { getPublishedArticles } from "../src/lib/content/articles";
import { buildRssXml } from "../src/lib/seo/rss";

const outPath = path.join(process.cwd(), "public", "rss.xml");
const xml = buildRssXml(getPublishedArticles());
fs.writeFileSync(outPath, xml, "utf8");
console.log(`Wrote ${outPath}`);
