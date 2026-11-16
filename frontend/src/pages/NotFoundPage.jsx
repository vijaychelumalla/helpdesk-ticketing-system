import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "var(--danger-light)",
          color: "var(--danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <AlertCircle size={32} />
      </div>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 0.5rem 0" }}>404 - Page Not Found</h1>
      <p style={{ color: "var(--text-muted)", maxWidth: "420px", marginBottom: "1.5rem" }}>
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        <ArrowLeft size={16} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
