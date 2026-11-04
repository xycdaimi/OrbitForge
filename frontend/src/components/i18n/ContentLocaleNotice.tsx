"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n/messages";

type ContentLocaleNoticeProps = {
  messageKey: MessageKey;
};

export function ContentLocaleNotice({ messageKey }: ContentLocaleNoticeProps) {
  const { locale, t } = useLocale();
  if (locale !== "en") {
    return null;
  }

  return (
    <p
      className="mb-6 rounded-xl border border-accent-violet/30 bg-bg-elevated/60 px-4 py-3 text-sm text-text-secondary"
      role="note"
    >
      {t(messageKey)}
    </p>
  );
}
