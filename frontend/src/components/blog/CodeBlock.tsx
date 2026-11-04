import { codeToHtml } from "shiki";
import { CopyCodeButton } from "./CopyCodeButton";

type CodeBlockProps = {
  code: string;
  language?: string;
};

export async function CodeBlock({ code, language = "text" }: CodeBlockProps) {
  const lang = language || "text";
  let highlighted = "";

  try {
    highlighted = await codeToHtml(code, {
      lang,
      theme: "github-dark-default",
    });
  } catch {
    highlighted = await codeToHtml(code, {
      lang: "text",
      theme: "github-dark-default",
    });
  }

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-border-default bg-bg-surface">
      <div className="flex items-center justify-between border-b border-border-default px-4 py-2">
        <span className="font-mono text-xs tracking-wide text-text-secondary uppercase">
          {lang}
        </span>
        <CopyCodeButton code={code} />
      </div>
      <div
        className="overflow-x-auto p-4 text-sm [&_pre]:m-0 [&_pre]:bg-transparent! [&_code]:font-mono"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}
