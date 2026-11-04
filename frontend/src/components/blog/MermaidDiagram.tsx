"use client";

import { useEffect, useId, useState } from "react";

type MermaidDiagramProps = {
  chart: string;
};

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
        });
        const { svg: rendered } = await mermaid.render(
          `mermaid-${reactId}`,
          chart,
        );
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setSvg(null);
          setError(err instanceof Error ? err.message : "Mermaid 渲染失败");
        }
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-border-default bg-bg-surface p-4">
        <p className="mb-2 text-sm text-accent-violet">架构图渲染失败，显示源码：</p>
        <pre className="overflow-x-auto text-sm text-text-secondary">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 rounded-xl border border-border-default bg-bg-surface p-4 text-sm text-text-secondary">
        正在渲染架构图…
      </div>
    );
  }

  return (
    <div
      className="my-6 overflow-x-auto rounded-xl border border-border-default bg-bg-surface p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
