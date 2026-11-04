"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ArticlesEmpty() {
  const { t } = useLocale();
  return (
    <p className="mt-12 rounded-2xl border border-border-default bg-bg-surface/60 p-8 text-text-secondary">
      {t("articles.empty")}
    </p>
  );
}
