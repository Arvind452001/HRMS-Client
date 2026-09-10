import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, BriefcaseBusiness } from "lucide-react";
import Loader from "../../../components/Loader";
import {
  getDesignationsApi,
  createDesignationApi,
  updateDesignationApi,
  deleteDesignationApi,
  getDepartmentsApi,
} from "../../../api/adminPanelApi";
import { showSuccess, showError, showConfirm } from "../../../utils/alert";

const emptyForm = { title: "", department: "" };

export default function AdminDesignations() {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [desigRes, deptRes] = await Promise.all([
        getDesignationsApi(),
        getDepartmentsApi({ active: true }),
      ]);
      setDesignations(desigRes?.data || []);
      setDepartments(deptRes?.data || []);
    } catch (err) {
      showError("Error", err?.message || "Failed to load designations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (desig) => {
    setEditing(desig);
    setForm({ title: desig.title, department: desig.department?._id || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { title: form.title, department: form.department || null };
      if (editing) {
        await updateDesignationApi(editing._id, payload);
        showSuccess("Updated", "Designation updated successfully");
      } else {
        await createDesignationApi(payload);
        showSuccess("Created", "Designation created successfully");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      showError("Error", err?.message || "Failed to save designation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (desig) => {
    try {
      await updateDesignationApi(desig._id, { isActive: !desig.isActive });
      fetchAll();
    } catch (err) {
      showError("Error", err?.message || "Failed to update designation");
    }
  };

  const handleDelete = async (desig) => {
    const confirmed = await showConfirm({
      title: "Delete this designation?",
      text: `"${desig.title}" will be permanently removed.`,
      confirmButtonText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await deleteDesignationApi(desig._id);
      showSuccess("Deleted", "Designation deleted successfully");
      fetchAll();
    } catch (err) {
      showError("Error", err?.message || "Failed to delete designation");
    }
  };

  return (
    <div className="w-full min-h-screen space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/80 backdrop-blur-xl border border-sky-100 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-sky-600 text-2xl font-bold">Designations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Canonical job titles, optionally scoped to a department.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn bg-sky-600 border-0 text-white hover:bg-sky-700 rounded-xl"
        >
          <Plus size={16} /> Add Designation
        </button>
      </div>

      <div className="card bg-base-100 shadow-xl border border-base-200 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Loader />
            </div>
          ) : designations.length === 0 ? (
            <div className="p-16 text-center text-gray-500 text-sm">No designations yet</div>
          ) : (
            <table className="table table-zebra min-w-175 border-separate border-spacing-0">
              <thead>
                <tr>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {designations.map((desig) => (
                  <tr key={desig._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness size={16} className="text-sky-500" />
                        <p className="font-medium text-gray-800">{desig.title}</p>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{desig.department?.name || "—"}</td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(desig)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          desig.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {desig.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(desig)}
                          className="btn btn-ghost btn-sm text-sky-600"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(desig)}
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
              {editing ? "Edit Designation" : "Add Designation"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Designation title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input input-bordered w-full rounded-xl"
              />
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="select select-bordered w-full rounded-xl"
              >
                <option value="">No specific department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
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
