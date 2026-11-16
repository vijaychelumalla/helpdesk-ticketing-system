import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Menu, Plus, User, LogOut, CheckCircle, Shield } from "lucide-react";
import RoleBadge from "./RoleBadge";

export const Navbar = ({ onMenuClick }) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard Overview";
    if (path === "/tickets") return "Ticket Management";
    if (path === "/tickets/new") return "Submit New Support Ticket";
    if (path.startsWith("/tickets/")) return "Ticket Details";
    if (path === "/users") return "User & Agent Administration";
    if (path === "/reports") return "Analytics & SLA Reports";
    return "Helpdesk Portal";
  };

  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 980,
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-sm mobile-menu-btn"
          style={{ display: "none", padding: "6px" }}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-main)", margin: 0 }}>
            {getPageTitle()}
          </h2>
          <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--success)" }} />
            System Operational &bull; MongoDB Connected
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/tickets/new" className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>New Ticket</span>
        </Link>

        {/* User profile dropdown pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.35rem 0.75rem",
            backgroundColor: "var(--bg-app)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-full)",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "0.8rem",
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-main)" }}>
              {user?.name}
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>
              {user?.email}
            </span>
          </div>

          <RoleBadge role={role} />

          <button
            onClick={logout}
            className="btn btn-ghost btn-sm"
            style={{ padding: "4px", color: "var(--text-subtle)", marginLeft: "0.25rem" }}
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
