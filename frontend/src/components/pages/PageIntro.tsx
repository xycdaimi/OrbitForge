"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n/messages";

type PageIntroProps = {
  eyebrowKey: MessageKey;
  titleKey: MessageKey;
  descriptionKey: MessageKey;
  accent?: "cyan" | "violet";
};

export function PageIntro({
  eyebrowKey,
  titleKey,
  descriptionKey,
  accent = "cyan",
}: PageIntroProps) {
  const { t } = useLocale();
  const accentClass =
    accent === "violet" ? "text-accent-violet" : "text-accent-cyan";

  return (
    <header className="max-w-3xl">
      <p className={`text-sm tracking-[0.18em] uppercase ${accentClass}`}>
        {t(eyebrowKey)}
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-text-primary sm:text-4xl">
        {t(titleKey)}
      </h1>
      <p className="mt-3 text-base text-text-secondary">{t(descriptionKey)}</p>
    </header>
  );
}
