import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { getTodayALLAttendanceApi } from "../../../api/attendanceApi";
import { getAllLeaveApi } from "../../../api/leaveApi";
import { Eye } from "lucide-react";
export default function AttendanceLog() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // "YYYY-MM-DD"
  });

  const navigate = useNavigate();

  // ─── Fetch attendance by date ───
  // Also cross-checks approved leave records for the same date, since the
  // attendance API alone doesn't always mark employees on approved leave
  // as "leave" (they can come back with no status, which used to render
  // as "absent"). Same approach as CompanyStatsCard.jsx.
  const fetchAttendance = async (date) => {
    try {
      setLoading(true);

      const [attendanceRes, leaveRes] = await Promise.all([
        getTodayALLAttendanceApi(date),
        getAllLeaveApi().catch(() => ({ data: [] })), // don't break attendance if leave fetch fails
      ]);

      const attendanceData = attendanceRes.data || [];
      const leaves = leaveRes?.data || [];

      // ── Build set of employee ids on approved leave for the selected date ──
      const selected = new Date(date);
      selected.setHours(0, 0, 0, 0);

      const employeesOnLeave = new Set(
        leaves
          .filter((leave) => {
            if (leave.status !== "APPROVED") return false;
            return (leave.dates || []).some((d) => {
              const leaveDate = new Date(d);
              leaveDate.setHours(0, 0, 0, 0);
              return leaveDate.getTime() === selected.getTime();
            });
          })
          .map((leave) => String(leave.employeeId?._id || leave.employeeId)),
      );

      // ── Merge: if employee has no present/half-day status but is on
      // approved leave for this date, mark them as "leave" instead of "absent" ──
      const merged = attendanceData.map((emp) => {
        const isOnApprovedLeave = employeesOnLeave.has(String(emp._id));
        if (
          isOnApprovedLeave &&
          emp.status !== "present" &&
          emp.status !== "half-day"
        ) {
          return { ...emp, status: "leave" };
        }
        return emp;
      });

      setEmployees(merged);
      setFilteredEmployees(merged);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Initial load & date change ───
  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  // ─── Search filter ───
  useEffect(() => {
    const filtered = employees.filter((emp) =>
      emp.name?.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredEmployees(filtered);
  }, [search, employees]);

  // ─── Status badge helper ───
  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return "badge badge-success badge-sm";
      case "half-day":
        return "badge badge-warning badge-sm";
      case "leave":
        return "badge badge-info badge-sm";
      default:
        return "badge badge-error badge-sm";
    }
  };

  // ─── Stats ─── (fixed: API returns `status`, not `todayStatus`)
  const presentCount = employees.filter((e) => e.status === "present").length;
  const halfDayCount = employees.filter((e) => e.status === "half-day").length;
  const absentCount = employees.filter(
    (e) => !e.status || e.status === "absent",
  ).length;

  // ─── Time formatter ───
  const formatTime = (time) =>
    time
      ? new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ─── Header with Date Picker ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Employee Attendance</h1>
          <p className="text-sm opacity-60">
            Attendance for{" "}
            <span className="font-medium">
              {new Date(selectedDate).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* ── Date Picker ── */}
          <input
            type="date"
            className="input input-bordered input-sm w-48"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          {/* ── Search Input ── */}
          <input
            type="text"
            placeholder="Search employee..."
            className="input input-bordered input-sm w-full md:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 shadow-sm">
          <p className="text-sm opacity-70">Present</p>
          <p className="text-3xl font-bold text-success">{presentCount}</p>
        </div>

        <div className="bg-base-100 border border-base-300 rounded-xl p-5 shadow-sm">
          <p className="text-sm opacity-70">Half Day</p>
          <p className="text-3xl font-bold text-warning">{halfDayCount}</p>
        </div>

        <div className="bg-base-100 border border-base-300 rounded-xl p-5 shadow-sm">
          <p className="text-sm opacity-70">Absent</p>
          <p className="text-3xl font-bold text-error">{absentCount}</p>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="overflow-x-auto w-full custom-scrollbar bg-base-100 shadow rounded-xl">
        <table className="table w-full min-w-[700px]">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Hours</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  No attendance records found for this date.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const initials = emp.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();

                return (
                  <tr key={emp._id} className="hover">
                    {/* Employee */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center">
                            <span className="text-sm font-semibold">
                              {initials || "?"}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="font-medium">{emp.name}</div>
                          <div className="text-xs opacity-60">{emp.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status (fixed: use emp.status, not emp.todayStatus) */}
                    <td>
                      <span className={getStatusBadge(emp.status)}>
                        {emp.status || "absent"}
                      </span>
                    </td>

                    {/* Check In */}
                    <td>{formatTime(emp.checkIn)}</td>

                    {/* Check Out */}
                    <td>{formatTime(emp.checkOut)}</td>

                    {/* Hours */}
                    <td>{emp.totalHours ? `${emp.totalHours} h` : "-"}</td>

                    {/* Action */}
                    <td>
                      <button
                        className="btn btn-sm btn-outline btn-info"
                        onClick={() =>
                          navigate(`/hr/attendanceDetails/${emp._id}`)
                        }
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
