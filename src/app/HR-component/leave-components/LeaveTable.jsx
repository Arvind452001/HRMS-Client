import { useEffect, useMemo, useState } from "react";
import { showError, showSuccess, showConfirm } from "../../../utils/alert";
import { getAllLeaveApi, updateLeaveStatusApi } from "../../../api/leaveApi";
import { formatLeaveDates } from "../../../utils/leaveDates";

// 🔥 DUAL APPROVAL: this page is shared by both HR and Admin (Admin has
// access to every HR route). Which side the logged-in user acts as
// decides whether they're reviewing the HR stage or the Admin stage of a
// leave request.
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("technoUser")) || {};
  } catch {
    return {};
  }
};

const LeaveTable = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const currentUser = useMemo(() => getCurrentUser(), []);
  const isAdmin = (currentUser?.roles || []).includes("admin");

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

  const handleStatusChange = async (leaveId, status) => {
    try {
      const confirmed = await showConfirm({
        title: "Change Status?",
        text: `Do you want to mark this leave as ${status}?`,
      });

      if (!confirmed) return;

      const payload = { status };
      const res = await updateLeaveStatusApi(leaveId, payload);

      showSuccess(
        "Updated",
        res?.message || "Leave status updated successfully",
      );

      fetchLeaves();
    } catch (error) {
      showError("Error", error?.message || "Failed to update status");
    }
  };

  const filteredLeaves = useMemo(() => {
    if (statusFilter === "ALL") {
      return leaves;
    }

    return leaves.filter((leave) => leave.status === statusFilter);
  }, [leaves, statusFilter]);

  const totalPages = Math.ceil(filteredLeaves.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedLeaves = filteredLeaves.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  return (
    <div className="w-full min-h-screen transparent p-2 md:p-0">
      <div className="w-full rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white/80 backdrop-blur-xl border border-sky-100 rounded-2xl p-4 shadow-sm mb-5">
          <div>
            <h1 className="text-sky-600 text-xl font-bold">
              Leave Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all employee leave requests
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              className="select select-sm flex-1 min-w-[8rem] sm:flex-none sm:w-32 border-sky-200 bg-white text-gray-700 focus:border-sky-400 focus:outline-none"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              className="select select-sm flex-1 min-w-[6rem] sm:flex-none sm:w-24 border-sky-200 focus:outline-none"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5/page</option>
              <option value={10}>10/page</option>
              <option value={20}>20/page</option>
              <option value={50}>50/page</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-hidden rounded-2xl border border-sky-100">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="min-w-[1100px] w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-sky-600 text-white uppercase text-[11px] tracking-wider">
                  <th className="px-4 py-4 font-semibold text-left first:rounded-tl-2xl">
                    Employee
                  </th>
                  <th className="px-4 py-4 font-semibold text-left">
                    Leave Type
                  </th>
                  <th className="px-4 py-4 font-semibold text-left">Mode</th>
                  <th className="px-4 py-4 font-semibold text-left">Dates</th>
                  <th className="px-4 py-4 font-semibold text-left">
                    Reason
                  </th>
                  <th className="px-4 py-4 font-semibold text-left">
                    Contact
                  </th>
                  <th className="px-4 py-4 font-semibold text-left">
                    Status
                  </th>
                  <th className="px-4 py-4 font-semibold text-center last:rounded-tr-2xl">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-10 text-sm text-gray-500 bg-white"
                    >
                      Loading leave requests...
                    </td>
                  </tr>
                ) : paginatedLeaves.length > 0 ? (
                  paginatedLeaves.map((leave, index) => (
                    <tr
                      key={leave?._id}
                      className={`transition-all duration-200 hover:bg-sky-50/70 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                      }`}
                    >
                      <td className="px-4 py-4 border-b border-sky-50">
                        <div className="flex items-center gap-3">
                          <div className="bg-sky-600 w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {leave?.employeeId?.personal?.fullName
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {leave?.employeeId?.personal?.fullName}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Employee Leave
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 border-b border-sky-50">
                        <span className="bg-sky-100 inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] font-semibold text-sky-700 border border-sky-100">
                          {leave?.leaveType}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700 border-b border-sky-50">
                        {leave?.leaveMode}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap border-b border-sky-50">
                        {(() => {
                          const { label, sub, tooltip } = formatLeaveDates(
                            leave?.dates,
                          );
                          return (
                            <div title={tooltip}>
                              <p className="font-medium">{label}</p>
                              {sub && (
                                <p className="text-[10px] text-gray-400">
                                  {sub}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600 max-w-50 border-b border-sky-50">
                        <p className="line-clamp-2">{leave?.reason}</p>
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-sky-700 border-b border-sky-50">
                        {leave?.emergencyContact}
                      </td>

                      <td className="px-4 py-4 border-b border-sky-50">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold w-fit ${
                              leave?.status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : leave?.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {leave?.status}
                          </span>

                          {/* Show which side it's still pending with, until fully decided */}
                          {leave?.status === "PENDING" && (
                            <span className="text-[10px] text-gray-500">
                              HR:{" "}
                              <span
                                className={
                                  leave?.hrApproval?.status === "APPROVED" ||
                                  leave?.hrApproval?.status === "NOT_REQUIRED"
                                    ? "text-green-600 font-semibold"
                                    : "text-yellow-600 font-semibold"
                                }
                              >
                                {leave?.hrApproval?.status === "NOT_REQUIRED"
                                  ? "N/A"
                                  : leave?.hrApproval?.status || "PENDING"}
                              </span>
                              {" · "}Admin:{" "}
                              <span
                                className={
                                  leave?.adminApproval?.status === "APPROVED"
                                    ? "text-green-600 font-semibold"
                                    : "text-yellow-600 font-semibold"
                                }
                              >
                                {leave?.adminApproval?.status || "PENDING"}
                              </span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 border-b border-sky-50">
                        <div className="flex justify-center">
                          {(() => {
                            const mySide = isAdmin
                              ? leave?.adminApproval?.status
                              : leave?.hrApproval?.status;

                            // Already fully decided (approved/rejected/cancelled) —
                            // nothing left to do from here.
                            if (leave?.status !== "PENDING") {
                              return (
                                <span className="text-xs text-gray-400">—</span>
                              );
                            }

                            // This side (HR or Admin) already gave its decision
                            // and it's now sitting with the other side.
                            if (mySide && mySide !== "PENDING") {
                              return (
                                <span className="text-[11px] text-gray-500 italic">
                                  Waiting for {isAdmin ? "HR" : "Admin"}
                                </span>
                              );
                            }

                            return (
                              <select
                                defaultValue=""
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!val) return;
                                  handleStatusChange(leave?._id, val);
                                  e.target.value = "";
                                }}
                                className="min-w-37.5 px-3 py-2 rounded-xl border border-sky-200 bg-white text-sm text-gray-700 shadow-sm outline-none focus:ring-4 focus:ring-sky-100 cursor-pointer"
                              >
                                <option value="" disabled>
                                  {isAdmin ? "Admin Action" : "HR Action"}
                                </option>
                                <option value="APPROVED">Approve</option>
                                <option value="REJECTED">Reject</option>
                              </select>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-16 text-center bg-white">
                      <h3 className="text-lg font-bold text-gray-700">
                        No Leave Requests Found
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        No records available
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6 py-4 border-t border-sky-100 bg-white">
          <p className="text-sm text-gray-600 text-center md:text-left">
            Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
            <span className="font-semibold">
              {Math.min(startIndex + rowsPerPage, filteredLeaves.length)}
            </span>{" "}
            of <span className="font-semibold">{filteredLeaves.length}</span>{" "}
            entries
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-sky-600 px-4 py-2 rounded-xl text-white text-sm disabled:opacity-50"
            >
              Prev
            </button>

            <div className="px-4 py-2 rounded-xl border border-sky-100 text-sm font-semibold">
              {currentPage} / {totalPages}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-sky-600 px-4 py-2 rounded-xl text-white text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveTable;
