export type NavItem = {
  href: string;
  label: string;
  labelZh: string;
};

export const primaryNav: NavItem[] = [
  { href: "/", label: "Home", labelZh: "首页" },
  { href: "/articles/", label: "Articles", labelZh: "文章" },
  { href: "/projects/", label: "Projects", labelZh: "项目" },
  { href: "/about/", label: "About", labelZh: "关于" },
  { href: "/search/", label: "Search", labelZh: "搜索" },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  const normalizedPath =
    pathname.endsWith("/") || pathname === "" ? pathname || "/" : `${pathname}/`;

  if (href === "/") {
    return normalizedPath === "/";
  }

  return normalizedPath === href || normalizedPath.startsWith(href);
}
