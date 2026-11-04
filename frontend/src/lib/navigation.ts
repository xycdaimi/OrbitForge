import type { MessageKey } from "@/lib/i18n/messages";

export type NavItem = {
  href: string;
  labelKey: MessageKey;
};

export const primaryNav: NavItem[] = [
  { href: "/", labelKey: "nav.home" },
  { href: "/articles/", labelKey: "nav.articles" },
  { href: "/lab/", labelKey: "nav.lab" },
  { href: "/architecture/", labelKey: "nav.architecture" },
  { href: "/projects/", labelKey: "nav.projects" },
  { href: "/about/", labelKey: "nav.about" },
  { href: "/search/", labelKey: "nav.search" },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  const normalizedPath =
    pathname.endsWith("/") || pathname === "" ? pathname || "/" : `${pathname}/`;

  if (href === "/") {
    return normalizedPath === "/";
  }

  return normalizedPath === href || normalizedPath.startsWith(href);
}
