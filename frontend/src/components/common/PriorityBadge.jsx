import React from "react";
import { ArrowDown, ArrowRight, ArrowUp, AlertTriangle } from "lucide-react";

export const PriorityBadge = ({ priority }) => {
  const normalized = (priority || "medium").toLowerCase();

  const getConfig = () => {
    switch (normalized) {
      case "low":
        return {
          label: "Low",
          className: "badge-priority-low",
          icon: <ArrowDown size={12} />,
        };
      case "medium":
        return {
          label: "Medium",
          className: "badge-priority-medium",
          icon: <ArrowRight size={12} />,
        };
      case "high":
        return {
          label: "High",
          className: "badge-priority-high",
          icon: <ArrowUp size={12} />,
        };
      case "urgent":
        return {
          label: "Urgent",
          className: "badge-priority-urgent",
          icon: <AlertTriangle size={12} />,
        };
      default:
        return {
          label: priority,
          className: "badge-priority-medium",
          icon: <ArrowRight size={12} />,
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

export default PriorityBadge;
