import React from "react";

export const StatCard = ({
  title,
  value = 0,
  icon: Icon,
  color = "var(--primary)",
  bgColor = "var(--primary-light)",
  subtitle,
}) => {
  return (
    <div
      className="card"
      style={{
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div>
        <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
          {title}
        </p>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
          {value}
        </h2>
        {subtitle && (
          <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginTop: "0.25rem" }}>
            {subtitle}
          </p>
        )}
      </div>

      {Icon && (
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
            flexShrink: 0,
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
