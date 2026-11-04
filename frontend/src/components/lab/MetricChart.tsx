type MetricPoint = {
  step: number;
  value: number;
};

type MetricChartProps = {
  title: string;
  note: string;
  points: MetricPoint[];
};

export function MetricChart({ title, note, points }: MetricChartProps) {
  if (points.length === 0) {
    return (
      <p className="rounded-xl border border-border-default p-4 text-sm text-text-secondary">
        暂无指标数据。
      </p>
    );
  }

  const width = 640;
  const height = 240;
  const padding = 28;
  const minValue = Math.min(...points.map((point) => point.value));
  const maxValue = Math.max(...points.map((point) => point.value));
  const minStep = Math.min(...points.map((point) => point.step));
  const maxStep = Math.max(...points.map((point) => point.step));
  const xSpan = Math.max(1, maxStep - minStep);
  const ySpan = Math.max(0.0001, maxValue - minValue);

  const coords = points.map((point) => {
    const x =
      padding + ((point.step - minStep) / xSpan) * (width - padding * 2);
    const y =
      height -
      padding -
      ((point.value - minValue) / ySpan) * (height - padding * 2);
    return { x, y, ...point };
  });

  const path = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <figure className="rounded-2xl border border-border-default bg-bg-surface/60 p-4">
      <figcaption className="mb-3">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        <p className="mt-1 text-xs text-accent-violet">{note}</p>
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${title} 折线图`}
      >
        <path d={path} fill="none" stroke="#38D9F5" strokeWidth="2.5" />
        {coords.map((point) => (
          <circle
            key={point.step}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill="#906BFA"
          />
        ))}
      </svg>
      <p className="mt-2 text-xs text-text-secondary">
        横轴 step，纵轴 {title}。数值来自静态 JSON。
      </p>
    </figure>
  );
}
