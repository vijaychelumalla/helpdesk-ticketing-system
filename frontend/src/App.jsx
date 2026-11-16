import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

import ProtectedRoute from "./components/common/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Portal Pages
import DashboardPage from "./pages/dashboard/DashboardPage";
import TicketListPage from "./pages/tickets/TicketListPage";
import CreateTicketPage from "./pages/tickets/CreateTicketPage";
import TicketDetailPage from "./pages/tickets/TicketDetailPage";
import UserManagementPage from "./pages/users/UserManagementPage";
import ReportsPage from "./pages/reports/ReportsPage";
import NotFoundPage from "./pages/NotFoundPage";

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Protected Routes inside AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tickets" element={<TicketListPage />} />
                <Route path="/tickets/new" element={<CreateTicketPage />} />
                <Route path="/tickets/:id" element={<TicketDetailPage />} />

                {/* Agent & Admin Only */}
                <Route element={<ProtectedRoute allowedRoles={["agent", "admin"]} />}>
                  <Route path="/reports" element={<ReportsPage />} />
                </Route>

                {/* Admin Only */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                  <Route path="/users" element={<UserManagementPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>

            {/* Global Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
