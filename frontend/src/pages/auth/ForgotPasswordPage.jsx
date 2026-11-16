import React, { useState } from "react";
import { Link } from "react-router-dom";
import authApi from "../../api/authApi";
import { useToast } from "../../context/ToastContext";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      if (res.success) {
        setSubmitted(true);
        toast.success("Password reset instructions sent.");
      } else {
        setError(res.message || "Failed to request password reset.");
      }
    } catch (err) {
      setError(err.message || "No account found with this email.");
    } finally {
      setLoading(false);
    }
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
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0 0 0.35rem 0" }}>
            Reset Password
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Enter your registered email to receive a recovery link
          </p>
        </div>

        <div style={{ padding: "2rem" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  backgroundColor: "var(--success-light)",
                  color: "var(--success)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem auto",
                }}
              >
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>Check Your Inbox</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                We've sent password reset instructions to <strong>{email}</strong>.
              </p>
              <Link to="/login" className="btn btn-secondary" style={{ width: "100%" }}>
                <ArrowLeft size={16} />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
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
                    marginBottom: "1.25rem",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="forgot-email">
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
                    id="forgot-email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: "2.5rem" }}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Sending link..." : "Send Reset Link"}
              </button>

              <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
                <Link
                  to="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
