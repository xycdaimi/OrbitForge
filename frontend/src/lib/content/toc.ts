import GithubSlugger from "github-slugger";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split(/\r?\n/);
  const items: TocItem[] = [];
  const slugger = new GithubSlugger();
  let inFence = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }

    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) {
      continue;
    }

    const level = match[1].length as 2 | 3;
    const text = match[2].replace(/#+$/, "").trim();
    if (!text) {
      continue;
    }

    items.push({
      id: slugger.slug(text),
      text,
      level,
    });
  }

  return items;
}
