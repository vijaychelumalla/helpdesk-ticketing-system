import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ticketApi from "../../api/ticketApi";
import commentApi from "../../api/commentApi";
import activityApi from "../../api/activityApi";
import fileApi from "../../api/fileApi";
import userApi from "../../api/userApi";

import StatusBadge from "../../components/common/StatusBadge";
import PriorityBadge from "../../components/common/PriorityBadge";
import RoleBadge from "../../components/common/RoleBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";

import {
  ArrowLeft,
  User,
  Clock,
  Calendar,
  CheckCircle2,
  Paperclip,
  Send,
  Lock,
  MessageSquare,
  History,
  Trash2,
  UserCheck,
  RefreshCw,
  ExternalLink,
  Upload,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, isAdmin, isCustomer } = useAuth();
  const toast = useToast();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loading, setLoading] = useState(true);

  // Comment submission state
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Status & Assignment state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // File attach state
  const [attachingFile, setAttachingFile] = useState(false);
  const [fileToAttach, setFileToAttach] = useState(null);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Active tab (Comments or Audit Log)
  const [activeTab, setActiveTab] = useState("comments");

  const canManage = role === "admin" || role === "agent";

  // Fetch ticket details
  const fetchTicketData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ticketApi.getTicketById(id);
      if (res.success && res.ticket) {
        setTicket(res.ticket);
      } else {
        toast.error("Ticket not found.");
        navigate("/tickets");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load ticket.");
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const res = await commentApi.getCommentsByTicket(id);
      if (res.success) {
        setComments(res.comments || []);
      }
    } catch {
      // Non-fatal
    }
  }, [id]);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    try {
      const res = await activityApi.getTicketActivities(id);
      if (res.success) {
        setActivities(res.activities || []);
      }
    } catch {
      // Non-fatal
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    fetchTicketData();
    fetchComments();
    fetchActivities();
  }, [fetchTicketData, fetchComments, fetchActivities]);

  // Load agents for assignment (Admin only)
  useEffect(() => {
    if (isAdmin) {
      setLoadingAgents(true);
      userApi
        .getUsers({ role: "agent", limit: 100 })
        .then((res) => {
          if (res.success && res.users) {
            setAgents(res.users);
          }
        })
        .catch((err) => {
          console.error("Failed to load agents:", err);
        })
        .finally(() => {
          setLoadingAgents(false);
        });
    }
  }, [isAdmin]);

  // Keep selectedAgentId and agents synced with current ticket assignment
  useEffect(() => {
    if (ticket?.assignedTo?._id) {
      setSelectedAgentId(ticket.assignedTo._id);
      if (typeof ticket.assignedTo === "object") {
        setAgents((prev) => {
          if (prev.some((ag) => ag._id === ticket.assignedTo._id)) return prev;
          return [ticket.assignedTo, ...prev];
        });
      }
    } else if (ticket && !ticket.assignedTo) {
      setSelectedAgentId("");
    }
  }, [ticket?.assignedTo, ticket?._id]);

  // Handle status update
  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await ticketApi.updateTicketStatus(id, newStatus);
      if (res.success) {
        toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
        setTicket((prev) => ({ ...prev, status: newStatus }));
        fetchActivities();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle agent assignment
  const handleAssignAgent = async () => {
    if (!selectedAgentId) {
      toast.error("Please select an agent to assign.");
      return;
    }
    try {
      setAssigning(true);
      const res = await ticketApi.assignTicket(id, selectedAgentId);
      if (res.success && res.ticket) {
        toast.success(res.message || "Ticket assigned successfully.");
        setTicket(res.ticket);
        setSelectedAgentId(res.ticket.assignedTo?._id || "");
        setIsAssignModalOpen(false);
        fetchActivities();
      } else {
        toast.error(res.message || "Failed to assign ticket.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to assign ticket.");
    } finally {
      setAssigning(false);
    }
  };

  // Handle adding comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await commentApi.addComment({
        ticketId: id,
        message: newComment.trim(),
        isInternal: canManage ? isInternal : false,
      });

      if (res.success) {
        setNewComment("");
        setIsInternal(false);
        toast.success(isInternal ? "Internal note posted." : "Comment posted.");
        fetchComments();
        fetchActivities();
      }
    } catch (err) {
      toast.error(err.message || "Failed to add comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle attaching file directly to ticket
  const handleAttachFile = async (e) => {
    e.preventDefault();
    if (!fileToAttach) return;

    try {
      setAttachingFile(true);
      const res = await fileApi.attachFileToTicket(id, fileToAttach);
      if (res.success) {
        toast.success("File attached to ticket!");
        setFileToAttach(null);
        fetchTicketData();
        fetchActivities();
      }
    } catch (err) {
      toast.error(err.message || "Failed to attach file.");
    } finally {
      setAttachingFile(false);
    }
  };

  // Handle ticket deletion
  const handleDeleteTicket = async () => {
    try {
      setDeleting(true);
      const res = await ticketApi.deleteTicket(id);
      if (res.success) {
        toast.success("Ticket deleted successfully.");
        navigate("/tickets");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete ticket.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size={32} text="Loading ticket details..." center />;
  }

  if (!ticket) return null;

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top action bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link to="/tickets" className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>All Tickets</span>
          </Link>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-subtle)", fontFamily: "monospace" }}>
            #{ticket._id.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isAdmin && (
            <button
              onClick={() => {
                setSelectedAgentId(ticket.assignedTo?._id || "");
                setIsAssignModalOpen(true);
              }}
              className="btn btn-secondary btn-sm"
            >
              <UserCheck size={16} />
              <span>{ticket.assignedTo ? "Reassign Agent" : "Assign Agent"}</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="btn btn-outline-danger btn-sm"
              title="Delete this ticket"
            >
              <Trash2 size={16} />
              <span>Delete Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Ticket Details + Sidebar Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "1.5rem",
          alignItems: "start",
        }}
        className="ticket-detail-grid"
      >
        {/* Left Column: Ticket Content, Attachments, Comments & Audit */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Ticket Header & Description Card */}
          <div className="card">
            <div className="card-header" style={{ alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <PriorityBadge priority={ticket.priority} />
                  <StatusBadge status={ticket.status} />
                </div>
                <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0, color: "var(--text-main)" }}>
                  {ticket.title}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem", fontSize: "0.775rem", color: "var(--text-subtle)", flexWrap: "wrap" }}>
                  <span>Created {new Date(ticket.createdAt).toLocaleString()}</span>
                  <span>&bull;</span>
                  <span>Updated {new Date(ticket.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="card-body">
              <h4 style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                Description
              </h4>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-main)",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {ticket.description}
              </p>

              {/* Tags */}
              {ticket.tags && ticket.tags.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Tags:</span>
                  {ticket.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "var(--bg-app)",
                        border: "1px solid var(--border-color)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--text-main)",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Paperclip size={18} color="var(--primary)" />
                <h3 className="card-title">Attachments ({ticket.attachments?.length || 0})</h3>
              </div>
            </div>

            <div className="card-body">
              {ticket.attachments && ticket.attachments.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem", marginBottom: "1.25rem" }}>
                  {ticket.attachments.map((filePath, index) => {
                    const normalized = filePath.replace(/\\/g, "/");
                    const fileUrl = `${API_BASE_URL}/${normalized}`;
                    const fileName = normalized.split("/").pop();

                    return (
                      <a
                        key={index}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card"
                        style={{
                          padding: "0.75rem 1rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          textDecoration: "none",
                          backgroundColor: "#fafbfc",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
                          <FileCheck size={18} color="var(--primary)" />
                          <span style={{ fontSize: "0.8125rem", color: "var(--text-main)", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }}>
                            {fileName}
                          </span>
                        </div>
                        <ExternalLink size={14} color="var(--text-subtle)" style={{ flexShrink: 0 }} />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize: "0.8125rem", color: "var(--text-subtle)", marginBottom: "1rem" }}>
                  No files attached to this ticket.
                </p>
              )}

              {/* Upload additional attachment directly */}
              <form onSubmit={handleAttachFile} style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", borderTop: "1px dashed var(--border-color)", paddingTop: "1rem" }}>
                <input
                  type="file"
                  id="ticket-file-attach"
                  style={{ display: "none" }}
                  onChange={(e) => setFileToAttach(e.target.files[0])}
                />
                <label
                  htmlFor="ticket-file-attach"
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: "pointer" }}
                >
                  <Upload size={14} />
                  <span>{fileToAttach ? fileToAttach.name : "Choose File to Attach"}</span>
                </label>

                {fileToAttach && (
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={attachingFile}
                  >
                    {attachingFile ? "Uploading..." : "Upload & Attach"}
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Conversation & Audit Tabs */}
          <div className="card">
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)", backgroundColor: "#fafbfc" }}>
              <button
                type="button"
                onClick={() => setActiveTab("comments")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.85rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: activeTab === "comments" ? 600 : 500,
                  color: activeTab === "comments" ? "var(--primary)" : "var(--text-muted)",
                  borderBottom: activeTab === "comments" ? "2px solid var(--primary)" : "2px solid transparent",
                  backgroundColor: activeTab === "comments" ? "#ffffff" : "transparent",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  cursor: "pointer",
                }}
              >
                <MessageSquare size={16} />
                <span>Discussion ({comments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("activities")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.85rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: activeTab === "activities" ? 600 : 500,
                  color: activeTab === "activities" ? "var(--primary)" : "var(--text-muted)",
                  borderBottom: activeTab === "activities" ? "2px solid var(--primary)" : "2px solid transparent",
                  backgroundColor: activeTab === "activities" ? "#ffffff" : "transparent",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  cursor: "pointer",
                }}
              >
                <History size={16} />
                <span>Audit Trail ({activities.length})</span>
              </button>
            </div>

            <div className="card-body">
              {activeTab === "comments" ? (
                <div>
                  {/* Comments list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                    {comments.length === 0 ? (
                      <p style={{ textAlign: "center", color: "var(--text-subtle)", padding: "1.5rem 0", fontSize: "0.875rem" }}>
                        No messages yet. Start the conversation below.
                      </p>
                    ) : (
                      comments.map((c) => (
                        <div
                          key={c._id}
                          style={{
                            padding: "1rem",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: c.isInternal ? "var(--warning-light)" : "#fafbfc",
                            border: `1px solid ${c.isInternal ? "var(--warning-border)" : "var(--border-color)"}`,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--text-main)" }}>
                                {c.user?.name || "User"}
                              </span>
                              <RoleBadge role={c.user?.role} />
                              {c.isInternal && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                    fontSize: "0.7rem",
                                    color: "var(--warning)",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  <Lock size={12} /> Internal Note
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: "0.725rem", color: "var(--text-subtle)" }}>
                              {new Date(c.createdAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <p style={{ fontSize: "0.875rem", color: "var(--text-main)", whiteSpace: "pre-wrap", margin: 0 }}>
                            {c.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleAddComment}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="new-comment-text">
                        Post a Reply
                      </label>
                      <textarea
                        id="new-comment-text"
                        className="form-textarea"
                        style={{ minHeight: "90px" }}
                        placeholder="Write your response or update..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                      {canManage && (
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--text-muted)", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                          />
                          <span>Make this an <strong>Internal Note</strong> (Hidden from requester)</span>
                        </label>
                      )}

                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        style={{ marginLeft: "auto" }}
                        disabled={submittingComment || !newComment.trim()}
                      >
                        <Send size={14} />
                        <span>{submittingComment ? "Posting..." : "Send Message"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Activity Log Timeline */
                <div style={{ position: "relative", paddingLeft: "1.5rem" }}>
                  {/* Timeline vertical line */}
                  <div
                    style={{
                      position: "absolute",
                      left: "7px",
                      top: "8px",
                      bottom: "8px",
                      width: "2px",
                      backgroundColor: "var(--border-color)",
                    }}
                  />

                  {activities.length === 0 ? (
                    <p style={{ color: "var(--text-subtle)", fontSize: "0.875rem" }}>
                      No activity events recorded yet.
                    </p>
                  ) : (
                    activities.map((act) => (
                      <div
                        key={act._id}
                        style={{
                          position: "relative",
                          marginBottom: "1.25rem",
                        }}
                      >
                        {/* Timeline dot */}
                        <div
                          style={{
                            position: "absolute",
                            left: "-1.5rem",
                            top: "3px",
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            backgroundColor: "var(--primary)",
                            border: "3px solid #ffffff",
                            boxShadow: "0 0 0 1px var(--border-color)",
                          }}
                        />

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <strong style={{ fontSize: "0.8125rem", color: "var(--text-main)" }}>
                              {act.action}
                            </strong>
                            <span style={{ fontSize: "0.725rem", color: "var(--text-subtle)" }}>
                              by {act.user?.name || "System"}
                            </span>
                          </div>

                          {act.details && (
                            <p style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                              {act.details}
                            </p>
                          )}

                          <span style={{ fontSize: "0.7rem", color: "var(--text-subtle)" }}>
                            {new Date(act.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: People, Status Controls & SLA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Status Changer Card (Agent/Admin) */}
          {canManage && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: "0.9375rem" }}>
                  Resolution Status
                </h3>
              </div>
              <div className="card-body">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="ticket-status-select">
                    Change State
                  </label>
                  <select
                    id="ticket-status-select"
                    className="form-select"
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting">Waiting on Customer</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* People Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: "0.9375rem" }}>
                Ticket Stakeholders
              </h3>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Requester */}
              <div>
                <span style={{ fontSize: "0.725rem", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
                  Requester
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginTop: "0.35rem" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
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
                    {ticket.createdBy?.name ? ticket.createdBy.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>
                      {ticket.createdBy?.name || "Unknown"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-subtle)" }}>
                      {ticket.createdBy?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignee */}
              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.725rem", color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
                    Assigned Agent
                  </span>
                  {ticket.assignedTo && (
                    <span
                      style={{
                        fontSize: "0.675rem",
                        fontWeight: 600,
                        color: "var(--purple)",
                        backgroundColor: "var(--purple-light)",
                        padding: "0.1rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid var(--purple-border)",
                      }}
                    >
                      Assigned
                    </span>
                  )}
                </div>

                {/* Current Agent display */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: isAdmin ? "0.75rem" : 0 }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: ticket.assignedTo ? "var(--purple-light)" : "#f1f5f9",
                      color: ticket.assignedTo ? "var(--purple)" : "var(--text-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      flexShrink: 0,
                    }}
                  >
                    {ticket.assignedTo?.name ? ticket.assignedTo.name[0].toUpperCase() : "?"}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: ticket.assignedTo ? "var(--text-main)" : "var(--text-subtle)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ticket.assignedTo?.name || "Unassigned"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-subtle)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ticket.assignedTo?.email || "No agent claimed"}
                    </div>
                  </div>
                </div>

                {/* Admin Assignment Dropdown and Action Button */}
                {isAdmin && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <select
                      id="assigned-agent-select"
                      aria-label="Assign Agent"
                      className="form-select"
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      disabled={assigning || loadingAgents}
                      style={{
                        fontSize: "0.8125rem",
                        padding: "0.45rem 0.65rem",
                        borderRadius: "var(--radius-md)",
                        borderColor: "var(--border-color)",
                        backgroundColor: "#ffffff",
                        cursor: assigning || loadingAgents ? "not-allowed" : "pointer",
                      }}
                    >
                      <option value="">
                        {loadingAgents
                          ? "Loading agents..."
                          : agents.length === 0
                          ? "No agents available"
                          : "-- Select an Agent --"}
                      </option>
                      {agents.map((ag) => (
                        <option key={ag._id} value={ag._id}>
                          {ag.name} ({ag.email})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      id="assign-agent-btn"
                      aria-label="Assign Agent"
                      className="btn btn-primary btn-sm"
                      onClick={handleAssignAgent}
                      disabled={assigning || loadingAgents || !selectedAgentId}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.35rem",
                        fontSize: "0.8125rem",
                        padding: "0.45rem 0.75rem",
                        fontWeight: 500,
                      }}
                    >
                      <UserCheck size={14} />
                      <span>
                        {assigning
                          ? "Assigning..."
                          : ticket.assignedTo && selectedAgentId !== (ticket.assignedTo._id || ticket.assignedTo)
                          ? "Reassign Agent"
                          : "Assign Agent"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SLA Tracking Info Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: "0.9375rem" }}>
                SLA & Timelines
              </h3>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8125rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Created</span>
                <span style={{ fontWeight: 500 }}>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Target SLA</span>
                <span style={{ fontWeight: 500, color: ticket.priority === "urgent" ? "var(--danger)" : "var(--text-main)" }}>
                  {ticket.priority === "urgent" ? "4 Hours" : ticket.priority === "high" ? "8 Hours" : "24 Hours"}
                </span>
              </div>

              {ticket.resolvedAt && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--success)" }}>Resolved On</span>
                  <span style={{ fontWeight: 600, color: "var(--success)" }}>
                    {new Date(ticket.resolvedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reassign Agent Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Support Ticket"
        subtitle="Select a qualified support agent to handle this issue"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAssignModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAssignAgent}
              disabled={assigning || !selectedAgentId}
            >
              {assigning ? "Assigning..." : "Confirm Assignment"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="agent-select">
            Available Agents
          </label>
          <select
            id="agent-select"
            className="form-select"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
          >
            <option value="">-- Select an Agent --</option>
            {agents.map((ag) => (
              <option key={ag._id} value={ag._id}>
                {ag.name} ({ag.email}) - {ag.role.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      {/* Delete Ticket Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTicket}
        title="Delete Support Ticket"
        message="Are you sure you want to delete this ticket? All associated comments and activity logs will be permanently erased."
        confirmLabel="Yes, Delete Ticket"
        isLoading={deleting}
      />
    </div>
  );
};

export default TicketDetailPage;
