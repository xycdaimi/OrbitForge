"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { TocItem } from "@/lib/content/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type TableOfContentsProps = {
  items: TocItem[];
};

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const { t } = useLocale();

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (headings.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0, 1],
      },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label={t("articles.tocNav")} className="space-y-3">
      <p className="text-xs tracking-[0.18em] text-text-secondary uppercase">
        {t("articles.onThisPage")}
      </p>
      <ul className="space-y-2 border-l border-border-default">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block border-l-2 py-1 text-sm transition-colors",
                item.level === 3 ? "pl-6" : "pl-3",
                activeId === item.id
                  ? "border-accent-cyan text-accent-cyan"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
