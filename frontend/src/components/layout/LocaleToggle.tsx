"use client";

import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/messages";

const options: Array<{ locale: Locale; labelKey: "locale.zh" | "locale.en" }> =
  [
    { locale: "zh", labelKey: "locale.zh" },
    { locale: "en", labelKey: "locale.en" },
  ];

export function LocaleToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className="inline-flex rounded-lg border border-border-default p-0.5"
      role="group"
      aria-label="Language"
    >
      {options.map((option) => {
        const active = locale === option.locale;
        return (
          <button
            key={option.locale}
            type="button"
            aria-pressed={active}
            aria-label={
              option.locale === "zh" ? t("locale.switchToZh") : t("locale.switchToEn")
            }
            className={cn(
              "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-bg-elevated text-accent-cyan"
                : "text-text-secondary hover:text-text-primary",
            )}
            onClick={() => setLocale(option.locale)}
          >
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
