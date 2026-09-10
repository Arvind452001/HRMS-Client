import React, { useState, useCallback } from "react";
import Attendance from "../../Employee-Component/Attendance";
import AttendanceCalendar from "../../Employee-Component/AttendanceCalendar";
import Holidays from "../../Employee-Component/Holidays";
import { Sparkles, CalendarDays } from "lucide-react";
import MonthlyAttendanceStats from "../hr-pages/MonthlyAttendanceStats";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("technoUser") || "{}");

  // Logged-in user ki database ID (ensure karein backend isi field ko support karta ho)
  const employeeId = user?._id || user?.id;

  // ── Month/year picker setup defaults to current date ──
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [year, month] = selectedMonth.split("-").map(Number);

  // Human-readable name of the currently selected month (drives the
  // "Monthly Summary" badge) — derived from selectedMonth so it always
  // matches whatever month the calendar below is showing.
  const selectedMonthLabel = new Date(year, month - 1, 1).toLocaleString(
    "en-IN",
    { month: "long" },
  );

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Fired by AttendanceCalendar (via FullCalendar's own datesSet callback)
  // whenever the person navigates to a different month — keeps the
  // "Monthly Summary" card in sync automatically, no DOM scraping needed.
  const handleMonthChange = useCallback((date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${y}-${m}`);
  }, []);

  return (
    <div className="space-y-6">
      {/* GREETING BANNER */}
      <div
        className="relative overflow-hidden rounded-2xl text-primary-content p-6 md:p-7"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), var(--brand-blue-dark))",
          boxShadow: "0 2px 6px -3px rgba(2, 132, 199, 0.2)",
        }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute right-16 -bottom-12 h-28 w-28 rounded-full bg-white/10" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-white/80">
              <Sparkles size={16} /> {getGreeting()},
            </p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">
              {user?.name || "Employee"}
            </h1>
            <p className="text-sm text-white/80 mt-1">
              {user?.employeeId ? `Emp ID: ${user.employeeId} • ` : ""}
              {today}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2.5 rounded-xl text-sm font-medium self-start md:self-auto">
            <CalendarDays size={18} />
            <span>Have a productive day!</span>
          </div>
        </div>
      </div>

      {/* MAIN GRID - Left: Attendance & Calendar | Right: Holidays & Monthly Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column (Spans 2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          <Attendance />
          <AttendanceCalendar onMonthChange={handleMonthChange} />
        </div>

        {/* Right Column (Holidays + Monthly Summary Below) */}
        <div className="space-y-6">
          <Holidays />

          {/* New Monthly Summary Section Card wrapper */}
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 gap-3.5 flex flex-col shadow-sm">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                Monthly Summary
              </h3>
              {/* Optional visually hidden or clean text indicators can go here since calendar drives it */}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {selectedMonthLabel} {year}
              </span>
            </div>

            <div className="w-full">
              <MonthlyAttendanceStats
                employeeId={employeeId}
                month={month}
                year={year}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
