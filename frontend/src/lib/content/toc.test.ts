import { describe, expect, it } from "vitest";
import { extractToc } from "./toc";

describe("extractToc", () => {
  it("extracts h2 and h3 headings and ignores fenced code", () => {
    const toc = extractToc(`# Title

## 背景

介绍

\`\`\`md
## 不应出现
\`\`\`

### 子目标

## 总结
`);

    expect(toc.map((item) => item.text)).toEqual(["背景", "子目标", "总结"]);
    expect(toc.every((item) => item.id.length > 0)).toBe(true);
    expect(toc[1].level).toBe(3);
  });
});
