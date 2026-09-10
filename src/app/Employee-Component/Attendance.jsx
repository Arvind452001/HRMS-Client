import { useState, useEffect, useCallback } from "react";
import { showConfirm, showSuccess, showError } from "../../utils/alert";
import {
  LogIn,
  LogOut,
  ListChecks,
  TimerReset,
  CheckCircle2,
} from "lucide-react";

import { CircularTimer } from "./CircularTimer";
import {
  checkInApi,
  checkOutApi,
  getMyTodayStatusApi,
} from "../../api/attendanceApi";
import { useNavigate } from "react-router-dom";

const STATUS_POLL_MS = 60000;

export default function Attendance() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [timer, setTimer] = useState(0); // seconds
  const [checkInTime, setCheckInTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [onLeave, setOnLeave] = useState(null); // null = not on leave, else { leaveType, reason, formattedDates }
  const [weekOff, setWeekOff] = useState(false);

  const [completedToday, setCompletedToday] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("technoUser"));
    setCurrentUser(user);
  }, []);

  const syncStatus = useCallback(async () => {
    try {
      const res = await getMyTodayStatusApi();

      if (res.status === "week_off") {
        setWeekOff(true);
        setOnLeave(null);
        setCheckedIn(false);
        setCompletedToday(false);
        localStorage.removeItem("checkInTime");
      } else if (res.status === "on_leave") {
        setWeekOff(false);
        setOnLeave(res.leave || null);
        setCheckedIn(false);
        setCompletedToday(false);
        localStorage.removeItem("checkInTime");
      } else if (res.status === "in_progress") {
        setWeekOff(false);
        setOnLeave(null);
        setCompletedToday(false);
        const serverTime = new Date(res.checkIn).getTime();
        setCheckedIn(true);
        setCheckInTime(serverTime);
        localStorage.setItem("checkInTime", serverTime);
      } else if (res.status === "completed") {
        setWeekOff(false);
        setOnLeave(null);
        setCheckedIn(false);
        setCompletedToday(true);
        setTotalTime(Math.round((res.workingHours || 0) * 3600));
        localStorage.removeItem("checkInTime");
      } else {
        setWeekOff(false);
        setOnLeave(null);
        setCheckedIn(false);
        setCompletedToday(false);
        localStorage.removeItem("checkInTime");
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    syncStatus();
  }, [syncStatus]);

  useEffect(() => {
    const interval = setInterval(syncStatus, STATUS_POLL_MS);
    return () => clearInterval(interval);
  }, [syncStatus]);

  // Timer Logic
  useEffect(() => {
    let interval;

    if (checkedIn && checkInTime) {
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - checkInTime) / 1000);
        setTimer(diff);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [checkedIn, checkInTime]);

  // Format Time
  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // CHECK-IN
  const handleCheckIn = async () => {
    const confirmed = await showConfirm({
      title: "Check In?",
      confirmButtonText: "Yes, check in",
    });

    if (!confirmed) return;

    try {
      const res = await checkInApi();
      const attendance = res?.data;
      // safety check
      if (!attendance || !attendance.checkIn) {
        throw new Error("Invalid check-in response");
      }

      const serverTime = new Date(attendance.checkIn).getTime();

      setCheckedIn(true);
      setCheckInTime(serverTime);
      setTimer(0);
      setCompletedToday(false);

      localStorage.setItem("checkInTime", serverTime);

      showSuccess("Checked In!", res?.data?.message || "Success");
    } catch (err) {
      if (err?.onLeave) {
        setOnLeave(err.leave || null);
      }
      showError("Error", err?.message || "Failed");
    }
  };

  // CHECK-OUT
  const handleCheckOut = async () => {
    const confirmed = await showConfirm({
      title: "Check Out?",
      confirmButtonText: "Yes, check out",
    });

    if (!confirmed) return;

    try {
      const res = await checkOutApi();

      setCheckedIn(false);
      setTotalTime(timer);
      setCompletedToday(true);

      localStorage.removeItem("checkInTime");

      showSuccess("Checked Out!", res?.data?.message || "Done");
    } catch (err) {
      if (err?.onLeave) {
        setOnLeave(err.leave || null);
      }
      showError("Error", err?.message || "Failed");
    }
  };

  return (
    <div
      className="card bg-base-100 border border-base-300"
      style={{ boxShadow: "0 1px 1px rgba(15, 23, 42, 0.02)" }}
    >
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <TimerReset size={18} />
          </span>
          <div>
            <h2 className="font-semibold text-base leading-tight">
              Today's Attendance
            </h2>
            <p className="text-xs text-base-content/50">
              Track your check-in and working hours
            </p>
          </div>
        </div>

        <span
          className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            weekOff
              ? "bg-slate-200 text-slate-600"
              : onLeave
                ? "bg-amber-100 text-amber-700"
                : checkedIn
                  ? "bg-green-100 text-green-700"
                  : completedToday
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-base-200 text-base-content/60"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              weekOff
                ? "bg-slate-400"
                : onLeave
                  ? "bg-amber-500"
                  : checkedIn
                    ? "bg-green-500 animate-pulse"
                    : completedToday
                      ? "bg-yellow-500"
                      : "bg-base-content/30"
            }`}
          />
          {weekOff
            ? "Week Off"
            : onLeave
              ? "On Leave"
              : checkedIn
                ? "Checked In"
                : completedToday
                  ? "Checked Out"
                  : "Not Checked In"}
        </span>
      </div>

      {/* MAIN */}
      <div className="grid md:grid-cols-2 gap-4 p-5">
        {/* TIMER CARD */}
        <div className="rounded-2xl bg-base-200/60 border border-base-300 p-5 flex flex-col items-center justify-center text-center gap-2">
          <CircularTimer seconds={checkedIn ? timer : totalTime} />
          <div className="text-xs font-medium text-base-content/60">
            {checkedIn
              ? "Timer running…"
              : completedToday
                ? "Checked out"
                : "Not checked in yet"}
          </div>
        </div>

        {/* ACTION CARD */}
        <div className="rounded-2xl border border-base-300 p-5 flex flex-col justify-center items-center gap-3">
          {currentUser?.name && (
            <div className="text-center mb-1">
              <p className="font-semibold text-base-content">
                {currentUser?.name}
              </p>
              <p className="text-xs text-base-content/50">
                Emp ID: {currentUser?.employeeId || "-"}
              </p>
            </div>
          )}

          {weekOff ? (
            <div className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Today is a week off 🎉
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Check-in / check-out is disabled for Sundays.
              </p>
            </div>
          ) : onLeave ? (
            <div className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-amber-800">
                {onLeave.status === "PENDING"
                  ? `Your ${onLeave.leaveType || "leave"} request is pending approval`
                  : `You're on approved ${onLeave.leaveType || "leave"}`}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {onLeave.formattedDates ||
                  (onLeave.dates || [])
                    .map((d) =>
                      new Date(d).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }),
                    )
                    .join(", ")}
              </p>
              <p className="text-[11px] text-amber-600 mt-1">
                Check-in / check-out is disabled for these dates.
              </p>
            </div>
          ) : completedToday ? (
            <>
              <button
                className="btn w-full gap-2 bg-yellow-400 hover:bg-yellow-400 border-yellow-400 text-yellow-900 cursor-default"
                disabled
              >
                <CheckCircle2 size={18} /> Checked Out
              </button>
              <p className="text-[11px] text-base-content/40">
                You've completed today's attendance.
              </p>
            </>
          ) : !checkedIn ? (
            <>
              <button
                className="btn btn-success w-full gap-2"
                onClick={handleCheckIn}
              >
                <LogIn size={18} /> Check In
              </button>
              <p className="text-[11px] text-base-content/40">
                Office hours: 10:00 AM – 8:00 PM
              </p>
            </>
          ) : (
            <button
              className="btn btn-error w-full gap-2"
              onClick={handleCheckOut}
            >
              <LogOut size={18} /> Check Out
            </button>
          )}

          <button
            className="btn btn-outline btn-primary w-full gap-2"
            onClick={() => navigate("/employee/attendance")}
          >
            <ListChecks size={18} /> View Attendance
          </button>
        </div>
      </div>

      {/* TOTAL TIME CARD */}
      {totalTime > 0 && (
        <div className="mx-5 mb-5 rounded-2xl bg-green-50 border border-green-100 p-4 flex items-center justify-center gap-3">
          <CheckCircle2 className="text-green-600" size={22} />
          <div className="text-center">
            <p className="text-xs text-green-700/70 font-medium">
              Today's Work
            </p>
            <p
              className="text-xl font-bold text-green-700"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {formatTime(totalTime)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
