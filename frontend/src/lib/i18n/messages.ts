export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];
export const DEFAULT_LOCALE: Locale = "zh";
export const LOCALE_STORAGE_KEY = "orbitforge-locale";

export type MessageKey = keyof typeof messages.zh;

export const messages = {
  zh: {
    "brand.subtitle": "星轨实验室",
    "brand.slogan": "探索未知，构建未来。",
    "brand.description":
      "面向 AI 应用开发、模型训练、编程、分布式系统与系统架构的个人技术博客和工程实验室。",

    "nav.home": "首页",
    "nav.articles": "文章",
    "nav.lab": "实验室",
    "nav.architecture": "架构",
    "nav.projects": "项目",
    "nav.about": "关于",
    "nav.search": "搜索",
    "nav.primary": "主导航",
    "nav.mobile": "移动端导航",
    "nav.openMenu": "打开导航菜单",
    "nav.closeMenu": "关闭导航菜单",
    "nav.closeOverlay": "关闭导航遮罩",
    "nav.github": "GitHub",
    "nav.login": "登录",
    "nav.studio": "写稿",

    "locale.zh": "中文",
    "locale.en": "EN",
    "locale.switchToZh": "切换到中文",
    "locale.switchToEn": "Switch to English",

    "home.heroCtaArticles": "浏览文章",
    "home.heroCtaProjects": "查看项目",
    "home.focusEyebrow": "关注",
    "home.focusTitle": "当前关注方向",
    "home.focus.ai.title": "AI 工程",
    "home.focus.ai.body": "Agent、RAG、模型服务与推理优化。",
    "home.focus.training.title": "模型训练",
    "home.focus.training.body": "数据、训练过程、实验记录与失败分析。",
    "home.focus.arch.title": "系统架构",
    "home.focus.arch.body": "分布式系统、Serverless 与设计权衡。",
    "home.focus.programming.title": "编程实践",
    "home.focus.programming.body": "Go / TypeScript 工程实践与工具链。",
    "home.tag.ai": "AI 工程",
    "home.tag.ml": "机器学习",
    "home.tag.distributed": "分布式系统",
    "home.tag.architecture": "系统架构",
    "home.featuredTitle": "精选文章",
    "home.latestTitle": "最近更新",
    "home.projectsTitle": "开源与工程实验",
    "home.viewAll": "查看全部",
    "home.aboutTitle": "关于星轨实验室",
    "home.aboutBody":
      "面向 AI 应用开发与系统架构的个人技术实验室。首页强调辨识度，文章页优先可读性。",
    "home.aboutCta": "了解更多",
    "home.emptyArticles": "暂无文章。",

    "terminal.eyebrow": "终端",
    "terminal.hint": "可选彩蛋",
    "terminal.ready":
      "OrbitForge 终端已就绪。输入 help 查看命令。这是彩蛋，不是唯一导航入口。",
    "terminal.label": "终端命令",
    "terminal.run": "运行",
    "terminal.help":
      "可用命令：help · articles · projects · lab · architecture · clear",
    "terminal.openArticles": "打开技术文章列表",
    "terminal.openProjects": "打开项目列表",
    "terminal.openLab": "打开实验室",
    "terminal.openArchitecture": "打开架构画廊",
    "terminal.unknown": "未知命令：{cmd}。输入 help 查看可用命令。",

    "footer.license": "许可证待定。",
    "footer.rss": "RSS",

    "articles.eyebrow": "文章",
    "articles.title": "技术文章",
    "articles.description":
      "记录 AI 工程、系统架构与工程实践中的设计取舍。",
    "articles.empty": "暂无已发布文章。",
    "articles.featured": "精选",
    "articles.minRead": "{n} 分钟阅读",
    "articles.updated": "更新于 {date}",
    "articles.toc": "目录",
    "articles.tocNav": "文章目录",
    "articles.onThisPage": "本页目录",
    "articles.prev": "上一篇",
    "articles.next": "下一篇",
    "articles.neighbors": "相邻文章",
    "articles.breadcrumb": "面包屑",
    "articles.bodyNotice": "正文目前仅为中文。",
    "articles.series": "系列",
    "articles.seriesCount": "{n} 篇文章",
    "articles.coverAlt": "{title} 封面",

    "search.eyebrow": "搜索",
    "search.title": "搜索",
    "search.label": "搜索文章",
    "search.placeholder": "标题、摘要或标签…",
    "search.hint": "输入关键词开始检索。当前索引包含 {n} 篇已发布文章。",
    "search.empty": "没有匹配「{query}」的文章。",

    "projects.eyebrow": "项目",
    "projects.title": "项目",
    "projects.description":
      "展示可公开的个人项目。标注为「示例」的条目仅用于验证页面与数据结构。",
    "projects.example": "示例",

    "lab.eyebrow": "实验室",
    "lab.title": "实验室",
    "lab.description":
      "展示可复现实验记录。当前条目含明确标注的示例数据，不代表在线 GPU 服务。",
    "lab.example": "示例数据",
    "lab.exampleNotice": "示例数据，非实测结果。",
    "lab.bodyNotice": "实验说明目前仅为中文。",
    "lab.model": "模型",
    "lab.framework": "框架",
    "lab.dataset": "数据集",
    "lab.hardware": "硬件",

    "architecture.eyebrow": "架构",
    "architecture.title": "架构",
    "architecture.description":
      "记录系统设计取舍。图表提供 Mermaid 与文字说明，避免只剩不可访问的视觉。",
    "architecture.bodyNotice": "架构说明目前仅为中文。",

    "about.eyebrow": "关于",
    "about.title": "关于 OrbitForge",
    "about.p1":
      "星轨实验室是一个面向 AI 应用开发、模型训练、编程与系统架构的个人技术实验室。",
    "about.p2":
      "站点目标是同时做到两件事：首页有辨识度，文章页足够好读。公开内容以 Git + MDX 维护，动态能力按需交给 Go Lambda。",
    "about.placeholderTitle": "占位说明",
    "about.placeholderBody":
      "以下个人简介、社交链接与肖像信息尚未提供真实内容，请勿当作已核实的个人履历。",
    "about.focusTitle": "关注方向",
    "about.focus1": "AI 工程 / Agent 工作流",
    "about.focus2": "分布式系统与 Serverless",
    "about.focus3": "Go / TypeScript 工程实践",
    "about.focus4": "模型训练实验记录",
    "about.contactTitle": "联系",
    "about.contactBody":
      "GitHub 与邮件等公开联系方式待站点作者配置。当前导航中的 GitHub 链接为占位地址。",
    "about.ctaArticles": "阅读文章",
    "about.ctaProjects": "查看项目",

    "tags.articlesCount": "{n} 篇文章",

    "notFound.title": "未找到该页面",
    "notFound.body":
      "你访问的路径在 OrbitForge 中不存在，或尚未发布。可以从首页继续探索技术文章与项目。",
    "notFound.home": "返回首页",
    "notFound.articles": "浏览文章",
  },
  en: {
    "brand.subtitle": "Digital Research Lab",
    "brand.slogan": "Explore the Unknown. Engineer the Future.",
    "brand.description":
      "A personal engineering lab for AI applications, model training, programming, distributed systems, and system architecture.",

    "nav.home": "Home",
    "nav.articles": "Articles",
    "nav.lab": "AI Lab",
    "nav.architecture": "Architecture",
    "nav.projects": "Projects",
    "nav.about": "About",
    "nav.search": "Search",
    "nav.primary": "Primary",
    "nav.mobile": "Mobile navigation",
    "nav.openMenu": "Open navigation menu",
    "nav.closeMenu": "Close navigation menu",
    "nav.closeOverlay": "Close navigation overlay",
    "nav.github": "GitHub",
    "nav.login": "Log in",
    "nav.studio": "Write",

    "locale.zh": "中文",
    "locale.en": "EN",
    "locale.switchToZh": "切换到中文",
    "locale.switchToEn": "Switch to English",

    "home.heroCtaArticles": "Explore Articles",
    "home.heroCtaProjects": "View Projects",
    "home.focusEyebrow": "Focus",
    "home.focusTitle": "Current focus",
    "home.focus.ai.title": "AI Engineering",
    "home.focus.ai.body": "Agents, RAG, model serving, and inference optimization.",
    "home.focus.training.title": "Model Training",
    "home.focus.training.body":
      "Data, training loops, experiment logs, and failure analysis.",
    "home.focus.arch.title": "System Architecture",
    "home.focus.arch.body":
      "Distributed systems, serverless, and design trade-offs.",
    "home.focus.programming.title": "Programming",
    "home.focus.programming.body":
      "Go / TypeScript engineering practice and toolchains.",
    "home.tag.ai": "AI Engineering",
    "home.tag.ml": "Machine Learning",
    "home.tag.distributed": "Distributed Systems",
    "home.tag.architecture": "System Architecture",
    "home.featuredTitle": "Featured articles",
    "home.latestTitle": "Latest updates",
    "home.projectsTitle": "Open source & experiments",
    "home.viewAll": "View all",
    "home.aboutTitle": "About OrbitForge",
    "home.aboutBody":
      "A personal lab for AI application development and system architecture. Expressive homepage; focused reading experience.",
    "home.aboutCta": "Learn more",
    "home.emptyArticles": "No articles yet.",

    "terminal.eyebrow": "Terminal",
    "terminal.hint": "optional easter egg",
    "terminal.ready":
      "OrbitForge terminal ready. Type help for commands. This is an easter egg, not the only navigation path.",
    "terminal.label": "Terminal command",
    "terminal.run": "Run",
    "terminal.help":
      "Commands: help · articles · projects · lab · architecture · clear",
    "terminal.openArticles": "Open articles",
    "terminal.openProjects": "Open projects",
    "terminal.openLab": "Open AI Lab",
    "terminal.openArchitecture": "Open architecture gallery",
    "terminal.unknown": "Unknown command: {cmd}. Type help for commands.",

    "footer.license": "License TBD.",
    "footer.rss": "RSS",

    "articles.eyebrow": "Articles",
    "articles.title": "Technical articles",
    "articles.description":
      "Notes on AI engineering, system architecture, and engineering trade-offs.",
    "articles.empty": "No published articles yet.",
    "articles.featured": "Featured",
    "articles.minRead": "{n} min read",
    "articles.updated": "Updated {date}",
    "articles.toc": "Contents",
    "articles.tocNav": "Table of contents",
    "articles.onThisPage": "On this page",
    "articles.prev": "Previous",
    "articles.next": "Next",
    "articles.neighbors": "Adjacent articles",
    "articles.breadcrumb": "Breadcrumb",
    "articles.bodyNotice": "Article body is currently Chinese only.",
    "articles.series": "Series",
    "articles.seriesCount": "{n} articles",
    "articles.coverAlt": "Cover for {title}",

    "search.eyebrow": "Search",
    "search.title": "Search",
    "search.label": "Search articles",
    "search.placeholder": "Title, summary, or tags…",
    "search.hint":
      "Type a keyword to search. The index currently includes {n} published articles.",
    "search.empty": "No articles match “{query}”.",

    "projects.eyebrow": "Projects",
    "projects.title": "Projects",
    "projects.description":
      "Public personal projects. Items marked as examples only validate pages and data shape.",
    "projects.example": "Example",

    "lab.eyebrow": "AI Lab",
    "lab.title": "AI Lab",
    "lab.description":
      "Reproducible experiment notes. Current entries use clearly labeled sample data—not a live GPU service.",
    "lab.example": "Sample data",
    "lab.exampleNotice": "Sample data, not measured results.",
    "lab.bodyNotice": "Experiment notes are currently Chinese only.",
    "lab.model": "Model",
    "lab.framework": "Framework",
    "lab.dataset": "Dataset",
    "lab.hardware": "Hardware",

    "architecture.eyebrow": "Architecture",
    "architecture.title": "Architecture",
    "architecture.description":
      "System design trade-offs with Mermaid diagrams and accessible text explanations.",
    "architecture.bodyNotice":
      "Architecture notes are currently Chinese only.",

    "about.eyebrow": "About",
    "about.title": "About OrbitForge",
    "about.p1":
      "OrbitForge is a personal engineering lab for AI applications, model training, programming, and system architecture.",
    "about.p2":
      "The site aims for two things at once: a distinctive homepage and focused article reading. Public content lives in Git + MDX; dynamic features go to Go Lambda when needed.",
    "about.placeholderTitle": "Placeholder notice",
    "about.placeholderBody":
      "Personal bio, social links, and portrait are not real yet. Do not treat them as verified resume details.",
    "about.focusTitle": "Focus areas",
    "about.focus1": "AI engineering / agent workflows",
    "about.focus2": "Distributed systems and serverless",
    "about.focus3": "Go / TypeScript engineering practice",
    "about.focus4": "Model training experiment logs",
    "about.contactTitle": "Contact",
    "about.contactBody":
      "Public GitHub and email contacts are pending. The GitHub link in navigation is a placeholder.",
    "about.ctaArticles": "Read articles",
    "about.ctaProjects": "View projects",

    "tags.articlesCount": "{n} articles",

    "notFound.title": "Page not found",
    "notFound.body":
      "This path does not exist on OrbitForge, or it has not been published yet. Continue from the homepage.",
    "notFound.home": "Back home",
    "notFound.articles": "Browse articles",
  },
} as const;

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "zh" || value === "en";
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let text: string = messages[locale][key] ?? messages.zh[key] ?? key;
  if (!vars) {
    return text;
  }
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}
