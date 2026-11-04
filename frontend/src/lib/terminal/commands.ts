export type TerminalLine = {
  type: "input" | "output" | "error";
  text: string;
  href?: string;
};

export function runTerminalCommand(raw: string): TerminalLine[] {
  const input = raw.trim().toLowerCase();
  if (!input) {
    return [];
  }

  switch (input) {
    case "help":
      return [
        {
          type: "output",
          text: "可用命令：help · articles · projects · lab · architecture · clear",
        },
      ];
    case "articles":
      return [
        { type: "output", text: "打开技术文章列表", href: "/articles/" },
      ];
    case "projects":
      return [{ type: "output", text: "打开项目列表", href: "/projects/" }];
    case "lab":
      return [{ type: "output", text: "打开 AI Lab", href: "/lab/" }];
    case "architecture":
      return [
        { type: "output", text: "打开架构画廊", href: "/architecture/" },
      ];
    case "clear":
      return [{ type: "output", text: "__CLEAR__" }];
    default:
      return [
        {
          type: "error",
          text: `未知命令：${raw.trim()}。输入 help 查看可用命令。`,
        },
      ];
  }
}
