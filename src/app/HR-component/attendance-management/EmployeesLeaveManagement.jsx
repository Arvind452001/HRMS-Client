import { useEffect, useState } from "react";
import { getAllLeaveApi } from "../../../api/leaveApi";

export default function EmployeesLeaveManagement() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const res = await getAllLeaveApi();
        const leaves = res?.data || [];

        let pending = 0;
        let approved = 0;
        let rejected = 0;

        leaves.forEach((leave) => {
          if (leave.status === "PENDING") pending += 1;
          else if (leave.status === "APPROVED") approved += 1;
          else if (leave.status === "REJECTED") rejected += 1;
        });

        setCounts({ pending, approved, rejected });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const total = counts.pending + counts.approved + counts.rejected;

  return (
    <div className="flex h-full w-full flex-col items-center gap-6 rounded-xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      {/* Left Section */}
      <div className="flex w-full flex-col gap-4 sm:w-auto">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Employees Leave Management
          </h2>
        </div>

        {/* Status Pills */}
        <StatusPill
          label="Pending"
          value={counts.pending}
          bg="bg-red-100"
          text="text-red-900"
        />

        <StatusPill
          label="Approved"
          value={counts.approved}
          bg="bg-lime-200"
          text="text-gray-900"
        />

        <StatusPill
          label="Rejected"
          value={counts.rejected}
          bg="bg-sky-100"
          text="text-gray-900"
        />
      </div>

      {/* Right Section */}
      <div className="relative flex flex-col items-center sm:items-end">
        <button className="mb-4 flex items-center gap-1 text-xs text-gray-400">
          This Week
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {loading ? (
          <div className="flex h-40 w-40 items-center justify-center sm:h-50 sm:w-50">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <LeaveDonut
            pending={counts.pending}
            approved={counts.approved}
            rejected={counts.rejected}
            total={total}
          />
        )}
      </div>
    </div>
  );
}

// Status Pill
function StatusPill({ label, value, bg, text }) {
  return (
    <div
      className={`flex w-full items-center justify-between rounded-lg px-4 py-2 text-sm sm:w-64 ${bg} ${text}`}
    >
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

// Donut Chart
function LeaveDonut({ pending, approved, rejected, total }) {
  const circumference = 2 * Math.PI * 80; // ~502.65

  const approvedLength = total ? (approved / total) * circumference : 0;
  const pendingLength = total ? (pending / total) * circumference : 0;
  const rejectedLength = total ? (rejected / total) * circumference : 0;

  return (
    <svg viewBox="0 0 200 200" className="h-40 w-40 shrink-0 sm:h-50 sm:w-50">
      {/* Background Ring */}
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke="#eef2ff"
        strokeWidth="18"
      />

      {total === 0 ? null : (
        <>
          {/* Approved */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#d9f99d"
            strokeWidth="18"
            strokeDasharray={`${approvedLength} ${circumference}`}
            strokeDashoffset="0"
            transform="rotate(-90 100 100)"
          />

          {/* Pending */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#fee2e2"
            strokeWidth="18"
            strokeDasharray={`${pendingLength} ${circumference}`}
            strokeDashoffset={`-${approvedLength}`}
            transform="rotate(-90 100 100)"
          />

          {/* Rejected */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#e0e7ff"
            strokeWidth="18"
            strokeDasharray={`${rejectedLength} ${circumference}`}
            strokeDashoffset={`-${approvedLength + pendingLength}`}
            transform="rotate(-90 100 100)"
          />
        </>
      )}
    </svg>
  );
}
