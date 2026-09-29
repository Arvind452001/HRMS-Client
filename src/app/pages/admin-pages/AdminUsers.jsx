import { useEffect, useState } from "react";
import { Search, Plus, KeyRound, Trash2, ShieldCheck, Power } from "lucide-react";
import Loader from "../../../components/Loader";
import {
  getAllUsersApi,
  createStaffUserApi,
  updateUserRolesApi,
  toggleUserStatusApi,
  adminResetPasswordApi,
  deleteUserApi,
} from "../../../api/adminPanelApi";
import { showSuccess, showError, showConfirm } from "../../../utils/alert";

const ALL_ROLES = ["employee", "hr", "admin"];

const emptyForm = {
  fullName: "",
  officialEmail: "",
  password: "",
  roles: ["employee"],
  department: "",
  designation: "",
  contactNo: "",
};

const RoleBadge = ({ role }) => {
  const tint =
    role === "admin"
      ? "bg-purple-100 text-purple-700"
      : role === "hr"
      ? "bg-amber-100 text-amber-700"
      : "bg-sky-100 text-sky-700";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${tint}`}>
      {role}
    </span>
  );
};

export default function AdminUsers() {
  const currentUserId = (() => {
    try {
      return JSON.parse(localStorage.getItem("technoUser") || "{}")?.id;
    } catch {
      return null;
    }
  })();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const [rolesModalUser, setRolesModalUser] = useState(null);
  const [rolesDraft, setRolesDraft] = useState([]);

  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsersApi({
        search: search || undefined,
        role: roleFilter || undefined,
        limit: 100,
      });
      setUsers(res?.data || []);
      setTotal(res?.total ?? 0);
    } catch (err) {
      showError("Error", err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // CREATE STAFF

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await createStaffUserApi(form);
      showSuccess("Account created", res?.message || "Staff account created successfully");
      setCreateOpen(false);
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      showError("Error", err?.message || "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFormRole = (role) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role)
        ? f.roles.filter((r) => r !== role)
        : [...f.roles, role],
    }));
  };

  // ROLE MANAGEMENT

  const openRolesModal = (user) => {
    setRolesModalUser(user);
    setRolesDraft(user.roles || []);
  };

  const toggleDraftRole = (role) => {
    setRolesDraft((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const saveRoles = async () => {
    if (rolesDraft.length === 0) {
      showError("Error", "At least one role is required");
      return;
    }
    try {
      await updateUserRolesApi(rolesModalUser._id, rolesDraft);
      showSuccess("Updated", "Roles updated successfully");
      setRolesModalUser(null);
      fetchUsers();
    } catch (err) {
      showError("Error", err?.message || "Failed to update roles");
    }
  };

  // STATUS TOGGLE

  const handleToggleStatus = async (user) => {
    const activating = user.professional?.status !== "Active";
    const confirmed = await showConfirm({
      title: activating ? "Activate this account?" : "Deactivate this account?",
      text: activating
        ? "The user will be able to log in again."
        : "The user will immediately lose access to the system.",
      confirmButtonText: activating ? "Yes, activate" : "Yes, deactivate",
      danger: !activating,
    });
    if (!confirmed) return;

    try {
      const res = await toggleUserStatusApi(user._id);
      showSuccess("Updated", res?.message);
      fetchUsers();
    } catch (err) {
      showError("Error", err?.message || "Failed to update status");
    }
  };

  // RESET PASSWORD

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showError("Error", "Password must be at least 6 characters");
      return;
    }
    try {
      const res = await adminResetPasswordApi(resetModalUser._id, newPassword);
      showSuccess("Password reset", res?.message);
      setResetModalUser(null);
      setNewPassword("");
    } catch (err) {
      showError("Error", err?.message || "Failed to reset password");
    }
  };

  // DELETE

  const handleDelete = async (user) => {
    const confirmed = await showConfirm({
      title: "Delete this account?",
      text: `This permanently removes ${user.personal?.fullName}'s account. This cannot be undone.`,
      confirmButtonText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await deleteUserApi(user._id);
      showSuccess("Deleted", "Account deleted successfully");
      fetchUsers();
    } catch (err) {
      showError("Error", err?.message || "Failed to delete account");
    }
  };

  return (
    <div className="w-full min-h-screen space-y-5">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/80 backdrop-blur-xl border border-sky-100 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-sky-600 text-2xl font-bold">Users &amp; Roles</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage every account in the system — employees, HR, and other admins.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="btn bg-sky-600 border-0 text-white hover:bg-sky-700 rounded-xl"
        >
          <Plus size={16} /> New Staff Account
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by name, email, employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered rounded-xl w-full"
          />
          <button type="submit" className="btn btn-ghost rounded-xl">
            <Search size={18} />
          </button>
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="select select-bordered rounded-xl"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="card bg-base-100 shadow-xl border border-base-200 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Loader />
            </div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center text-gray-500 text-sm">No users found</div>
          ) : (
            <table className="table table-zebra w-full min-w-[850px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <p className="font-medium text-gray-800">{user.personal?.fullName}</p>
                      <p className="text-xs text-gray-400">{user.professional?.employeeId}</p>
                    </td>
                    <td className="text-sm text-gray-600">{user.account?.officialEmail}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(user.roles || []).map((r) => (
                          <RoleBadge key={r} role={r} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.professional?.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {user.professional?.status || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Manage roles"
                          onClick={() => openRolesModal(user)}
                          className="btn btn-ghost btn-sm text-sky-600"
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <button
                          title="Reset password"
                          onClick={() => setResetModalUser(user)}
                          className="btn btn-ghost btn-sm text-amber-600"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          title={user.professional?.status === "Active" ? "Deactivate" : "Activate"}
                          onClick={() => handleToggleStatus(user)}
                          disabled={user._id === currentUserId}
                          className="btn btn-ghost btn-sm text-gray-600 disabled:opacity-30"
                        >
                          <Power size={16} />
                        </button>
                        <button
                          title="Delete account"
                          onClick={() => handleDelete(user)}
                          disabled={user._id === currentUserId}
                          className="btn btn-ghost btn-sm text-error disabled:opacity-30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && (
          <div className="px-5 py-3 text-xs text-gray-400 border-t border-base-200">
            Showing {users.length} of {total} accounts
          </div>
        )}
      </div>

      {/* CREATE STAFF MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-semibold text-gray-800 text-lg mb-4">Create Staff Account</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                required
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="input input-bordered w-full rounded-xl"
              />
              <input
                required
                type="email"
                placeholder="Official email"
                value={form.officialEmail}
                onChange={(e) => setForm({ ...form, officialEmail: e.target.value })}
                className="input input-bordered w-full rounded-xl"
              />
              <input
                required
                type="text"
                minLength={6}
                placeholder="Temporary password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input input-bordered w-full rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Department (optional)"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="input input-bordered w-full rounded-xl"
                />
                <input
                  placeholder="Designation (optional)"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="input input-bordered w-full rounded-xl"
                />
              </div>
              <input
                placeholder="Contact number (optional)"
                value={form.contactNo}
                onChange={(e) => setForm({ ...form, contactNo: e.target.value })}
                className="input input-bordered w-full rounded-xl"
              />

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Roles</p>
                <div className="flex gap-2">
                  {ALL_ROLES.map((role) => (
                    <button
                      type="button"
                      key={role}
                      onClick={() => toggleFormRole(role)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize border ${
                        form.roles.includes(role)
                          ? "bg-sky-600 text-white border-sky-600"
                          : "bg-white text-gray-600 border-gray-200"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="btn btn-ghost rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn bg-sky-600 border-0 text-white hover:bg-sky-700 rounded-xl"
                >
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLES MODAL */}
      {rolesModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="font-semibold text-gray-800 text-lg mb-1">Manage Roles</h2>
            <p className="text-sm text-gray-500 mb-4">{rolesModalUser.personal?.fullName}</p>

            <div className="flex gap-2 mb-6">
              {ALL_ROLES.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => toggleDraftRole(role)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize border ${
                    rolesDraft.includes(role)
                      ? "bg-sky-600 text-white border-sky-600"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRolesModalUser(null)}
                className="btn btn-ghost rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={saveRoles}
                className="btn bg-sky-600 border-0 text-white hover:bg-sky-700 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="font-semibold text-gray-800 text-lg mb-1">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-4">{resetModalUser.personal?.fullName}</p>

            <input
              type="text"
              minLength={6}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input input-bordered w-full rounded-xl mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setResetModalUser(null);
                  setNewPassword("");
                }}
                className="btn btn-ghost rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="btn bg-sky-600 border-0 text-white hover:bg-sky-700 rounded-xl"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
