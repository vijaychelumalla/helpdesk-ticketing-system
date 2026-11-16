import React, { useEffect, useState, useCallback } from "react";
import userApi from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import RoleBadge from "../../components/common/RoleBadge";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import LoadingSpinner, { TableSkeleton } from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import {
  UserPlus,
  Search,
  ShieldCheck,
  Headphones,
  User,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";

export const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  // Create User Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "agent",
  });

  // Edit / Status Modal state
  const [editUser, setEditUser] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Dialog state
  const [deleteUserObj, setDeleteUserObj] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;

      const res = await userApi.getUsers(params);
      if (res.success) {
        setUsers(res.users || []);
        setTotal(res.total || 0);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setPage(1);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setCreating(true);
      const res = await userApi.createUser(newUser);
      if (res.success) {
        toast.success(`User ${newUser.name} created successfully!`);
        setIsCreateOpen(false);
        setNewUser({ name: "", email: "", password: "", role: "agent" });
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || "Failed to create user.");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      setSavingEdit(true);
      const res = await userApi.updateUser(editUser._id, {
        name: editUser.name,
        role: editUser.role,
        isActive: editUser.isActive,
      });

      if (res.success) {
        toast.success("User updated successfully.");
        setEditUser(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update user.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserObj) return;

    try {
      setDeleting(true);
      const res = await userApi.deleteUser(deleteUserObj._id);
      if (res.success) {
        toast.success("User account deleted.");
        setDeleteUserObj(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>
            User & Agent Directory
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            Administer customer accounts, support agents, and system permissions
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary"
        >
          <UserPlus size={16} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: "1.25rem" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
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
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ flex: "0 1 180px" }}>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="agent">Support Agent</option>
              <option value="customer">Customer / Requester</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>

          {(search || roleFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-ghost btn-sm"
              title="Reset filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </form>
      </div>

      {/* User Table */}
      <div className="card">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="No user accounts match your search filters."
          />
        ) : (
          <>
            <div className="table-container" style={{ border: "none", borderRadius: 0, boxShadow: "none" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Member Since</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = currentUser?._id === u._id;

                    return (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
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
                              {u.name ? u.name[0].toUpperCase() : "U"}
                            </div>
                            <div>
                              <strong style={{ fontSize: "0.875rem", color: "var(--text-main)" }}>
                                {u.name}
                              </strong>
                              {isSelf && (
                                <span
                                  style={{
                                    marginLeft: "0.35rem",
                                    fontSize: "0.7rem",
                                    color: "var(--primary)",
                                    fontWeight: 600,
                                  }}
                                >
                                  (You)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                          {u.email}
                        </td>

                        <td>
                          <RoleBadge role={u.role} />
                        </td>

                        <td>
                          {u.isActive !== false ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                color: "var(--success)",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              <CheckCircle2 size={13} /> Active
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                color: "var(--danger)",
                                fontSize: "0.75rem",
                                fontWeight: 500,
                              }}
                            >
                              <XCircle size={13} /> Inactive
                            </span>
                          )}
                        </td>

                        <td style={{ fontSize: "0.775rem", color: "var(--text-subtle)" }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                            <button
                              type="button"
                              onClick={() => setEditUser({ ...u })}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: "0.35rem 0.5rem" }}
                              title="Edit user"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>

                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => setDeleteUserObj(u)}
                                className="btn btn-outline-danger btn-sm"
                                style={{ padding: "0.35rem 0.5rem" }}
                                title="Delete user"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New User"
        subtitle="Add a new member to the helpdesk system"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCreateUser}
              disabled={creating}
            >
              {creating ? "Creating..." : "Create User"}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="new-name"
              type="text"
              className="form-input"
              placeholder="e.g. Sarah Connor"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-email">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="new-email"
              type="email"
              className="form-input"
              placeholder="sarah@company.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-password">
              Password <span className="required">*</span>
            </label>
            <input
              id="new-password"
              type="password"
              className="form-input"
              placeholder="Min 6 characters"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-role">
              System Role
            </label>
            <select
              id="new-role"
              className="form-select"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="customer">Customer / Requester</option>
              <option value="agent">Support Agent</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editUser && (
        <Modal
          isOpen={!!editUser}
          onClose={() => setEditUser(null)}
          title="Edit User Profile"
          subtitle={`Updating user account: ${editUser.email}`}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEditUser(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </>
          }
        >
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-name">
                Full Name
              </label>
              <input
                id="edit-name"
                type="text"
                className="form-input"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-role">
                System Role
              </label>
              <select
                id="edit-role"
                className="form-select"
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
              >
                <option value="customer">Customer / Requester</option>
                <option value="agent">Support Agent</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={editUser.isActive !== false}
                  onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })}
                />
                <span>Account is Active and allowed to sign in</span>
              </label>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteUserObj}
        onClose={() => setDeleteUserObj(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to delete ${deleteUserObj?.name} (${deleteUserObj?.email})? This action cannot be undone.`}
        confirmLabel="Yes, Delete User"
        isLoading={deleting}
      />
    </div>
  );
};

export default UserManagementPage;
