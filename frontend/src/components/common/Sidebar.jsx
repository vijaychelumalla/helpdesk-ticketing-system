import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Headphones,
  User as UserIcon,
} from "lucide-react";
import RoleBadge from "./RoleBadge";

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, role, logout } = useAuth();

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["customer", "agent", "admin"],
    },
    {
      to: "/tickets",
      label: "All Tickets",
      icon: Ticket,
      roles: ["customer", "agent", "admin"],
    },
    {
      to: "/tickets/new",
      label: "Create Ticket",
      icon: PlusCircle,
      roles: ["customer", "agent", "admin"],
    },
    {
      to: "/reports",
      label: "Reports & SLAs",
      icon: BarChart3,
      roles: ["agent", "admin"],
    },
    {
      to: "/users",
      label: "User Management",
      icon: Users,
      roles: ["admin"],
    },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(role));

  const getRoleIcon = () => {
    if (role === "admin") return <ShieldCheck size={16} color="#db2777" />;
    if (role === "agent") return <Headphones size={16} color="var(--purple)" />;
    return <UserIcon size={16} color="var(--primary)" />;
  };

  const sidebarWidth = isCollapsed ? "72px" : "260px";

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 990,
            display: "block",
          }}
        />
      )}

      <aside
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          height: "100vh",
          position: "sticky",
          top: 0,
          backgroundColor: "#ffffff",
          borderRight: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s ease, transform 0.25s ease",
          zIndex: 995,
          boxShadow: "var(--shadow-sm)",
          transform: isMobileOpen ? "translateX(0)" : undefined,
        }}
        className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}
      >
        {/* Brand header */}
        <div
          style={{
            height: "64px",
            padding: isCollapsed ? "0 1rem" : "0 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", overflow: "hidden" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--primary)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.1rem",
                flexShrink: 0,
                boxShadow: "0 2px 4px rgba(37, 99, 235, 0.25)",
              }}
            >
              DF
            </div>
            {!isCollapsed && (
              <div>
                <h1 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-main)", margin: 0, lineHeight: 1.1 }}>
                  DeskFlow
                </h1>
                <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)", fontWeight: 500, letterSpacing: "0.03em" }}>
                  IT HELPDESK
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="btn btn-ghost btn-sm"
              style={{ padding: "4px", color: "var(--text-subtle)" }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="btn btn-ghost btn-sm"
              style={{ alignSelf: "center", marginBottom: "0.5rem", padding: "6px" }}
              title="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                onClick={() => setIsMobileOpen(false)}
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: isCollapsed ? "0.65rem" : "0.65rem 0.85rem",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--primary)" : "var(--text-muted)",
                  backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                  borderLeft: isActive && !isCollapsed ? "3px solid var(--primary)" : "3px solid transparent",
                  transition: "all var(--transition-speed)",
                  textDecoration: "none",
                })}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={19} style={{ flexShrink: 0 }} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div
          style={{
            padding: isCollapsed ? "1rem 0.5rem" : "1rem 1.25rem",
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "#fafbfc",
          }}
        >
          {!isCollapsed ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", overflow: "hidden" }}>
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getRoleIcon()}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.name || "User"}
                  </div>
                  <RoleBadge role={role} />
                </div>
              </div>

              <button
                onClick={logout}
                className="btn btn-ghost btn-sm"
                style={{ padding: "6px", color: "var(--danger)" }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={logout}
                className="btn btn-ghost btn-sm"
                style={{ padding: "6px", color: "var(--danger)" }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
