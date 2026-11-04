export const siteConfig = {
  name: "OrbitForge",
  nameZh: "星轨实验室",
  slogan: "Explore the Unknown. Engineer the Future.",
  sloganZh: "探索未知，构建未来。",
  description:
    "面向 AI 应用开发、模型训练、编程、分布式系统与系统架构的个人技术博客和工程实验室。",
} as const;

export function getSiteTitle(pageTitle?: string): string {
  if (!pageTitle) {
    return `${siteConfig.name} · ${siteConfig.nameZh}`;
  }
  return `${pageTitle} · ${siteConfig.name}`;
}
