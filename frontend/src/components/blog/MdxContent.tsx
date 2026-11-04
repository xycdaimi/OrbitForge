import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";
import { MermaidDiagram } from "./MermaidDiagram";

type MdxContentProps = {
  source: string;
};

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    return extractText(
      (node as { props: { children?: ReactNode } }).props.children,
    );
  }
  return "";
}

function Pre(props: ComponentPropsWithoutRef<"pre">) {
  const child = Array.isArray(props.children)
    ? props.children[0]
    : props.children;

  if (
    child &&
    typeof child === "object" &&
    "props" in child &&
    child.props &&
    typeof child.props === "object"
  ) {
    const codeProps = child.props as {
      className?: string;
      children?: ReactNode;
    };
    const className = codeProps.className ?? "";
    const languageMatch = /language-([^\s]+)/.exec(className);
    const language = languageMatch?.[1] ?? "text";
    const code = extractText(codeProps.children).replace(/\n$/, "");

    if (language === "mermaid") {
      return <MermaidDiagram chart={code} />;
    }

    return <CodeBlock code={code} language={language} />;
  }

  return <pre {...props} />;
}

const components = {
  pre: Pre,
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      {...props}
      className="text-accent-cyan underline-offset-4 hover:underline"
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : props.rel}
      target={props.href?.startsWith("http") ? "_blank" : props.target}
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="mt-10 mb-4 scroll-mt-28 text-2xl font-semibold text-text-primary"
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className="mt-8 mb-3 scroll-mt-28 text-xl font-semibold text-text-primary"
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className="my-4 leading-8 text-text-secondary" />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      {...props}
      className="my-4 list-disc space-y-2 pl-6 text-text-secondary"
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      {...props}
      className="my-4 list-decimal space-y-2 pl-6 text-text-secondary"
    />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      {...props}
      className="my-6 border-l-2 border-accent-violet/70 bg-bg-surface/60 px-4 py-2 text-text-secondary"
    />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table
        {...props}
        className="w-full border-collapse text-left text-sm text-text-secondary"
      />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      {...props}
      className="border border-border-default bg-bg-elevated px-3 py-2 text-text-primary"
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td {...props} className="border border-border-default px-3 py-2" />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => {
    if (props.className?.includes("language-")) {
      return <code {...props} />;
    }
    return (
      <code
        {...props}
        className="rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[0.9em] text-accent-cyan"
      />
    );
  },
};

export function MdxContent({ source }: MdxContentProps) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkMath],
          rehypePlugins: [rehypeSlug, rehypeKatex],
        },
      }}
    />
  );
}
