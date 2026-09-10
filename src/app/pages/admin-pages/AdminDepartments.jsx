import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Building2 } from "lucide-react";
import Loader from "../../../components/Loader";
import {
  getDepartmentsApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
} from "../../../api/adminPanelApi";
import { showSuccess, showError, showConfirm } from "../../../utils/alert";

const emptyForm = { name: "", code: "", description: "" };

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await getDepartmentsApi();
      setDepartments(res?.data || []);
    } catch (err) {
      showError("Error", err?.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({ name: dept.name, code: dept.code || "", description: dept.description || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editing) {
        await updateDepartmentApi(editing._id, form);
        showSuccess("Updated", "Department updated successfully");
      } else {
        await createDepartmentApi(form);
        showSuccess("Created", "Department created successfully");
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      showError("Error", err?.message || "Failed to save department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (dept) => {
    try {
      await updateDepartmentApi(dept._id, { isActive: !dept.isActive });
      fetchDepartments();
    } catch (err) {
      showError("Error", err?.message || "Failed to update department");
    }
  };

  const handleDelete = async (dept) => {
    const confirmed = await showConfirm({
      title: "Delete this department?",
      text: `"${dept.name}" will be permanently removed.`,
      confirmButtonText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await deleteDepartmentApi(dept._id);
      showSuccess("Deleted", "Department deleted successfully");
      fetchDepartments();
    } catch (err) {
      showError("Error", err?.message || "Failed to delete department");
    }
  };

  return (
    <div className="w-full min-h-screen space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/80 backdrop-blur-xl border border-sky-100 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-sky-600 text-2xl font-bold">Departments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Canonical department list used across employee records.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn bg-sky-600 border-0 text-white hover:bg-sky-700 rounded-xl"
        >
          <Plus size={16} /> Add Department
        </button>
      </div>

      <div className="card bg-base-100 shadow-xl border border-base-200 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Loader />
            </div>
          ) : departments.length === 0 ? (
            <div className="p-16 text-center text-gray-500 text-sm">No departments yet</div>
          ) : (
            <table className="table table-zebra min-w-175 border-separate border-spacing-0">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-sky-500" />
                        <div>
                          <p className="font-medium text-gray-800">{dept.name}</p>
                          {dept.description && (
                            <p className="text-xs text-gray-400">{dept.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{dept.code || "—"}</td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(dept)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          dept.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {dept.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(dept)}
                          className="btn btn-ghost btn-sm text-sky-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(dept)}
                          className="btn btn-ghost btn-sm text-error"
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
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="font-semibold text-gray-800 text-lg mb-4">
              {editing ? "Edit Department" : "Add Department"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Department name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input input-bordered w-full rounded-xl"
              />
              <input
                placeholder="Code (optional)"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="input input-bordered w-full rounded-xl"
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="textarea textarea-bordered w-full rounded-xl"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-ghost rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn bg-sky-600 border-0 text-white hover:bg-sky-700 rounded-xl"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
