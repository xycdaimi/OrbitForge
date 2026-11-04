"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/cn";
import { isNavItemActive, primaryNav } from "@/lib/navigation";

type MobileNavProps = {
  pathname: string;
};

export function MobileNav({ pathname }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

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
        aria-label={open ? "关闭导航菜单" : "打开导航菜单"}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">{open ? "关闭" : "菜单"}</span>
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
            aria-label="关闭导航遮罩"
            onClick={() => setOpen(false)}
          />
          <nav
            id={panelId}
            className="absolute top-0 right-0 flex h-full w-[min(20rem,85vw)] flex-col gap-2 border-l border-border-default bg-bg-surface p-6 shadow-2xl"
            aria-label="移动端主导航"
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
                  <span className="font-medium">{item.label}</span>
                  <span className="ml-2 text-sm text-text-secondary">
                    {item.labelZh}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
