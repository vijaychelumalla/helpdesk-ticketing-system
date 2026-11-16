import React from "react";
import { CircleDot, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export const StatusBadge = ({ status }) => {
  const normalized = (status || "open").toLowerCase().replace("-", "_");

  const getConfig = () => {
    switch (normalized) {
      case "open":
        return {
          label: "Open",
          className: "badge-open",
          icon: <CircleDot size={12} />,
        };
      case "in_progress":
        return {
          label: "In Progress",
          className: "badge-in_progress",
          icon: <Clock size={12} />,
        };
      case "waiting":
        return {
          label: "Waiting",
          className: "badge-waiting",
          icon: <AlertCircle size={12} />,
        };
      case "resolved":
        return {
          label: "Resolved",
          className: "badge-resolved",
          icon: <CheckCircle2 size={12} />,
        };
      case "closed":
        return {
          label: "Closed",
          className: "badge-closed",
          icon: <XCircle size={12} />,
        };
      default:
        return {
          label: status,
          className: "badge-open",
          icon: <CircleDot size={12} />,
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

export default StatusBadge;
