import React, { useEffect, useState } from "react";
import { cancelLeaveApi, getMyLeavesApi } from "../../api/leaveApi";
import { showConfirm, showError, showSuccess } from "../../utils/alert";
import { formatLeaveDates } from "../../utils/leaveDates";

const LeaveTable = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getMyLeavesApi();
      if (res.success) setLeaves(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Cancel a pending leave request (button is hidden for other statuses)
  const handleCancel = async (id) => {
    try {
      const confirmed = await showConfirm({
        title: "Cancel Leave?",
        text: "This will withdraw your pending leave request.",
        confirmButtonText: "Yes, cancel it",
        danger: true,
      });

      if (!confirmed) return;

      setActionLoading(id);
      const res = await cancelLeaveApi(id);
      showSuccess("Cancelled", res?.message || "Leave cancelled successfully");
      fetchLeaves(); // refresh
    } catch (err) {
      showError("Error", err?.message || "Failed to cancel leave");
    } finally {
      setActionLoading(null);
    }
  };

  // Status color
  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      case "CANCELLED":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg shadow-sm rounded-2xl overflow-hidden border border-white/40">
      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 text-sm">
            {/* HEADER */}
            <thead className="text-white text-xs uppercase bg-sky-600">
              <tr>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Mode</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Dates</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-left">Applied</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {leaves.length > 0 ? (
                leaves.map((leave, index) => (
                  <tr
                    key={leave._id}
                    className={`transition duration-200 hover:bg-sky-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {leave.leaveType}
                    </td>

                    <td className="p-3 text-gray-600">{leave.leaveMode}</td>

                    <td className="p-3 text-gray-500">{leave.reason}</td>

                    <td className="p-3 text-gray-700">
                      {leave.emergencyContact}
                    </td>

                    {/* DATES */}
                    <td className="p-3">
                      {(() => {
                        const { label, sub, tooltip } = formatLeaveDates(
                          leave.dates,
                        );
                        return (
                          <div title={tooltip}>
                            <span className="inline-block px-2 py-1 bg-sky-100 text-sky-700 rounded-md text-xs shadow-sm">
                              {label}
                            </span>
                            {sub && (
                              <p className="text-[10px] text-gray-400 mt-1">
                                {sub}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    {/* STATUS */}
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusStyle(
                            leave.status,
                          )}`}
                        >
                          {leave.status}
                        </span>

                        {/* Which side it's pending/approved/rejected with */}
                        {leave.status !== "CANCELLED" && (
                          <span className="text-[10px] text-gray-500">
                            HR:{" "}
                            <span
                              className={
                                leave?.hrApproval?.status === "APPROVED" ||
                                leave?.hrApproval?.status === "NOT_REQUIRED"
                                  ? "text-green-600 font-semibold"
                                  : leave?.hrApproval?.status === "REJECTED"
                                  ? "text-red-600 font-semibold"
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
                                  : leave?.adminApproval?.status ===
                                    "REJECTED"
                                  ? "text-red-600 font-semibold"
                                  : "text-yellow-600 font-semibold"
                              }
                            >
                              {leave?.adminApproval?.status || "PENDING"}
                            </span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* APPLIED */}
                    <td className="p-3 text-gray-500">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </td>

                    {/* ACTION */}
                    <td className="p-3 text-center">
                      {leave.status === "PENDING" ? (
                        <button
                          onClick={() => handleCancel(leave._id)}
                          disabled={actionLoading === leave._id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {actionLoading === leave._id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-gray-500">
                    No leave records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaveTable;