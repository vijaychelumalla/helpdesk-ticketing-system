import React from "react";
import { ShieldCheck, Headphones, User } from "lucide-react";

export const RoleBadge = ({ role }) => {
  const normalized = (role || "customer").toLowerCase();

  const getConfig = () => {
    switch (normalized) {
      case "admin":
        return {
          label: "Admin",
          className: "badge-role-admin",
          icon: <ShieldCheck size={12} />,
        };
      case "agent":
        return {
          label: "Agent",
          className: "badge-role-agent",
          icon: <Headphones size={12} />,
        };
      case "customer":
      default:
        return {
          label: "Requester",
          className: "badge-role-customer",
          icon: <User size={12} />,
        };
    }
  };

  const { label, className, icon } = getConfig();

  return (
    <span className={`badge ${className}`}>
      {icon}
      <span>{label}</span>
    </span>
  );
};

export default RoleBadge;
