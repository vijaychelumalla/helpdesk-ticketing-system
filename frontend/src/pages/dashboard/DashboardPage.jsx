import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import dashboardApi from "../../api/dashboardApi";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import PriorityBadge from "../../components/common/PriorityBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Calendar,
} from "lucide-react";

export const DashboardPage = () => {
  const { user, role, isCustomer, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getDashboardStats();
      if (res.success) {
        setStats(res.stats);
        setRecentTickets(res.recentTickets || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner size={32} text="Loading dashboard analytics..." center />;
  }

  if (error) {
    return (
      <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
        <p style={{ color: "var(--danger)", marginBottom: "1rem" }}>{error}</p>
        <button onClick={fetchStats} className="btn btn-primary btn-sm">
          Try Again
        </button>
      </div>
    );
  }

  const total = stats?.totalTickets || 0;
  const openCount = stats?.openTickets || 0;
  const inProgressCount = stats?.inProgressTickets || 0;
  const waitingCount = stats?.waitingTickets || 0;
  const resolvedCount = stats?.resolvedTickets || 0;
  const closedCount = stats?.closedTickets || 0;

  // Calculate percentages for progress bars
  const openPct = total > 0 ? Math.round((openCount / total) * 100) : 0;
  const inProgressPct = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;
  const resolvedPct = total > 0 ? Math.round(((resolvedCount + closedCount) / total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Welcome banner */}
      <div
        className="card"
        style={{
          padding: "1.5rem 1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <div>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Overview Portal
          </span>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0.25rem 0 0.25rem 0" }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {isCustomer
              ? "Track your submitted IT requests and support correspondence."
              : `Logged in as ${role.toUpperCase()}. Monitor system queues, assign tickets, and resolve issues.`}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/tickets/new" className="btn btn-primary">
            <Plus size={16} />
            <span>Create New Ticket</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <StatCard
          title={isCustomer ? "My Total Tickets" : "Total System Tickets"}
          value={total}
          icon={Ticket}
          color="var(--primary)"
          bgColor="var(--primary-light)"
          subtitle="All recorded tickets"
        />
        <StatCard
          title="Open Tickets"
          value={openCount}
          icon={AlertCircle}
          color="#0284c7"
          bgColor="var(--info-light)"
          subtitle="Awaiting agent action"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={Clock}
          color="var(--purple)"
          bgColor="var(--purple-light)"
          subtitle="Actively being investigated"
        />
        <StatCard
          title="Resolved & Closed"
          value={resolvedCount + closedCount}
          icon={CheckCircle2}
          color="var(--success)"
          bgColor="var(--success-light)"
          subtitle={`${resolvedCount} resolved, ${closedCount} closed`}
        />
      </div>

      {/* Analytics & Priority Breakdown Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {/* Status Distribution Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Ticket Status Distribution</h3>
              <p className="card-subtitle">Real-time status breakdown</p>
            </div>
            <TrendingUp size={18} color="var(--primary)" />
          </div>

          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.35rem" }}>
                <span style={{ fontWeight: 500, color: "var(--text-main)" }}>Open Tickets</span>
                <span style={{ color: "var(--text-muted)" }}>{openCount} ({openPct}%)</span>
              </div>
              <div style={{ height: "8px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${openPct}%`, height: "100%", backgroundColor: "var(--primary)", borderRadius: "4px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.35rem" }}>
                <span style={{ fontWeight: 500, color: "var(--text-main)" }}>In Progress</span>
                <span style={{ color: "var(--text-muted)" }}>{inProgressCount} ({inProgressPct}%)</span>
              </div>
              <div style={{ height: "8px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${inProgressPct}%`, height: "100%", backgroundColor: "var(--purple)", borderRadius: "4px" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.35rem" }}>
                <span style={{ fontWeight: 500, color: "var(--text-main)" }}>Resolved / Closed</span>
                <span style={{ color: "var(--text-muted)" }}>{resolvedCount + closedCount} ({resolvedPct}%)</span>
              </div>
              <div style={{ height: "8px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${resolvedPct}%`, height: "100%", backgroundColor: "var(--success)", borderRadius: "4px" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Priority Breakdown</h3>
              <p className="card-subtitle">Urgency classification of tickets</p>
            </div>
            <BarChart2 size={18} color="var(--purple)" />
          </div>

          <div
            className="card-body"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div style={{ padding: "0.85rem", backgroundColor: "#fafbfc", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Urgent</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--danger)" }}>
                {stats?.urgentPriority || 0}
              </div>
            </div>

            <div style={{ padding: "0.85rem", backgroundColor: "#fafbfc", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>High</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#c2410c" }}>
                {stats?.highPriority || 0}
              </div>
            </div>

            <div style={{ padding: "0.85rem", backgroundColor: "#fafbfc", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Medium</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--info)" }}>
                {stats?.mediumPriority || 0}
              </div>
            </div>

            <div style={{ padding: "0.85rem", backgroundColor: "#fafbfc", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Low</div>
              <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#475569" }}>
                {stats?.lowPriority || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Support Tickets</h3>
            <p className="card-subtitle">Latest tickets updated in the system</p>
          </div>
          <Link to="/tickets" className="btn btn-ghost btn-sm">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            description="You don't have any support tickets filed yet."
            actionLabel="Create First Ticket"
            onAction={() => window.location.href = "/tickets/new"}
          />
        ) : (
          <div className="table-container" style={{ border: "none", borderRadius: 0, boxShadow: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Requester</th>
                  <th>Assigned Agent</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div>
                        <Link
                          to={`/tickets/${t._id}`}
                          style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "0.875rem" }}
                        >
                          {t.title}
                        </Link>
                        <div style={{ fontSize: "0.725rem", color: "var(--text-subtle)", marginTop: "2px" }}>
                          ID: #{t._id.slice(-6).toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8125rem", color: "var(--text-main)" }}>
                        {t.createdBy?.name || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8125rem", color: t.assignedTo ? "var(--text-main)" : "var(--text-subtle)" }}>
                        {t.assignedTo?.name || "Unassigned"}
                      </span>
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
                      <Link to={`/tickets/${t._id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
