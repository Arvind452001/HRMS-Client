import { useEffect, useState } from "react";
import { getTodayALLAttendanceApi } from "../../../api/attendanceApi";
import { getAllLeaveApi } from "../../../api/leaveApi";

export default function CompanyStatsCard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, onLeave: 0, absent: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split("T")[0];

        const [attendanceRes, leaveRes] = await Promise.all([
          getTodayALLAttendanceApi(today),
          getAllLeaveApi(),
        ]);

        const employees = attendanceRes?.data || [];
        const leaves = leaveRes?.data || [];

        // ── Build set of employee ids on approved leave today ──
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const employeesOnLeaveToday = new Set(
          leaves
            .filter((leave) => {
              if (leave.status !== "APPROVED") return false;
              return (leave.dates || []).some((d) => {
                const date = new Date(d);
                date.setHours(0, 0, 0, 0);
                return date.getTime() === todayStart.getTime();
              });
            })
            .map((leave) => String(leave.employeeId?._id || leave.employeeId)),
        );

        let present = 0;
        let onLeave = 0;
        let absent = 0;

        employees.forEach((emp) => {
          const status = emp.status;
          const isOnApprovedLeave = employeesOnLeaveToday.has(String(emp._id));

          if (status === "present" || status === "half-day") {
            present += 1;
          } else if (
            status === "leave" ||
            status === "paid-leave" ||
            status === "unpaid-leave" ||
            isOnApprovedLeave
          ) {
            onLeave += 1;
          } else {
            absent += 1;
          }
        });

        setStats({ present, onLeave, absent });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const total = stats.present + stats.onLeave + stats.absent;

  return (
    <div className="flex h-full w-full flex-col rounded-xl bg-white px-5 py-4 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Attendance Overview
        </h2>

        <button className="flex items-center gap-1 text-xs text-gray-400">
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
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* LEFT SIDE */}
        <div className="flex w-full flex-col gap-4 sm:w-auto">
          {/* Legend */}
          <div className="flex flex-col gap-2 text-xs text-gray-500">
            <Legend
              color="bg-green-500"
              label="Present Today"
              value={stats.present}
            />
            <Legend color="bg-sky-400" label="On Leave" value={stats.onLeave} />
            <Legend color="bg-red-500" label="Absent" value={stats.absent} />
          </div>
        </div>

        {/* RIGHT SIDE */}
        {loading ? (
          <div className="flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : (
          <DonutChart
            present={stats.present}
            onLeave={stats.onLeave}
            absent={stats.absent}
            total={total}
          />
        )}
      </div>
    </div>
  );
}

// Legend
function Legend({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
      <span className="truncate">{label}</span>
      <span className="font-semibold text-gray-700">{value}</span>
    </div>
  );
}

// Donut Chart
function DonutChart({ present, onLeave, absent, total }) {
  const circumference = 2 * Math.PI * 80; // ~502.65

  // Avoid division by zero when there's no data yet
  const presentLength = total ? (present / total) * circumference : 0;
  const onLeaveLength = total ? (onLeave / total) * circumference : 0;
  const absentLength = total ? (absent / total) * circumference : 0;

  return (
    <svg viewBox="0 0 200 200" className="h-32 w-32 shrink-0 sm:h-40 sm:w-40">
      {/* Background */}
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
          {/* Present */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#22c55e"
            strokeWidth="18"
            strokeDasharray={`${presentLength} ${circumference}`}
            strokeDashoffset="0"
            transform="rotate(-90 100 100)"
          />

          {/* On Leave */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="18"
            strokeDasharray={`${onLeaveLength} ${circumference}`}
            strokeDashoffset={`-${presentLength}`}
            transform="rotate(-90 100 100)"
          />

          {/* Absent */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#ef4444"
            strokeWidth="18"
            strokeDasharray={`${absentLength} ${circumference}`}
            strokeDashoffset={`-${presentLength + onLeaveLength}`}
            transform="rotate(-90 100 100)"
          />
        </>
      )}
    </svg>
  );
}
