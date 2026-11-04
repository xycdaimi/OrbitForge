"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  runTerminalCommand,
  type TerminalLine,
} from "@/lib/terminal/commands";

export function LabTerminal() {
  const { locale, t } = useLocale();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [value, setValue] = useState("");

  useEffect(() => {
    setLines([{ type: "output", text: t("terminal.ready") }]);
  }, [locale, t]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = value;
    setValue("");
    if (!command.trim()) {
      return;
    }

    const next: TerminalLine[] = [
      ...lines,
      { type: "input", text: `› ${command}` },
    ];
    const result = runTerminalCommand(command, locale);
    if (result[0]?.text === "__CLEAR__") {
      setLines([]);
      return;
    }
    setLines([...next, ...result]);
  }

  return (
    <section className="rounded-2xl border border-border-default bg-bg-surface/50 p-4 backdrop-blur-md sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm tracking-[0.18em] text-accent-violet uppercase">
          {t("terminal.eyebrow")}
        </p>
        <p className="text-xs text-text-secondary">{t("terminal.hint")}</p>
      </div>
      <div
        className="h-48 overflow-y-auto rounded-xl border border-border-default bg-bg-primary/80 p-3 font-mono text-sm"
        aria-live="polite"
      >
        {lines.map((line, index) => (
          <p
            key={`${line.text}-${index}`}
            className={
              line.type === "error"
                ? "text-accent-violet"
                : line.type === "input"
                  ? "text-accent-cyan"
                  : "text-text-secondary"
            }
          >
            {line.href ? (
              <Link href={line.href} className="hover:underline">
                {line.text}
              </Link>
            ) : (
              line.text
            )}
          </p>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <label className="sr-only" htmlFor="lab-terminal-input">
          {t("terminal.label")}
        </label>
        <input
          id="lab-terminal-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="flex-1 rounded-lg border border-border-default bg-bg-elevated px-3 py-2 font-mono text-sm text-text-primary outline-none focus:border-accent-cyan"
          placeholder="help"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          className="rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary hover:border-accent-cyan/40 hover:text-accent-cyan"
        >
          {t("terminal.run")}
        </button>
      </form>
    </section>
  );
}
