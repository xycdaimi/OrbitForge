const items = [
  {
    title: "AI Engineering",
    body: "Agent、RAG、模型服务与推理优化。",
    accent: "cyan" as const,
    className: "sm:col-span-2",
  },
  {
    title: "Model Training",
    body: "数据、训练过程、实验记录与失败分析。",
    accent: "violet" as const,
    className: "",
  },
  {
    title: "System Architecture",
    body: "分布式系统、Serverless 与设计权衡。",
    accent: "violet" as const,
    className: "",
  },
  {
    title: "Programming",
    body: "Go / TypeScript 工程实践与工具链。",
    accent: "cyan" as const,
    className: "sm:col-span-2",
  },
];

export function FocusBento() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm tracking-[0.18em] text-accent-cyan uppercase">
          Focus
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-text-primary">
          当前关注方向
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className={[
              "rounded-2xl border bg-bg-surface/40 p-5 shadow-[inset_0_1px_0_rgba(243,248,255,0.06)] backdrop-blur-md",
              item.accent === "cyan"
                ? "border-accent-cyan/25"
                : "border-accent-violet/25",
              item.className,
            ].join(" ")}
          >
            <h3 className="text-base font-medium text-text-primary">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
