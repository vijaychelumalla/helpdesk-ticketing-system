import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Lock, Mail, ArrowRight, ShieldCheck, Headphones, User, AlertCircle } from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExpired = searchParams.get("expired") === "true";

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate("/dashboard");
      } else {
        setFormError(res.message || "Failed to log in.");
      }
    } catch (err) {
      setFormError(err.message || "Invalid credentials. Please verify and try again.");
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFormError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-app)",
        padding: "1.5rem",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "460px",
          boxShadow: "var(--shadow-lg)",
          borderRadius: "var(--radius-xl)",
        }}
      >
        <div style={{ padding: "2rem 2rem 1.5rem 2rem", textAlign: "center", borderBottom: "1px solid var(--border-color)" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--primary)",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "1.3rem",
              margin: "0 auto 1rem auto",
              boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.3)",
            }}
          >
            DF
          </div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0 0 0.35rem 0" }}>
            Sign in to DeskFlow
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            IT Helpdesk & Support Ticketing Portal
          </p>
        </div>

        <div style={{ padding: "2rem" }}>
          {isExpired && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
                backgroundColor: "var(--warning-light)",
                border: "1px solid var(--warning-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--warning)",
                fontSize: "0.8125rem",
                marginBottom: "1.25rem",
              }}
            >
              <AlertCircle size={16} />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {formError && (
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
                marginBottom: "1.25rem",
              }}
            >
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address <span className="required">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={18}
                  style={{
                    position: "absolute",
                    left: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-subtle)",
                  }}
                />
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>
                  Password <span className="required">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: "0.775rem", color: "var(--primary)" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative", marginTop: "0.375rem" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "0.85rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-subtle)",
                  }}
                />
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={loading}
            >
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Viva / Demo Accounts */}
          <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px dashed var(--border-color)" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.75rem", textAlign: "center" }}>
              QUICK TEST CREDENTIALS (CLICK TO FILL)
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => setDemoCredentials("akhil@gmail.com", "123456")}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem", padding: "0.4rem 0.2rem" }}
                title="akhil@gmail.com / 123456"
              >
                <ShieldCheck size={14} color="#db2777" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials("agent@gmail.com", "123456")}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem", padding: "0.4rem 0.2rem" }}
                title="agent@gmail.com / 123456"
              >
                <Headphones size={14} color="var(--purple)" />
                <span>Agent</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials("krish@gmail.com", "123456")}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: "0.75rem", padding: "0.4rem 0.2rem" }}
                title="krish@gmail.com / 123456"
              >
                <User size={14} color="var(--primary)" />
                <span>Customer</span>
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "1rem 2rem",
            backgroundColor: "#fafbfc",
            borderTop: "1px solid var(--border-color)",
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
          }}
        >
          Don't have an account?{" "}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
