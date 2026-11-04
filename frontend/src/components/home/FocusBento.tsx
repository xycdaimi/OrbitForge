"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n/messages";

const items: Array<{
  titleKey: MessageKey;
  bodyKey: MessageKey;
  accent: "cyan" | "violet";
  className: string;
}> = [
  {
    titleKey: "home.focus.ai.title",
    bodyKey: "home.focus.ai.body",
    accent: "cyan",
    className: "sm:col-span-2",
  },
  {
    titleKey: "home.focus.training.title",
    bodyKey: "home.focus.training.body",
    accent: "violet",
    className: "",
  },
  {
    titleKey: "home.focus.arch.title",
    bodyKey: "home.focus.arch.body",
    accent: "violet",
    className: "",
  },
  {
    titleKey: "home.focus.programming.title",
    bodyKey: "home.focus.programming.body",
    accent: "cyan",
    className: "sm:col-span-2",
  },
];

export function FocusBento() {
  const { t } = useLocale();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm tracking-[0.18em] text-accent-cyan uppercase">
          {t("home.focusEyebrow")}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary">
          {t("home.focusTitle")}
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.titleKey}
            className={[
              "rounded-2xl border bg-bg-surface/40 p-5 shadow-[inset_0_1px_0_rgba(243,248,255,0.06)] backdrop-blur-md",
              item.accent === "cyan"
                ? "border-accent-cyan/25"
                : "border-accent-violet/25",
              item.className,
            ].join(" ")}
          >
            <h3 className="text-base font-medium text-text-primary">
              {t(item.titleKey)}
            </h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {t(item.bodyKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
