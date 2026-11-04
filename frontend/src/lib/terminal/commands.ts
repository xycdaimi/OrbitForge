import { translate, type Locale } from "@/lib/i18n/messages";

export type TerminalLine = {
  type: "input" | "output" | "error";
  text: string;
  href?: string;
};

export function runTerminalCommand(
  raw: string,
  locale: Locale = "zh",
): TerminalLine[] {
  const input = raw.trim().toLowerCase();
  if (!input) {
    return [];
  }

  switch (input) {
    case "help":
      return [{ type: "output", text: translate(locale, "terminal.help") }];
    case "articles":
      return [
        {
          type: "output",
          text: translate(locale, "terminal.openArticles"),
          href: "/articles/",
        },
      ];
    case "projects":
      return [
        {
          type: "output",
          text: translate(locale, "terminal.openProjects"),
          href: "/projects/",
        },
      ];
    case "lab":
      return [
        {
          type: "output",
          text: translate(locale, "terminal.openLab"),
          href: "/lab/",
        },
      ];
    case "architecture":
      return [
        {
          type: "output",
          text: translate(locale, "terminal.openArchitecture"),
          href: "/architecture/",
        },
      ];
    case "clear":
      return [{ type: "output", text: "__CLEAR__" }];
    default:
      return [
        {
          type: "error",
          text: translate(locale, "terminal.unknown", { cmd: raw.trim() }),
        },
      ];
  }
}
