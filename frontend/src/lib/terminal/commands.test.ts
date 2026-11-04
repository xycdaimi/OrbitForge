import { describe, expect, it } from "vitest";
import { runTerminalCommand } from "./commands";

describe("runTerminalCommand", () => {
  it("lists help and route commands", () => {
    expect(runTerminalCommand("help")[0]?.text).toContain("help");
    expect(runTerminalCommand("articles")[0]?.href).toBe("/articles/");
    expect(runTerminalCommand("projects")[0]?.href).toBe("/projects/");
  });

  it("returns clear sentinel and unknown error", () => {
    expect(runTerminalCommand("clear")[0]?.text).toBe("__CLEAR__");
    expect(runTerminalCommand("boom")[0]?.type).toBe("error");
  });
});
