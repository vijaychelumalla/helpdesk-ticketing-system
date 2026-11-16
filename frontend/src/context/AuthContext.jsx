import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authApi from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("helpdesk_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("helpdesk_token"));
  const [loading, setLoading] = useState(true);

  // Initialize and verify session on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("helpdesk_token");
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem("helpdesk_user", JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("helpdesk_token", res.token);
      localStorage.setItem("helpdesk_user", JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    return res;
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("helpdesk_token");
    localStorage.removeItem("helpdesk_user");
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    role: user?.role,
    isAdmin: user?.role === "admin",
    isAgent: user?.role === "agent",
    isCustomer: user?.role === "customer",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
