import React, { useEffect, useState } from "react";
import dashboardApi from "../../api/dashboardApi";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  ShieldAlert,
  Award,
} from "lucide-react";

export const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getDashboardStats()
      .then((res) => {
        if (res.success) {
          setStats(res.stats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner size={32} text="Generating SLA & Performance Reports..." center />;
  }

  const total = stats?.totalTickets || 0;
  const resolved = (stats?.resolvedTickets || 0) + (stats?.closedTickets || 0);
  const open = stats?.openTickets || 0;
  const inProgress = stats?.inProgressTickets || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>
            SLA & Operational Performance Report
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Service Level Agreement compliance, ticket throughput, and resolution analytics
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="btn btn-secondary btn-sm"
        >
          <Printer size={16} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* SLA Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        <div className="card" style={{ padding: "1.25rem 1.5rem", borderLeft: "4px solid var(--success)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>Overall Resolution Rate</span>
            <Award size={20} color="var(--success)" />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-main)" }}>
            {resolutionRate}%
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginTop: "0.25rem" }}>
            {resolved} of {total} tickets resolved
          </p>
        </div>

        <div className="card" style={{ padding: "1.25rem 1.5rem", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>Active Queue Volume</span>
            <Clock size={20} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-main)" }}>
            {open + inProgress}
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginTop: "0.25rem" }}>
            {open} open, {inProgress} in progress
          </p>
        </div>

        <div className="card" style={{ padding: "1.25rem 1.5rem", borderLeft: "4px solid var(--danger)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>High & Urgent Tickets</span>
            <ShieldAlert size={20} color="var(--danger)" />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--danger)" }}>
            {(stats?.highPriority || 0) + (stats?.urgentPriority || 0)}
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginTop: "0.25rem" }}>
            Critical SLA attention required
          </p>
        </div>
      </div>

      {/* SLA Policy Standard Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">SLA Thresholds & Policy Matrix</h3>
        </div>

        <div className="table-container" style={{ border: "none", borderRadius: 0, boxShadow: "none" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Priority Level</th>
                <th>First Response Target</th>
                <th>Target Resolution Time</th>
                <th>Escalation Path</th>
                <th>Current Volume</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong style={{ color: "var(--danger)" }}>Urgent (Critical)</strong>
                </td>
                <td>&lt; 30 Minutes</td>
                <td>4 Hours</td>
                <td>Senior Tier 3 Engineer + On-Call Lead</td>
                <td><strong>{stats?.urgentPriority || 0}</strong></td>
              </tr>
              <tr>
                <td>
                  <strong style={{ color: "#c2410c" }}>High</strong>
                </td>
                <td>&lt; 2 Hours</td>
                <td>8 Hours</td>
                <td>Tier 2 Specialist</td>
                <td><strong>{stats?.highPriority || 0}</strong></td>
              </tr>
              <tr>
                <td>
                  <strong style={{ color: "var(--info)" }}>Medium</strong>
                </td>
                <td>&lt; 4 Hours</td>
                <td>24 Hours</td>
                <td>Standard Queue Agent</td>
                <td><strong>{stats?.mediumPriority || 0}</strong></td>
              </tr>
              <tr>
                <td>
                  <strong style={{ color: "#475569" }}>Low</strong>
                </td>
                <td>&lt; 8 Hours</td>
                <td>48 Hours</td>
                <td>Self-service / Service Desk</td>
                <td><strong>{stats?.lowPriority || 0}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
