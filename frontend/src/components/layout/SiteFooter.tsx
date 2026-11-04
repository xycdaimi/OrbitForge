"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { t } = useLocale();

  return (
    <footer className="mt-auto border-t border-border-default bg-bg-surface/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-medium text-text-primary">
            {siteConfig.name}
          </p>
          <p className="mt-1 text-sm text-text-secondary">{t("brand.slogan")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <Link href="/articles/" className="hover:text-accent-cyan">
            {t("nav.articles")}
          </Link>
          <Link href="/projects/" className="hover:text-accent-cyan">
            {t("nav.projects")}
          </Link>
          <Link href="/about/" className="hover:text-accent-cyan">
            {t("nav.about")}
          </Link>
          <a href="/rss.xml" className="hover:text-accent-cyan">
            {t("footer.rss")}
          </a>
        </div>
      </div>
      <div className="border-t border-border-default/70">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-text-secondary sm:px-6">
          © {year} {siteConfig.name}. {t("footer.license")}
        </p>
      </div>
    </footer>
  );
}
