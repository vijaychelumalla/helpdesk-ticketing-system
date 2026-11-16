import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ticketApi from "../../api/ticketApi";
import fileApi from "../../api/fileApi";
import { useToast } from "../../context/ToastContext";
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export const CreateTicketPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    tagsInput: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toast = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Max 10MB check
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Please provide a ticket title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please describe the issue or request in detail.");
      return;
    }

    setLoading(true);

    try {
      let attachmentPath = null;

      // If a file is attached, upload it first
      if (selectedFile) {
        setUploading(true);
        const uploadRes = await fileApi.uploadFile(selectedFile);
        if (uploadRes.success && uploadRes.file) {
          attachmentPath = uploadRes.file.path;
        }
        setUploading(false);
      }

      // Format tags
      const tags = formData.tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const ticketPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        tags,
        attachments: attachmentPath ? [attachmentPath] : [],
      };

      const res = await ticketApi.createTicket(ticketPayload);
      if (res.success && res.ticket) {
        toast.success("Support ticket created successfully!");
        navigate(`/tickets/${res.ticket._id}`);
      } else {
        setError(res.message || "Failed to create ticket.");
      }
    } catch (err) {
      setError(err.message || "Error submitting ticket. Please try again.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link to="/tickets" className="btn btn-ghost btn-icon btn-sm" title="Back to tickets">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>
            Create Support Ticket
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Submit an incident, service request, or technical inquiry
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                backgroundColor: "var(--danger-light)",
                border: "1px solid var(--danger-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--danger)",
                fontSize: "0.8125rem",
                marginBottom: "1.5rem",
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Title / Subject */}
            <div className="form-group">
              <label className="form-label" htmlFor="ticket-title">
                Ticket Title / Summary <span className="required">*</span>
              </label>
              <input
                id="ticket-title"
                name="title"
                type="text"
                className="form-input"
                placeholder="e.g. Cannot connect to VPN gateway / Password reset needed"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={200}
                required
              />
              <span className="form-hint">
                Briefly summarize the issue in one sentence (max 200 characters).
              </span>
            </div>

            {/* Priority & Tags Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ticket-priority">
                  Priority Level <span className="required">*</span>
                </label>
                <select
                  id="ticket-priority"
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low - Minor request or question</option>
                  <option value="medium">Medium - Standard operational issue</option>
                  <option value="high">High - Significant work impediment</option>
                  <option value="urgent">Urgent - Critical outage / blocker</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ticket-tags">
                  Tags / Keywords
                </label>
                <input
                  id="ticket-tags"
                  name="tagsInput"
                  type="text"
                  className="form-input"
                  placeholder="e.g. vpn, network, access"
                  value={formData.tagsInput}
                  onChange={handleInputChange}
                />
                <span className="form-hint">Separate multiple tags with commas.</span>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="ticket-description">
                Detailed Description <span className="required">*</span>
              </label>
              <textarea
                id="ticket-description"
                name="description"
                className="form-textarea"
                style={{ minHeight: "150px" }}
                placeholder="Describe the steps to reproduce, error messages received, impact on your work, or specific requests..."
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Attachment Upload */}
            <div className="form-group">
              <label className="form-label">
                Attachment (Optional)
              </label>

              {!selectedFile ? (
                <label
                  style={{
                    border: "2px dashed var(--border-color)",
                    borderRadius: "var(--radius-lg)",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    backgroundColor: "#fafbfc",
                    cursor: "pointer",
                    transition: "border-color var(--transition-speed)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                >
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                  />
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-light)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Upload size={20} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--primary)" }}>
                      Click to upload
                    </span>{" "}
                    <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                      or choose a document / screenshot
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>
                    PNG, JPG, PDF, DOCX up to 10MB
                  </span>
                </label>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1rem",
                    backgroundColor: "var(--bg-app)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", overflow: "hidden" }}>
                    <FileText size={20} color="var(--primary)" />
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-main)", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ fontSize: "0.725rem", color: "var(--text-subtle)" }}>
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--danger)", padding: "4px" }}
                    title="Remove attachment"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <Link to="/tickets" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || uploading}
              >
                {uploading
                  ? "Uploading Attachment..."
                  : loading
                  ? "Submitting Ticket..."
                  : "Submit Ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketPage;
