import React from "react";
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDanger = true,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="460px"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${isDanger ? "btn-danger" : "btn-primary"} btn-sm`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-full)",
            backgroundColor: isDanger ? "var(--danger-light)" : "var(--primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: isDanger ? "var(--danger)" : "var(--primary)",
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.5, marginTop: "0.25rem" }}>
          {message}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
