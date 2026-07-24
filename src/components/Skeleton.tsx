const shimmer = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export function SkeletonBox({ width = "100%", height = "16px", radius = "6px", style = {} }) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{
        width, height,
        borderRadius: radius,
        background: "linear-gradient(90deg, var(--color-background-secondary) 25%, var(--color-background-tertiary) 50%, var(--color-background-secondary) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s ease infinite",
        ...style
      }} />
    </>
  );
}

// KPI card skeleton
export function SkeletonKPI() {
  return (
    <div style={{
      padding: "1.25rem", border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)", display: "flex", flexDirection: "column", gap: "10px"
    }}>
      <SkeletonBox width="60%" height="12px" />
      <SkeletonBox width="40%" height="28px" />
      <SkeletonBox width="50%" height="10px" />
    </div>
  );
}

// Table row skeleton
export function SkeletonRow({ cols = 4 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "12px", padding: "12px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      {Array(cols).fill(0).map((_, i) => (
        <SkeletonBox key={i} height="14px" width={i === 0 ? "80%" : "60%"} />
      ))}
    </div>
  );
}