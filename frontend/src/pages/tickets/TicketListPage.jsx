import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ticketApi from "../../api/ticketApi";
import userApi from "../../api/userApi";
import StatusBadge from "../../components/common/StatusBadge";
import PriorityBadge from "../../components/common/PriorityBadge";
import Pagination from "../../components/common/Pagination";
import LoadingSpinner, { TableSkeleton } from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  Search,
  Filter,
  Plus,
  RotateCcw,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";

export const TicketListPage = () => {
  const { user, role, isAdmin, isCustomer } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);

  // Search & Filter state
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [priority, setPriority] = useState(searchParams.get("priority") || "");
  const [assignedTo, setAssignedTo] = useState(searchParams.get("assignedTo") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load agents for assignment filter (for Admin / Agent)
  useEffect(() => {
    if (!isCustomer) {
      userApi
        .getUsers({ role: "agent" })
        .then((res) => {
          if (res.success && res.users) {
            setAgents(res.users);
          }
        })
        .catch(() => {});
    }
  }, [isCustomer]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (assignedTo) params.assignedTo = assignedTo;

      const res = await ticketApi.getTickets(params);
      if (res.success) {
        setTickets(res.tickets || []);
        setTotal(res.total || 0);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, assignedTo, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPriority("");
    setAssignedTo("");
    setPage(1);
  };

  const handleDeleteTicket = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const res = await ticketApi.deleteTicket(deleteId);
      if (res.success) {
        toast.success("Ticket deleted successfully.");
        setDeleteId(null);
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete ticket.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>
            Support Tickets
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            {isCustomer
              ? "All your submitted technical and IT support requests"
              : "Enterprise ticket queue with multi-filter sorting and assignment"}
          </p>
        </div>

        <Link to="/tickets/new" className="btn btn-primary">
          <Plus size={16} />
          <span>New Ticket</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Search Input */}
            <div style={{ position: "relative", flex: "1 1 280px" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-subtle)",
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: "2.35rem" }}
                placeholder="Search ticket title or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div style={{ flex: "0 1 170px" }}>
              <select
                className="form-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting">Waiting</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div style={{ flex: "0 1 160px" }}>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Assignee Filter (Admin/Agent) */}
            {!isCustomer && (
              <div style={{ flex: "0 1 180px" }}>
                <select
                  className="form-select"
                  value={assignedTo}
                  onChange={(e) => {
                    setAssignedTo(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Assignees</option>
                  {agents.map((ag) => (
                    <option key={ag._id} value={ag._id}>
                      {ag.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" className="btn btn-secondary btn-sm" title="Apply search">
                Search
              </button>
              {(search || status || priority || assignedTo) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-ghost btn-sm"
                  title="Clear all filters"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Ticket List Table */}
      <div className="card">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets found"
            description="No tickets match your filter criteria or search keyword."
            actionLabel="Create New Ticket"
            onAction={() => window.location.href = "/tickets/new"}
          />
        ) : (
          <>
            <div className="table-container" style={{ border: "none", borderRadius: 0, boxShadow: "none" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket ID & Title</th>
                    <th>Requester</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t._id}>
                      <td style={{ maxWidth: "300px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-subtle)", fontWeight: 600 }}>
                              #{t._id.slice(-6).toUpperCase()}
                            </span>
                            {t.attachments && t.attachments.length > 0 && (
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  backgroundColor: "#f1f5f9",
                                  color: "var(--text-muted)",
                                  padding: "1px 5px",
                                  borderRadius: "4px",
                                }}
                              >
                                {t.attachments.length} file{t.attachments.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <Link
                            to={`/tickets/${t._id}`}
                            style={{
                              fontWeight: 600,
                              color: "var(--text-main)",
                              fontSize: "0.875rem",
                              display: "inline-block",
                              marginTop: "2px",
                            }}
                          >
                            {t.title}
                          </Link>
                          {t.tags && t.tags.length > 0 && (
                            <div style={{ display: "flex", gap: "0.25rem", marginTop: "3px", flexWrap: "wrap" }}>
                              {t.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  style={{
                                    fontSize: "0.68rem",
                                    backgroundColor: "var(--bg-app)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "3px",
                                    padding: "0 4px",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: "0.8125rem", color: "var(--text-main)" }}>
                          {t.createdBy?.name || "Unknown"}
                        </span>
                        <div style={{ fontSize: "0.725rem", color: "var(--text-subtle)" }}>
                          {t.createdBy?.email}
                        </div>
                      </td>

                      <td>
                        {t.assignedTo ? (
                          <div>
                            <span style={{ fontSize: "0.8125rem", color: "var(--text-main)" }}>
                              {t.assignedTo.name}
                            </span>
                            <div style={{ fontSize: "0.725rem", color: "var(--text-subtle)" }}>
                              {t.assignedTo.email}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: "0.8125rem", color: "var(--text-subtle)", fontStyle: "italic" }}>
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td>
                        <PriorityBadge priority={t.priority} />
                      </td>

                      <td>
                        <StatusBadge status={t.status} />
                      </td>

                      <td>
                        <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                          {new Date(t.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                          <Link
                            to={`/tickets/${t._id}`}
                            className="btn btn-secondary btn-sm"
                            title="View details"
                          >
                            <span>Details</span>
                            <ChevronRight size={14} />
                          </Link>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteId(t._id)}
                              className="btn btn-outline-danger btn-sm"
                              style={{ padding: "0.35rem 0.5rem" }}
                              title="Delete ticket"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={10}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </>
        )}
      </div>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteTicket}
        title="Delete Support Ticket"
        message="Are you sure you want to permanently delete this ticket and all its activity logs? This cannot be undone."
        confirmLabel="Yes, Delete Ticket"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TicketListPage;
