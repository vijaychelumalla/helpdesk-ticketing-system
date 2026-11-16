import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { User, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.email || !formData.password) {
      setFormError("All required fields must be filled.");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (res.success) {
        toast.success("Account created successfully! Please sign in.");
        navigate("/login");
      } else {
        setFormError(res.message || "Failed to register.");
      }
    } catch (err) {
      setFormError(err.message || "User already exists or registration failed.");
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
          maxWidth: "480px",
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
            }}
          >
            DF
          </div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: "0 0 0.35rem 0" }}>
            Create an Account
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Join DeskFlow IT Support Management
          </p>
        </div>

        <div style={{ padding: "2rem" }}>
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

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                Full Name <span className="required">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <User
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
                  id="register-name"
                  name="name"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
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
                  id="register-email"
                  name="email"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="register-password">
                  Password <span className="required">*</span>
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
                    id="register-password"
                    name="password"
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: "2.5rem" }}
                    placeholder="Min 6 chars"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="register-confirmPassword">
                  Confirm <span className="required">*</span>
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
                    id="register-confirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="form-input"
                    style={{ paddingLeft: "2.5rem" }}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-role">
                Account Type / Role
              </label>
              <select
                id="register-role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">Customer / Requester (Submit Tickets)</option>
                <option value="agent">Support Agent (Handle & Resolve Tickets)</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "0.75rem" }}
              disabled={loading}
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
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
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
