"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readAuthorToken, storeTokenFromHash } from "@/components/auth/LoginPage";
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
    storeTokenFromHash();
    setAuthed(readAuthorToken().length > 0);
  }, []);

  if (!authed) {
    return null;
  }

  return (
    <Link href="/studio/" className={className} onClick={onNavigate}>
      {t("nav.studio")}
    </Link>
  );
}
