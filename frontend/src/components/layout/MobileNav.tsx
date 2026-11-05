"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { isNavItemActive, primaryNav } from "@/lib/navigation";
import { StudioNavLink } from "@/components/auth/StudioNavLink";

type MobileNavProps = {
  pathname: string;
};

export function MobileNav({ pathname }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const { t } = useLocale();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-default bg-bg-elevated text-text-primary"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">
          {open ? t("nav.closeMenu") : t("nav.openMenu")}
        </span>
        <span aria-hidden className="flex flex-col gap-1.5">
          <span
            className={cn(
              "block h-0.5 w-5 bg-current transition-transform",
              open && "translate-y-2 rotate-45",
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-5 bg-current transition-opacity",
              open && "opacity-0",
            )}
          />
          <span
            className={cn(
              "block h-0.5 w-5 bg-current transition-transform",
              open && "-translate-y-2 -rotate-45",
            )}
          />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-bg-primary/80"
            aria-label={t("nav.closeOverlay")}
            onClick={() => setOpen(false)}
          />
          <nav
            id={panelId}
            className="absolute top-0 right-0 flex h-full w-[min(20rem,85vw)] flex-col gap-2 border-l border-border-default bg-bg-surface p-6 shadow-2xl"
            aria-label={t("nav.mobile")}
          >
            {primaryNav.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-3 text-base transition-colors",
                    active
                      ? "bg-bg-elevated text-accent-cyan"
                      : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <span className="font-medium">{t(item.labelKey)}</span>
                </Link>
              );
            })}
            <StudioNavLink
              className="rounded-lg px-3 py-3 text-base text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
              onNavigate={() => setOpen(false)}
            />
          </nav>
        </div>
      ) : null}
    </div>
  );
}
