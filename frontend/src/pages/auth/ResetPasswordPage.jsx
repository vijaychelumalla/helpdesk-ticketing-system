import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import { useToast } from "../../context/ToastContext";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, password);
      if (res.success) {
        setSuccess(true);
        toast.success("Password reset successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      } else {
        setError(res.message || "Invalid or expired reset token.");
      }
    } catch (err) {
      setError(err.message || "Invalid or expired token. Please request a new link.");
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
            Create New Password
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Please choose a strong password for your account
          </p>
        </div>

        <div style={{ padding: "2rem" }}>
          {success ? (
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
              <h3 style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>Password Updated!</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                Your password has been changed. Redirecting to login...
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: "100%" }}>
                <span>Go to Login Now</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset}>
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
                <label className="form-label" htmlFor="reset-pass">
                  New Password <span className="required">*</span>
                </label>
                <div style={{ position: "relative" }}>
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
                    id="reset-pass"
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: "2.5rem" }}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reset-confirm">
                  Confirm New Password <span className="required">*</span>
                </label>
                <div style={{ position: "relative" }}>
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
                    id="reset-confirm"
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: "2.5rem" }}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
