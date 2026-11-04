import { describe, expect, it } from "vitest";
import { getSiteTitle, siteConfig } from "./site";

describe("siteConfig", () => {
  it("exposes OrbitForge brand constants", () => {
    expect(siteConfig.name).toBe("OrbitForge");
    expect(siteConfig.nameZh).toBe("星轨实验室");
    expect(siteConfig.slogan).toContain("Engineer the Future");
  });

  it("builds page titles with brand suffix", () => {
    expect(getSiteTitle()).toBe("OrbitForge · 星轨实验室");
    expect(getSiteTitle("Articles")).toBe("Articles · OrbitForge");
  });
});
