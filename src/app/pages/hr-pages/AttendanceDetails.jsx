import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AttendanceCalendar from "../../Employee-Component/AttendanceCalendar";
import MonthlyAttendanceStats from "./MonthlyAttendanceStats";

export default function AttendanceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const calendarRef = useRef(null); // Ref for DOM access

  // ── Month/year picker for the summary card (defaults to current month) ──
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`; // "YYYY-MM" for <input type="month">
  });

  const [year, month] = selectedMonth.split("-").map(Number);

  // Syncs calendar tracking without altering existing design or props
  useEffect(() => {
    const calendarEl = calendarRef.current;
    if (!calendarEl) return;

    const handleCalendarNav = () => {
      setTimeout(() => {
        // Targets both FullCalendar headers and normal header selectors
        const titleEl = calendarEl.querySelector(
          ".fc-toolbar-title, .fc-title, .react-calendar__navigation__label__labelText, .fc-header-title h2",
        );
        if (titleEl) {
          const text = titleEl.innerText; // e.g., "July 2026"
          const parsedDate = new Date(Date.parse(text + " 1"));

          if (!isNaN(parsedDate.getTime())) {
            const y = parsedDate.getFullYear();
            const m = String(parsedDate.getMonth() + 1).padStart(2, "0");
            setSelectedMonth(`${y}-${m}`);
          }
        }
      }, 200); // Small buffer so internal markup finishes rendering
    };

    calendarEl.addEventListener("click", handleCalendarNav);
    return () => calendarEl.removeEventListener("click", handleCalendarNav);
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Changed items-stretch to items-start so right box doesn't stretch vertically */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Ref on wrapper layer to monitor clicks and content */}
        <div className="w-full lg:flex-1 lg:min-w-0" ref={calendarRef}>
          <div className="w-full rounded-xl overflow-hidden">
            <AttendanceCalendar employeeId={id} />
          </div>
        </div>

        {/* Removed flex/h-full from wrapper div */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          {/* Removed h-full and changed padding to p-3.5 for compact styling */}
          <div className="w-full bg-white border border-slate-200 rounded-xl p-3.5 gap-3 flex flex-col">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-700">
                Monthly Summary
              </h3>

              <input
                type="month"
                className="input input-bordered input-sm w-40"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>

            {/* Removed flex-1 so it only takes exact height of the cards */}
            <div className="w-full">
              <MonthlyAttendanceStats
                employeeId={id}
                month={month}
                year={year}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
