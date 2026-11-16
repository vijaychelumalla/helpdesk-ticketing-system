import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ size = 24, text = "Loading...", center = false }) => {
  const content = (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
      <Loader2 size={size} className="spinner" color="var(--primary)" />
      {text && <span style={{ fontSize: "0.875rem" }}>{text}</span>}
    </div>
  );

  if (center) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "3rem 1rem", width: "100%" }}>
        {content}
      </div>
    );
  }

  return content;
};

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div style={{ width: "100%", padding: "1rem" }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "1rem",
            padding: "0.85rem 0",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="skeleton"
              style={{
                height: "16px",
                width: c === 0 ? "70%" : c === 1 ? "90%" : "60%",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
