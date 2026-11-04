import { describe, expect, it } from "vitest";
import { isNavItemActive, primaryNav } from "./navigation";

describe("primaryNav", () => {
  it("includes the MVP routes", () => {
    expect(primaryNav.map((item) => item.href)).toEqual([
      "/",
      "/articles/",
      "/projects/",
      "/about/",
      "/search/",
    ]);
  });
});

describe("isNavItemActive", () => {
  it("matches home only for root", () => {
    expect(isNavItemActive("/", "/")).toBe(true);
    expect(isNavItemActive("/articles/", "/")).toBe(false);
  });

  it("matches nested article paths under articles", () => {
    expect(isNavItemActive("/articles/", "/articles/")).toBe(true);
    expect(isNavItemActive("/articles/demo/", "/articles/")).toBe(true);
    expect(isNavItemActive("/projects/", "/articles/")).toBe(false);
  });
});
