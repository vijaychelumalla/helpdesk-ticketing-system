import React from "react";
import { Inbox } from "lucide-react";

export const EmptyState = ({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There are no records matching your current filter criteria.",
  actionLabel,
  onAction,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3.5rem 1.5rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--bg-app)",
          border: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-subtle)",
          marginBottom: "1rem",
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-main)", marginBottom: "0.25rem" }}>
        {title}
      </h3>
      <p style={{ maxWidth: "360px", marginBottom: actionLabel ? "1.25rem" : "0" }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
