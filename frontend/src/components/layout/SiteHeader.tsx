"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { isNavItemActive, primaryNav } from "@/lib/navigation";
import { siteConfig } from "@/lib/site";
import { MobileNav } from "./MobileNav";

export function SiteHeader() {
  const pathname = usePathname() || "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border-default/80 bg-bg-primary/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 flex-col leading-tight"
          aria-label={`${siteConfig.name} 首页`}
        >
          <span className="truncate text-sm font-semibold tracking-[0.18em] text-accent-cyan uppercase">
            {siteConfig.name}
          </span>
          <span className="truncate text-xs text-text-secondary group-hover:text-text-primary">
            {siteConfig.nameZh}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {primaryNav.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-bg-elevated text-accent-cyan"
                    : "text-text-secondary hover:bg-bg-surface hover:text-text-primary",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:border-accent-cyan/40 hover:text-accent-cyan sm:inline-flex"
          >
            GitHub
          </a>
          <MobileNav pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
