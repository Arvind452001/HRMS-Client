import React, { useEffect, useMemo, useState } from "react";
import { cancelLeaveApi, getMyLeavesApi } from "../../api/leaveApi";
import { showConfirm, showError, showSuccess } from "../../utils/alert";
import LeaveDetailsModal, {
  LeaveStatusBadge,
  formatDisplayDate,
  getLeaveDatesSummary,
} from "../../components/LeaveDetailsModal";
import {
  Eye,
  X,
  Calendar,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Plus,
} from "lucide-react";

const EmployeeLeaveTable = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getMyLeavesApi();
      if (res.success) {
        setLeaves(res.data || []);
      }
    } catch (error) {
      console.error(error);
      showError("Error", error?.message || "Failed to fetch your leave applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Cancel a pending leave request
  const handleCancel = async (id) => {
    try {
      const confirmed = await showConfirm({
        title: "Cancel Leave Application?",
        text: "Are you sure you want to withdraw this pending leave request?",
        confirmButtonText: "Yes, Cancel Leave",
        danger: true,
      });

      if (!confirmed) return;

      setActionLoading(id);
      const res = await cancelLeaveApi(id);
      showSuccess("Cancelled", res?.message || "Leave application cancelled successfully");

      if (selectedLeave?._id === id) {
        setSelectedLeave(null);
      }

      fetchLeaves();
    } catch (err) {
      showError("Error", err?.message || "Failed to cancel leave application");
    } finally {
      setActionLoading(null);
    }
  };

  const isPendingStatus = (status) => {
    return (
      status === "PENDING" ||
      status === "PENDING_HR" ||
      status === "PENDING_ADMIN"
    );
  };

  // Filter & Search Logic
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

      // Search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const typeMatch = leave?.leaveType?.toLowerCase()?.includes(term);
        const reasonMatch = leave?.reason?.toLowerCase()?.includes(term);
        const modeMatch = leave?.leaveMode?.toLowerCase()?.includes(term);
        return typeMatch || reasonMatch || modeMatch;
      }

      return true;
    });
  }, [leaves, statusFilter, searchTerm]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedLeaves = filteredLeaves.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <div className="w-full space-y-4">
      {/* FILTER & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by leave type, mode, reason..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter size={14} className="text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_HR">Pending HR</option>
              <option value="PENDING_ADMIN">Pending Admin</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button
            onClick={fetchLeaves}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-[700px] border-collapse text-left">
            {/* TABLE HEADER */}
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Leave Type & Mode</th>
                <th className="px-5 py-3.5">Duration & Dates</th>
                <th className="px-5 py-3.5">Applied Date</th>
                <th className="px-5 py-3.5">Approval Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium text-slate-500">
                        Loading your leave applications...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLeaves.length > 0 ? (
                paginatedLeaves.map((leave) => {
                  const datesSummary = getLeaveDatesSummary(leave.dates);
                  const isPending = isPendingStatus(leave.status);

                  return (
                    <tr
                      key={leave._id}
                      className="hover:bg-sky-50/40 transition-colors duration-150 group"
                    >
                      {/* LEAVE TYPE & MODE */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                            <Layers size={17} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-xs sm:text-sm">
                              {leave.leaveType}
                            </p>
                            <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">
                              {leave.leaveMode || "Full Day"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DURATION & DATES SUMMARY */}
                      <td className="px-5 py-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs font-bold rounded-md">
                              {datesSummary.countText}
                            </span>
                          </div>
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

                      {/* ACTION BUTTONS (VIEW DETAILS + CANCEL) */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* VIEW DETAILS BUTTON - Always visible */}
                          <button
                            onClick={() => setSelectedLeave(leave)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800 border border-sky-100 shadow-2xs transition-all duration-150 cursor-pointer"
                            title="View Full Application Details"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>

                          {/* CANCEL BUTTON - Only if pending */}
                          {isPending && (
                            <button
                              onClick={() => handleCancel(leave._id)}
                              disabled={actionLoading === leave._id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200/80 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                              title="Cancel this leave request"
                            >
                              <X size={13} />
                              <span>
                                {actionLoading === leave._id
                                  ? "..."
                                  : "Cancel"}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                        <Calendar size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        No Leave Applications Found
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {searchTerm || statusFilter !== "ALL"
                          ? "No records match your selected search or filter criteria."
                          : "You have not submitted any leave applications yet."}
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
              applications
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

      {/* VIEW LEAVE DETAILS MODAL */}
      {selectedLeave && (
        <LeaveDetailsModal
          leave={selectedLeave}
          onClose={() => setSelectedLeave(null)}
          mode="employee"
          onCancel={handleCancel}
          actionLoading={actionLoading === selectedLeave._id}
        />
      )}
    </div>
  );
};

export default EmployeeLeaveTable;
