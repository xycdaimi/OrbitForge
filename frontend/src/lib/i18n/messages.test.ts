import { describe, expect, it } from "vitest";
import { messages, translate, type MessageKey } from "./messages";

describe("i18n messages", () => {
  it("keeps zh and en key sets aligned", () => {
    const zhKeys = Object.keys(messages.zh).sort();
    const enKeys = Object.keys(messages.en).sort();
    expect(enKeys).toEqual(zhKeys);
  });

  it("interpolates variables and falls back for missing locale key path", () => {
    expect(translate("zh", "articles.minRead", { n: 5 })).toBe("5 分钟阅读");
    expect(translate("en", "articles.minRead", { n: 5 })).toBe("5 min read");
    expect(translate("en", "terminal.unknown", { cmd: "boom" })).toContain(
      "boom",
    );
  });

  it("returns zh string for every MessageKey", () => {
    const keys = Object.keys(messages.zh) as MessageKey[];
    for (const key of keys) {
      expect(translate("zh", key).length).toBeGreaterThan(0);
      expect(translate("en", key).length).toBeGreaterThan(0);
    }
  });
});
