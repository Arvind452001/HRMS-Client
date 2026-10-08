import { useEffect, useMemo, useState } from "react";
import { showError, showSuccess, showConfirm } from "../../../utils/alert";
import { getAllLeaveApi, updateLeaveStatusApi } from "../../../api/leaveApi";
import LeaveDetailsModal, {
  LeaveStatusBadge,
  formatDisplayDate,
  getLeaveDatesSummary,
} from "../../../components/LeaveDetailsModal";
import {
  Check,
  X,
  Clock,
  ShieldCheck,
  UserCheck,
  Eye,
  Calendar,
  Layers,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Users,
} from "lucide-react";

const QUICK_REJECTION_REASONS = [
  "Staff shortage on requested dates",
  "Critical project milestone / deadline",
  "Insufficient leave balance",
  "Insufficient advance notice",
  "Required supporting documents missing",
];

const HRLeaveTable = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters, search and pagination
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals state
  const [viewLeave, setViewLeave] = useState(null);
  const [rejectModalLeave, setRejectModalLeave] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  // Determine current user role (HR vs Admin)
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("technoUser") || "{}");
    } catch {
      return {};
    }
  })();
  const userRoles = currentUser?.roles || [];
  const isAdmin = userRoles.includes("admin");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getAllLeaveApi();
      setLeaves(res?.data || []);
    } catch (error) {
      showError("Error", error?.message || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // APPROVE ACTION
  const handleApprove = async (leave) => {
    try {
      const confirmText = isAdmin
        ? "Give final approval for this leave request? This will mark the leave as APPROVED."
        : "Approve this leave request and forward to Admin for final approval?";

      const confirmed = await showConfirm({
        title: isAdmin ? "Final Approve Leave?" : "Approve & Forward to Admin?",
        text: confirmText,
        confirmButtonText: isAdmin ? "Yes, Approve (Final)" : "Yes, Forward to Admin",
      });

      if (!confirmed) return;

      setActionLoading(leave._id);
      const res = await updateLeaveStatusApi(leave._id, { status: "APPROVED" });

      showSuccess(
        "Success",
        res?.message || (isAdmin ? "Leave approved successfully" : "Leave forwarded to Admin")
      );

      if (viewLeave?._id === leave._id) {
        setViewLeave(null);
      }

      fetchLeaves();
    } catch (error) {
      showError("Error", error?.message || "Failed to approve leave");
    } finally {
      setActionLoading(null);
    }
  };

  // OPEN REJECT MODAL
  const openRejectModal = (leave) => {
    setRejectModalLeave(leave);
    setRejectionReasonText("");
  };

  // SUBMIT REJECTION
  const handleRejectSubmit = async (e) => {
    e?.preventDefault();
    if (!rejectionReasonText.trim()) {
      return showError("Validation Error", "Please provide a reason for rejection.");
    }

    try {
      setRejectSubmitting(true);
      const res = await updateLeaveStatusApi(rejectModalLeave._id, {
        status: "REJECTED",
        rejectionReason: rejectionReasonText.trim(),
      });

      showSuccess("Rejected", res?.message || "Leave request rejected");
      setRejectModalLeave(null);
      setRejectionReasonText("");

      if (viewLeave?._id === rejectModalLeave._id) {
        setViewLeave(null);
      }

      fetchLeaves();
    } catch (error) {
      showError("Error", error?.message || "Failed to reject leave");
    } finally {
      setRejectSubmitting(false);
    }
  };

  // Summary counts for quick stats
  const stats = useMemo(() => {
    let pendingHr = 0;
    let pendingAdmin = 0;
    let approved = 0;
    let rejected = 0;

    leaves.forEach((l) => {
      if (l.status === "PENDING_HR" || l.status === "PENDING") pendingHr++;
      else if (l.status === "PENDING_ADMIN") pendingAdmin++;
      else if (l.status === "APPROVED") approved++;
      else if (l.status === "REJECTED") rejected++;
    });

    return { total: leaves.length, pendingHr, pendingAdmin, approved, rejected };
  }, [leaves]);

  // Filtered & Searched leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      // Status Filter
      if (statusFilter === "PENDING_HR") {
        if (leave.status !== "PENDING_HR" && leave.status !== "PENDING") return false;
      } else if (statusFilter === "PENDING_ADMIN") {
        if (leave.status !== "PENDING_ADMIN") return false;
      } else if (statusFilter !== "ALL") {
        if (leave.status !== statusFilter) return false;
      }

      // Search Filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const empName = leave?.employeeId?.personal?.fullName?.toLowerCase() || "";
        const empDept = leave?.employeeId?.professional?.department?.toLowerCase() || "";
        const empDesig = leave?.employeeId?.professional?.designation?.toLowerCase() || "";
        const leaveType = leave?.leaveType?.toLowerCase() || "";
        const reason = leave?.reason?.toLowerCase() || "";

        return (
          empName.includes(term) ||
          empDept.includes(term) ||
          empDesig.includes(term) ||
          leaveType.includes(term) ||
          reason.includes(term)
        );
      }

      return true;
    });
  }, [leaves, statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedLeaves = filteredLeaves.slice(startIndex, startIndex + rowsPerPage);

  const renderActionButtons = (leave) => {
    const isProcessing = actionLoading === leave._id;
    const status = leave?.status;

    const canHrAct = !isAdmin && (status === "PENDING_HR" || status === "PENDING");
    const canAdminAct = isAdmin && status === "PENDING_ADMIN";

    return (
      <div className="flex items-center justify-end gap-1.5 flex-nowrap whitespace-nowrap">
        {/* VIEW DETAILS BUTTON */}
        <button
          onClick={() => setViewLeave(leave)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200/80 hover:border-sky-200 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          title="View Full Application Details"
        >
          <Eye size={13} />
          <span>Details</span>
        </button>

        {/* HR ACTIONS */}
        {!isAdmin && canHrAct && (
          <>
            <button
              onClick={() => handleApprove(leave)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              title="Approve & Forward to Admin"
            >
              <Check size={13} />
              <span>Approve</span>
            </button>
            <button
              onClick={() => openRejectModal(leave)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              title="Reject Leave"
            >
              <X size={13} />
              <span>Reject</span>
            </button>
          </>
        )}

        {!isAdmin && status === "PENDING_ADMIN" && (
          <span className="text-[11px] text-sky-700 font-semibold bg-sky-50 px-2 py-1 rounded-lg border border-sky-100">
            Awaiting Admin
          </span>
        )}

        {/* ADMIN ACTIONS */}
        {isAdmin && canAdminAct && (
          <>
            <button
              onClick={() => handleApprove(leave)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              title="Final Approve Leave"
            >
              <ShieldCheck size={13} />
              <span>Final Approve</span>
            </button>
            <button
              onClick={() => openRejectModal(leave)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              title="Reject Leave"
            >
              <X size={13} />
              <span>Reject</span>
            </button>
          </>
        )}

        {isAdmin && (status === "PENDING_HR" || status === "PENDING") && (
          <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
            Awaiting HR
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      {/* HEADER WITH STATS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-slate-900 text-xl font-bold flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md">
                <ShieldCheck size={18} />
              </span>
              Leave Management {isAdmin ? "(Admin Final Approval)" : "(HR Review)"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isAdmin
                ? "Review HR-approved leave applications, examine full details, and provide final authorizations."
                : "Review employee leave requests, verify supporting information, and forward approved requests to Admin."}
            </p>
          </div>

          {/* Quick Stat Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Users size={13} className="text-slate-400" />
              <span>Total: {stats.total}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-1.5">
              <Clock size={13} className="text-amber-600" />
              <span>Pending HR: {stats.pendingHr}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs font-semibold text-sky-800 flex items-center gap-1.5">
              <UserCheck size={13} className="text-sky-600" />
              <span>Pending Admin: {stats.pendingAdmin}</span>
            </div>
          </div>
        </div>

        {/* TOOLBAR (SEARCH + FILTERS) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by employee, department, leave type..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter size={13} className="text-slate-500" />
              <select
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_HR">Pending HR Approval</option>
                <option value="PENDING_ADMIN">Pending Admin Approval</option>
                <option value="APPROVED">Approved (Final)</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <select
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>

            <button
              onClick={fetchLeaves}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
              title="Refresh list"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Leave Type & Mode</th>
                <th className="px-5 py-3.5">Duration & Dates</th>
                <th className="px-5 py-3.5">Applied Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium text-slate-500">
                        Loading leave records...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLeaves.length > 0 ? (
                paginatedLeaves.map((leave) => {
                  const datesSummary = getLeaveDatesSummary(leave.dates);
                  const employee = leave?.employeeId;
                  const fullName = employee?.personal?.fullName || "Employee";
                  const department = employee?.professional?.department || "General";
                  const designation = employee?.professional?.designation || "Staff";

                  return (
                    <tr
                      key={leave._id}
                      className="hover:bg-sky-50/40 transition-colors duration-150 group"
                    >
                      {/* EMPLOYEE COLUMN */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {fullName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {department} • {designation}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* LEAVE TYPE & MODE */}
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-bold text-slate-800 text-xs">
                            {leave.leaveType}
                          </span>
                          <span className="block text-[11px] text-slate-500 font-medium">
                            {leave.leaveMode || "Full Day"}
                          </span>
                        </div>
                      </td>

                      {/* DURATION & DATES SUMMARY */}
                      <td className="px-5 py-4">
                        <div>
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs font-bold rounded-md">
                            {datesSummary.countText}
                          </span>
                          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {datesSummary.dateRangeText}
                          </p>
                        </div>
                      </td>

                      {/* APPLIED DATE */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-slate-700">
                          {formatDisplayDate(leave.createdAt)}
                        </p>
                      </td>

                      {/* STATUS BADGE */}
                      <td className="px-5 py-4">
                        <LeaveStatusBadge
                          status={leave.status}
                          rejectionReason={leave.rejectionReason}
                          compact
                        />
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 text-right">
                        {renderActionButtons(leave)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                        <Calendar size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        No Leave Records Found
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {searchTerm || statusFilter !== "ALL"
                          ? "No applications match your selected filter or search terms."
                          : "There are currently no leave requests in the system."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {filteredLeaves.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/50 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700">
                {Math.min(startIndex + rowsPerPage, filteredLeaves.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {filteredLeaves.length}
              </span>{" "}
              records
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700">
                {currentPage} of {totalPages}
              </div>

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW LEAVE DETAILS MODAL                                               */}
      {/* ========================================================================= */}
      {viewLeave && (
        <LeaveDetailsModal
          leave={viewLeave}
          onClose={() => setViewLeave(null)}
          mode={isAdmin ? "admin" : "hr"}
          onApprove={handleApprove}
          onReject={openRejectModal}
          actionLoading={actionLoading === viewLeave._id}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. REJECTION REASON MODAL                                                 */}
      {/* ========================================================================= */}
      {rejectModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-rose-600 text-white">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                <h3 className="font-bold text-base">Reject Leave Request</h3>
              </div>
              <button
                onClick={() => setRejectModalLeave(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
                <p>
                  Rejecting{" "}
                  <span className="font-bold text-slate-800">
                    {rejectModalLeave?.employeeId?.personal?.fullName || "Employee"}
                  </span>
                  &apos;s request for{" "}
                  <span className="font-bold text-slate-800">
                    {rejectModalLeave?.leaveType}
                  </span>{" "}
                  ({rejectModalLeave?.dates?.length} days).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectionReasonText}
                  onChange={(e) => setRejectionReasonText(e.target.value)}
                  placeholder="Explain why this leave application is being rejected..."
                  className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 resize-none shadow-xs transition"
                />
              </div>

              {/* Quick Reason Suggestions */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-2">
                  Quick suggestions (click to insert):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REJECTION_REASONS.map((reason, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectionReasonText(reason)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded-lg text-[11px] text-slate-600 font-medium transition text-left cursor-pointer"
                    >
                      + {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalLeave(null)}
                  disabled={rejectSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectSubmitting || !rejectionReasonText.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  {rejectSubmitting ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRLeaveTable;
