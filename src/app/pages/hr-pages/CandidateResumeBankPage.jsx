import React, { useEffect, useState } from "react";
import { Plus, FileText, Trash2, Search, Pencil } from "lucide-react";
import {
  deleteCandidateResumeApi,
  getCandidateResumeCategoriesApi,
  getCandidateResumesApi,
  updateCandidateResumeStatusApi,
} from "../../../api/candidateResume-Api";
import { showConfirm, showError, showToast } from "../../../utils/alert";
import Loader from "../../../components/Loader";
import AddCandidateResumeModal from "../../HR-component/model/AddCandidateResumeModal";
import ResumePreviewModal from "../../HR-component/model/ResumePreviewModal";

const statusOptions = ["pending", "in-process", "selected", "rejected", "completed"];

export default function CandidateResumeBankPage() {
  const [candidates, setCandidates] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [previewCandidate, setPreviewCandidate] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = async () => {
    try {
      const data = await getCandidateResumeCategoriesApi();
      setCategoryOptions(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await getCandidateResumesApi({
        category: categoryFilter || undefined,
        search: search || undefined,
        page: currentPage,
        limit: rowsPerPage,
      });
      setCandidates(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch (err) {
      showError("Failed to load", err.message || "Could not fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, currentPage, rowsPerPage]);

  // Debounce free-text search so we don't fire a request on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchCandidates();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (candidate) => {
    const confirmed = await showConfirm({
      title: "Delete Candidate Record?",
      text: `This will permanently delete ${candidate.fullName}'s data and resume. Use this once the interview process is complete.`,
      confirmButtonText: "Yes, delete",
      danger: true,
    });

    if (!confirmed) return;

    try {
      await deleteCandidateResumeApi(candidate._id);
      showToast("success", "Candidate record deleted");
      fetchCandidates();
    } catch (err) {
      showError("Delete Failed", err.message || "Something went wrong");
    }
  };

  const handleStatusChange = async (candidate, status) => {
    // Optimistic update so the dropdown feels instant
    setCandidates((prev) =>
      prev.map((c) => (c._id === candidate._id ? { ...c, status } : c))
    );

    try {
      await updateCandidateResumeStatusApi(candidate._id, status);
      showToast("success", "Status updated");
    } catch (err) {
      showError("Status Update Failed", err.message || "Something went wrong");
      fetchCandidates(); // revert on failure
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-3 sm:p-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white/80 backdrop-blur-xl border border-sky-100 rounded-2xl p-4 shadow-sm mb-4">
        <div>
          <h1 className="text-sky-600 text-xl font-bold">
            Candidate Resume Bank
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Store walk-in / interview candidates' resumes, category-wise
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm sm:btn-md gap-2"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          Add Candidate
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-sky-100 rounded-2xl shadow-sm p-3 mb-4 flex flex-wrap gap-2.5 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or email"
            className="input input-bordered input-sm w-full pl-9"
          />
        </div>

        <select
          className="select select-sm w-full sm:w-56 border-sky-200 bg-white text-gray-700"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          className="select select-sm w-full sm:w-32 border-sky-200 bg-white text-gray-700"
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={10}>10 Rows</option>
          <option value={20}>20 Rows</option>
          <option value={50}>50 Rows</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-sky-100 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-[820px] w-full text-sm">
            <thead className="bg-sky-600">
              <tr className="text-left text-white uppercase text-[11px] tracking-wider">
                <th className="px-4 py-2.5 font-bold">Candidate</th>
                <th className="px-4 py-2.5 font-bold">Contact</th>
                <th className="px-4 py-2.5 font-bold">Category</th>
                <th className="px-4 py-2.5 font-bold">Exp.</th>
                <th className="px-4 py-2.5 font-bold">Status</th>
                <th className="px-4 py-2.5 font-bold text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex justify-center">
                      <Loader />
                    </div>
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    No candidates found
                  </td>
                </tr>
              ) : (
                candidates.map((c, index) => (
                  <tr
                    key={c._id}
                    className={`border-b border-sky-50 hover:bg-sky-50/40 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    }`}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-sky-600 w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {c?.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {c?.fullName}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {c?.currentOrganization || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-2 text-gray-700">
                      <p className="text-xs">{c?.phone}</p>
                      <p className="text-[11px] text-gray-500 truncate max-w-[160px]">
                        {c?.email}
                      </p>
                    </td>

                    <td className="px-4 py-2">
                      <span className="inline-block bg-sky-100 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-sky-700 border border-sky-100">
                        {c?.category}
                      </span>
                    </td>

                    <td className="px-4 py-2 text-xs text-gray-700 whitespace-nowrap">
                      {c?.totalExperience || "—"}
                    </td>

                    <td className="px-4 py-2">
                      <select
                        value={c?.status}
                        onChange={(e) => handleStatusChange(c, e.target.value)}
                        className={`select select-xs font-semibold capitalize border-0 focus:outline-none min-h-0 h-7 ${
                          c?.status === "selected"
                            ? "bg-green-100 text-green-700"
                            : c?.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : c?.status === "completed"
                            ? "bg-gray-200 text-gray-700"
                            : c?.status === "in-process"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s} className="capitalize bg-white text-gray-700">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="View Resume"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
                          onClick={() => setPreviewCandidate(c)}
                        >
                          <FileText size={14} />
                        </button>

                        <button
                          title="Edit Candidate"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                          onClick={() => setEditingCandidate(c)}
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          title="Delete Candidate"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          onClick={() => handleDelete(c)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && candidates.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 border-t border-sky-50">
            <p className="text-xs text-gray-500">
              Showing {(currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, total)} of {total} candidates
            </p>
            <div className="flex gap-2">
              <button
                className="btn btn-xs"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <span className="text-xs flex items-center px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-xs"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddCandidateResumeModal
          onClose={() => setShowAddModal(false)}
          onCreated={fetchCandidates}
        />
      )}

      {editingCandidate && (
        <AddCandidateResumeModal
          candidate={editingCandidate}
          onClose={() => setEditingCandidate(null)}
          onCreated={fetchCandidates}
        />
      )}

      {previewCandidate && (
        <ResumePreviewModal
          candidate={previewCandidate}
          onClose={() => setPreviewCandidate(null)}
        />
      )}
    </div>
  );
}
