"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readAuthorToken } from "@/components/auth/LoginPage";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function StudioNavLink({
  className = "rounded-lg px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface hover:text-text-primary",
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const { t } = useLocale();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(readAuthorToken().length > 0);
  }, []);

  if (!authed) {
    return (
      <Link href="/login/" className={className} onClick={onNavigate}>
        {t("nav.login")}
      </Link>
    );
  }

  return (
    <Link href="/studio/" className={className} onClick={onNavigate}>
      {t("nav.studio")}
    </Link>
  );
}
