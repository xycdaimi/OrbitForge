"use client";

import Link from "next/link";
import { MdxContent } from "@/components/blog/MdxContent";
import { ContentLocaleNotice } from "@/components/i18n/ContentLocaleNotice";
import type { ArchitectureSource } from "@/lib/content/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type ArchitectureDetailChromeProps = {
  item: ArchitectureSource;
};

export function ArchitectureDetailChrome({
  item,
}: ArchitectureDetailChromeProps) {
  const { t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-text-secondary">
        <Link href="/architecture/" className="hover:text-accent-cyan">
          {t("nav.architecture")}
        </Link>
        <span className="mx-2">/</span>
        <span>{item.frontmatter.title}</span>
      </nav>
      <header className="mt-6 border-b border-border-default pb-8">
        <h1 className="text-3xl font-semibold text-text-primary">
          {item.frontmatter.title}
        </h1>
        <p className="mt-3 text-base text-text-secondary">
          {item.frontmatter.description}
        </p>
      </header>
      <div className="mt-6">
        <ContentLocaleNotice messageKey="architecture.bodyNotice" />
      </div>
      <div className="mt-8">
        <MdxContent source={item.body} />
      </div>
    </main>
  );
}
