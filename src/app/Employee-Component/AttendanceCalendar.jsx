import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  CalendarDays,
  Clock,
  LogIn,
  LogOut,
  X,
  Pencil,
  Check,
  Trash2,
} from "lucide-react";
import {
  getAllAttendanceApi,
  getEmployeeAttendanceByIdApi,
  updateEmployeeAttendanceApi,
  ATTENDANCE_UPDATED_EVENT,
} from "../../api/attendanceApi";
import {
  getEmployeeLeavesApi,
  getMyLeavesApi,
  updateLeaveDetailsApi,
  createLeaveForEmployeeApi,
  deleteLeaveApi,
} from "../../api/leaveApi";
import { showConfirm } from "../../utils/alert";

const STATUS_META = {
  present: {
    label: "Present",
    dot: "bg-green-500",
    cell: "ec-cell-present",
    chip: "bg-green-50 text-green-700 ring-1 ring-green-200",
  },
  absent: {
    label: "Absent",
    dot: "bg-red-500",
    cell: "ec-cell-absent",
    chip: "bg-red-50 text-red-600 ring-1 ring-red-200",
  },
  "half-day": {
    label: "Half-day",
    dot: "bg-amber-400",
    cell: "ec-cell-half",
    chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
  leave: {
    label: "Leave",
    dot: "bg-sky-500",
    cell: "ec-cell-leave",
    chip: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  },
};

// Only pending/approved leaves show on the calendar; rejected/cancelled are hidden
const VISIBLE_LEAVE_STATUSES = ["PENDING", "APPROVED"];

const LEAVE_TYPE_META = {
  "Sick Leave": "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  "Casual Leave": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  "Paid Leave": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  "Emergency Leave": "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
};
const DEFAULT_LEAVE_TYPE_CHIP = "bg-sky-50 text-sky-700 ring-1 ring-sky-200";

const LEAVE_MODE_META = {
  "Full Day": "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  "Half Day": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};
const DEFAULT_LEAVE_MODE_CHIP =
  "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

export default function AttendanceCalendar({ employeeId, onMonthChange } = {}) {
  const [attendanceMap, setAttendanceMap] = useState({});
  const [recordMap, setRecordMap] = useState({});
  const [leaveMap, setLeaveMap] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [monthLabel, setMonthLabel] = useState("");

  // HR-only manual edit mode (only used when employeeId is passed in)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "present",
    checkIn: "",
    checkOut: "",
  });
  const [leaveEditForm, setLeaveEditForm] = useState({
    leaveType: "Sick Leave",
    leaveMode: "Full Day",
    status: "PENDING",
    reason: "",
    emergencyContact: "",
    appliedDate: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  // Switches the popup to the leave form when creating a new leave on a day with none yet
  const [createAsLeave, setCreateAsLeave] = useState(false);
  const [deletingLeave, setDeletingLeave] = useState(false);

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  // Tracks the month currently on screen, used to refresh after edits or real-time events
  const visibleMonthRef = useRef(new Date());

  const fetchAttendance = useCallback(
    async (dateObj) => {
      try {
        setLoading(true);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;

        const res = employeeId
          ? await getEmployeeAttendanceByIdApi(employeeId, year, month)
          : await getAllAttendanceApi(year, month);

        const map = {};
        const rMap = {};
        res.data.forEach((item) => {
          const d = formatDate(new Date(item.date));
          map[d] = item.status;
          rMap[d] = item;
        });

        setAttendanceMap(map);
        setRecordMap(rMap);
        setMonthLabel(
          dateObj.toLocaleString("en-IN", { month: "long", year: "numeric" }),
        );

        try {
          // Employee's own calendar uses "my leaves"; HR viewing another
          // employee's calendar uses the employee-scoped endpoint
          const leaveRes = employeeId
            ? await getEmployeeLeavesApi(employeeId, year, month)
            : await getMyLeavesApi();
          const lMap = {};
          (leaveRes.data || []).forEach((leave) => {
            if (!VISIBLE_LEAVE_STATUSES.includes(leave.status)) return;
            (leave.dates || []).forEach((dt) => {
              const d = formatDate(new Date(dt));
              if (d.startsWith(`${year}-${String(month).padStart(2, "0")}`)) {
                lMap[d] = leave;
              }
            });
          });
          setLeaveMap(lMap);
        } catch (err) {
          console.error(err);
          setLeaveMap({});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [employeeId],
  );

  const handleDatesSet = (arg) => {
    visibleMonthRef.current = arg.view.currentStart;
    fetchAttendance(arg.view.currentStart);
    onMonthChange?.(arg.view.currentStart);
  };

  // Refreshes the calendar when a check-in/check-out happens elsewhere
  useEffect(() => {
    const handleAttendanceUpdate = () => {
      fetchAttendance(visibleMonthRef.current);
    };
    window.addEventListener(ATTENDANCE_UPDATED_EVENT, handleAttendanceUpdate);
    return () =>
      window.removeEventListener(
        ATTENDANCE_UPDATED_EVENT,
        handleAttendanceUpdate,
      );
  }, [fetchAttendance]);

  const handleDateClick = (arg) => {
    setSelectedDay(formatDate(arg.date));
    setIsEditing(false);
    setCreateAsLeave(false);
    setEditError("");
  };

  const formatTime = (value) =>
    value
      ? new Date(value).toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--";

  // Reads the record's time as an IST "HH:mm" string for the <input
  // type="time"> edit field — not the browser's own local timezone, or
  // HR viewing from outside IST would see (and then re-save) the wrong
  // time.
  const formatTimeForInput = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleTimeString("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Shared check-in/check-out/total-hours grid, used for both a plain
  // attendance day and a leave day that still has punch times recorded
  const renderAttendanceStats = (record, bordered = false) => (
    <div
      className={`grid grid-cols-3 gap-3 text-center sm:text-left ${
        bordered ? "pt-3 border-t border-base-300/60" : ""
      }`}
    >
      <div className="flex sm:flex-row flex-col items-center sm:items-start gap-1.5">
        <LogIn size={14} className="text-green-600" />
        <div>
          <p className="text-[11px] text-base-content/50">Check In</p>
          <p className="text-sm font-semibold">{formatTime(record.checkIn)}</p>
        </div>
      </div>
      <div className="flex sm:flex-row flex-col items-center sm:items-start gap-1.5">
        <LogOut size={14} className="text-red-600" />
        <div>
          <p className="text-[11px] text-base-content/50">Check Out</p>
          <p className="text-sm font-semibold">{formatTime(record.checkOut)}</p>
        </div>
      </div>
      <div className="flex sm:flex-row flex-col items-center sm:items-start gap-1.5">
        <Clock size={14} className="text-primary" />
        <div>
          <p className="text-[11px] text-base-content/50">Total Hours</p>
          <p className="text-sm font-semibold">
            {record.totalHours ? `${record.totalHours}h` : "--"}
          </p>
        </div>
      </div>
    </div>
  );

  const startEditingDay = () => {
    if (!selectedDay) return;
    const record = recordMap[selectedDay];
    const leaveRecord = leaveMap[selectedDay];
    if (leaveRecord) {
      setLeaveEditForm({
        leaveType: leaveRecord.leaveType || "Sick Leave",
        leaveMode: leaveRecord.leaveMode || "Full Day",
        status: leaveRecord.status || "PENDING",
        reason: leaveRecord.reason || "",
        emergencyContact: leaveRecord.emergencyContact || "",
        appliedDate: leaveRecord.createdAt
          ? formatDate(new Date(leaveRecord.createdAt))
          : "",
      });
    } else {
      setEditForm({
        status: record?.status || "present",
        checkIn: formatTimeForInput(record?.checkIn),
        checkOut: formatTimeForInput(record?.checkOut),
      });
      setLeaveEditForm({
        leaveType: "Sick Leave",
        leaveMode: "Full Day",
        status: "PENDING",
        reason: "",
        emergencyContact: "",
        appliedDate: selectedDay,
      });
    }
    setCreateAsLeave(false);
    setEditError("");
    setIsEditing(true);
  };

  const cancelEditingDay = () => {
    setIsEditing(false);
    setCreateAsLeave(false);
    setEditError("");
  };

  // Generic field updaters, shared across every input in both edit forms
  const updateEditForm = (field) => (e) =>
    setEditForm((f) => ({ ...f, [field]: e.target.value }));
  const updateLeaveForm = (field) => (e) =>
    setLeaveEditForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSaveEdit = async () => {
    if (!employeeId || !selectedDay) return;
    const leaveRecord = leaveMap[selectedDay];
    try {
      setSavingEdit(true);
      setEditError("");

      if (leaveRecord) {
        // Existing leave day — update it
        await updateLeaveDetailsApi(leaveRecord._id, {
          leaveType: leaveEditForm.leaveType,
          leaveMode: leaveEditForm.leaveMode,
          status: leaveEditForm.status,
          reason: leaveEditForm.reason,
          emergencyContact: leaveEditForm.emergencyContact,
          appliedDate: leaveEditForm.appliedDate,
        });
      } else if (createAsLeave) {
        // No leave exists yet for this day — create one
        await createLeaveForEmployeeApi({
          employeeId,
          leaveType: leaveEditForm.leaveType,
          leaveMode: leaveEditForm.leaveMode,
          status: leaveEditForm.status,
          reason: leaveEditForm.reason,
          emergencyContact: leaveEditForm.emergencyContact,
          appliedDate: leaveEditForm.appliedDate,
          dates: [selectedDay],
        });
      } else {
        // Plain attendance edit
        await updateEmployeeAttendanceApi(employeeId, {
          date: selectedDay,
          status: editForm.status,
          checkIn: editForm.checkIn,
          checkOut: editForm.checkOut,
        });
      }

      await fetchAttendance(visibleMonthRef.current);
      setIsEditing(false);
      setCreateAsLeave(false);
    } catch (err) {
      setEditError(err?.message || "Failed to update");
    } finally {
      setSavingEdit(false);
    }
  };

  // Permanently removes a leave entry (unlike setting status to CANCELLED)
  const handleDeleteLeave = async () => {
    const leaveRecord = leaveMap[selectedDay];
    if (!leaveRecord) return;

    const confirmed = await showConfirm({
      title: "Remove Leave?",
      text: "This will permanently remove this leave entry, as if it was never applied.",
      confirmButtonText: "Yes, remove it",
      danger: true,
    });
    if (!confirmed) return;

    try {
      setDeletingLeave(true);
      setEditError("");
      await deleteLeaveApi(leaveRecord._id);
      await fetchAttendance(visibleMonthRef.current);
      setIsEditing(false);
      setSelectedDay(null);
    } catch (err) {
      setEditError(err?.message || "Failed to remove leave");
    } finally {
      setDeletingLeave(false);
    }
  };

  const renderLeaveFields = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label py-0.5">
            <span className="label-text text-[11px] text-base-content/60">
              Leave Type
            </span>
          </label>
          <select
            className="select select-bordered select-sm w-full"
            value={leaveEditForm.leaveType}
            onChange={updateLeaveForm("leaveType")}
          >
            <option value="Sick Leave">Sick Leave</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Paid Leave">Paid Leave</option>
            <option value="Emergency Leave">Emergency Leave</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label py-0.5">
            <span className="label-text text-[11px] text-base-content/60">
              Day
            </span>
          </label>
          <select
            className="select select-bordered select-sm w-full"
            value={leaveEditForm.leaveMode}
            onChange={updateLeaveForm("leaveMode")}
          >
            <option value="Full Day">Full Day</option>
            <option value="Half Day">Half Day</option>
          </select>
        </div>

        <div className="form-control col-span-2">
          <label className="label py-0.5">
            <span className="label-text text-[11px] text-base-content/60">
              Status
            </span>
          </label>
          <select
            className="select select-bordered select-sm w-full"
            value={leaveEditForm.status}
            onChange={updateLeaveForm("status")}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="form-control col-span-2">
          <label className="label py-0.5">
            <span className="label-text text-[11px] text-base-content/60">
              Reason
            </span>
          </label>
          <textarea
            className="textarea textarea-bordered textarea-sm w-full"
            rows={2}
            value={leaveEditForm.reason}
            onChange={updateLeaveForm("reason")}
          />
        </div>

        <div className="form-control col-span-2">
          <label className="label py-0.5">
            <span className="label-text text-[11px] text-base-content/60">
              Emergency Contact
            </span>
          </label>
          <input
            type="text"
            className="input input-bordered input-sm w-full"
            value={leaveEditForm.emergencyContact}
            onChange={updateLeaveForm("emergencyContact")}
          />
        </div>

        <div className="form-control col-span-2">
          <label className="label py-0.5">
            <span className="label-text text-[11px] text-base-content/60">
              Applied Date
            </span>
          </label>
          <input
            type="date"
            className="input input-bordered input-sm w-full"
            value={leaveEditForm.appliedDate}
            onChange={updateLeaveForm("appliedDate")}
          />
        </div>
      </div>

      {editError && <p className="text-xs text-error">{editError}</p>}

      <div className="flex items-center justify-between gap-2 pt-1">
        {leaveMap[selectedDay] ? (
          <button
            type="button"
            className="btn btn-ghost btn-xs text-error gap-1"
            onClick={handleDeleteLeave}
            disabled={savingEdit || deletingLeave}
          >
            {deletingLeave ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Trash2 size={12} />
            )}
            Remove Leave
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-xs"
            onClick={cancelEditingDay}
            disabled={savingEdit || deletingLeave}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary btn-xs gap-1"
            onClick={handleSaveEdit}
            disabled={savingEdit || deletingLeave}
          >
            {savingEdit ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Check size={12} />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );

  const renderCreateLeaveToggle = () => (
    <div className="flex gap-1 p-0.5 rounded-lg bg-base-200 w-fit">
      <button
        type="button"
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
          !createAsLeave
            ? "bg-base-100 text-primary shadow-sm"
            : "text-base-content/60"
        }`}
        onClick={() => setCreateAsLeave(false)}
      >
        Attendance
      </button>
      <button
        type="button"
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
          createAsLeave
            ? "bg-base-100 text-primary shadow-sm"
            : "text-base-content/60"
        }`}
        onClick={() => setCreateAsLeave(true)}
      >
        + Add Leave
      </button>
    </div>
  );

  const todayStr = formatDate(new Date());

  // A day counts as an implicit Absent when there's no attendance record
  // and no leave for it, it isn't the weekly off (Sunday), and it isn't a
  // future date (nothing to mark yet). Shared by the calendar cells, the
  // month tally, and the day-detail popup so they always agree.
  const isImplicitAbsent = (dateStr, dateObj) =>
    !attendanceMap[dateStr] &&
    !leaveMap[dateStr] &&
    dateObj.getDay() !== 0 &&
    dateStr <= todayStr;

  const monthTally = useMemo(() => {
    const tally = { present: 0, absent: 0, "half-day": 0, leave: 0 };
    Object.values(attendanceMap).forEach((status) => {
      if (tally[status] !== undefined) tally[status] += 1;
    });
    tally.leave = Object.keys(leaveMap).length;

    // Add in the implicit-absent days (no record, no leave) for the
    // currently visible month, up to today.
    const monthStart = visibleMonthRef.current;
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const d = formatDate(dateObj);
      if (d > todayStr) break; // remaining days are in the future
      if (isImplicitAbsent(d, dateObj)) tally.absent += 1;
    }
    return tally;
  }, [attendanceMap, leaveMap]);

  const dayCellContent = (arg) => {
    const d = formatDate(arg.date);
    const isOtherMonth = arg.isOther;

    // A leave takes visual priority over an attendance record on the same
    // day; otherwise, a weekday with no activity at all shows as Absent
    // (skip padding days from adjacent months — they're just for layout).
    let status = leaveMap[d] ? "leave" : attendanceMap[d];
    if (!status && !isOtherMonth && isImplicitAbsent(d, arg.date)) {
      status = "absent";
    }
    const meta = STATUS_META[status];
    const isToday = d === todayStr;

    const isWeekendOff = arg.date.getDay() === 0;
    // Weekend styling only applies when the day has no actual record
    const showWeekendStyle = isWeekendOff && !meta;

    return (
      <div
        className={`ec-day ${meta ? meta.cell : ""} ${isToday ? "ec-day-today" : ""} ${isOtherMonth ? "ec-day-muted" : ""} ${showWeekendStyle ? "ec-day-weekend" : ""}`}
        title={meta?.label || (isWeekendOff ? "Weekend" : "")}
      >
        <span className="ec-day-num">{arg.dayNumberText}</span>
        {meta && <span className={`ec-dot ${meta.dot}`} />}
      </div>
    );
  };

  return (
    <div
      className="card bg-base-100 border border-base-300 ec-wrapper"
      style={{ boxShadow: "0 1px 1px rgba(15, 23, 42, 0.02)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-base-300/70">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CalendarDays size={18} />
          </span>
          <div>
            <h2 className="font-semibold text-base leading-tight">
              Attendance Calendar
            </h2>
            <p className="text-xs text-base-content/50">
              {monthLabel || "Monthly overview"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["present", "absent", "half-day"].map((key) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_META[key].chip}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${STATUS_META[key].dot}`}
              />
              {monthTally[key]} {STATUS_META[key].label}
            </span>
          ))}
          {monthTally.leave > 0 && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_META.leave.chip}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              {monthTally.leave} Leave
            </span>
          )}
        </div>
      </div>

      <div className="relative p-3">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-base-100/70 backdrop-blur-[1px] rounded-2xl transition-opacity">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        )}

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          aspectRatio={1.9}
          fixedWeekCount={false}
          showNonCurrentDates={true}
          headerToolbar={{ left: "prev", center: "title", right: "next today" }}
          dayCellContent={dayCellContent}
          datesSet={handleDatesSet}
          dateClick={handleDateClick}
        />

        {selectedDay && (
          <>
            <div
              className="absolute inset-0 z-20 bg-base-100/40 backdrop-blur-[1px] rounded-2xl"
              onClick={() => {
                setSelectedDay(null);
                setIsEditing(false);
                setCreateAsLeave(false);
              }}
            />

            <div className="absolute z-30 left-1/2 top-3 -translate-x-1/2 w-[92%] max-w-sm rounded-xl border border-base-300/70 bg-base-100 shadow-xl p-4">
              {(() => {
                const record = recordMap[selectedDay];
                const leaveRecord = leaveMap[selectedDay];
                // Parsed from the same y/m/d components formatDate() used,
                // so the weekday check lines up with the calendar cells.
                const [selY, selM, selD] = selectedDay.split("-").map(Number);
                const selectedDateObj = new Date(selY, selM - 1, selD);
                const selectedIsImplicitAbsent =
                  !leaveRecord && !record && isImplicitAbsent(selectedDay, selectedDateObj);
                const meta = leaveRecord
                  ? STATUS_META.leave
                  : record
                    ? STATUS_META[record.status]
                    : selectedIsImplicitAbsent
                      ? STATUS_META.absent
                      : null;
                const dateLabel = new Date(selectedDay).toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                );

                return (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-base-content">
                          {dateLabel}
                        </p>
                        {!leaveRecord && (
                          <span
                            className={`inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              meta
                                ? meta.chip
                                : "bg-base-300/60 text-base-content/60"
                            }`}
                          >
                            {meta && (
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                              />
                            )}
                            {meta ? meta.label : "No record"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {employeeId && !isEditing && (
                          <button
                            onClick={startEditingDay}
                            className="btn btn-ghost btn-xs btn-circle text-primary"
                            aria-label="Edit attendance"
                            title="Edit attendance"
                          >
                            <Pencil size={13} />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedDay(null);
                            setIsEditing(false);
                            setCreateAsLeave(false);
                          }}
                          className="btn btn-ghost btn-xs btn-circle text-base-content/50"
                          aria-label="Close"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {isEditing && leaveRecord ? (
                      renderLeaveFields()
                    ) : isEditing && createAsLeave ? (
                      <div className="space-y-3">
                        {renderCreateLeaveToggle()}
                        {renderLeaveFields()}
                      </div>
                    ) : isEditing ? (
                      <div className="space-y-3">
                        {renderCreateLeaveToggle()}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="form-control col-span-2">
                            <label className="label py-0.5">
                              <span className="label-text text-[11px] text-base-content/60">
                                Status
                              </span>
                            </label>
                            <select
                              className="select select-bordered select-sm w-full"
                              value={editForm.status}
                              onChange={updateEditForm("status")}
                            >
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="half-day">Half-day</option>
                              <option value="no-record">No record</option>
                            </select>
                          </div>

                          <div className="form-control">
                            <label className="label py-0.5">
                              <span className="label-text text-[11px] text-base-content/60">
                                Check In
                              </span>
                            </label>
                            <input
                              type="time"
                              className="input input-bordered input-sm w-full"
                              value={editForm.checkIn}
                              disabled={editForm.status === "no-record"}
                              onChange={updateEditForm("checkIn")}
                            />
                          </div>

                          <div className="form-control">
                            <label className="label py-0.5">
                              <span className="label-text text-[11px] text-base-content/60">
                                Check Out
                              </span>
                            </label>
                            <input
                              type="time"
                              className="input input-bordered input-sm w-full"
                              value={editForm.checkOut}
                              disabled={editForm.status === "no-record"}
                              onChange={updateEditForm("checkOut")}
                            />
                          </div>
                        </div>

                        {editForm.status === "no-record" && (
                          <p className="text-xs text-base-content/50">
                            This will clear any attendance record for this day,
                            as if nothing was ever marked.
                          </p>
                        )}

                        {editError && (
                          <p className="text-xs text-error">{editError}</p>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={cancelEditingDay}
                            disabled={savingEdit}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-primary btn-xs gap-1"
                            onClick={handleSaveEdit}
                            disabled={savingEdit}
                          >
                            {savingEdit ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <Check size={12} />
                            )}
                            Save
                          </button>
                        </div>
                      </div>
                    ) : leaveRecord ? (
                      <div className="space-y-3 text-center sm:text-left">
                        <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                          <div>
                            <p className="text-[11px] text-base-content/50 mb-1">
                              Leave Type
                            </p>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                LEAVE_TYPE_META[leaveRecord.leaveType] ||
                                DEFAULT_LEAVE_TYPE_CHIP
                              }`}
                            >
                              {leaveRecord.leaveType}
                            </span>
                          </div>
                          <div>
                            <p className="text-[11px] text-base-content/50 mb-1">
                              Day
                            </p>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                LEAVE_MODE_META[leaveRecord.leaveMode] ||
                                DEFAULT_LEAVE_MODE_CHIP
                              }`}
                            >
                              {leaveRecord.leaveMode || "—"}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-base-content/60">
                          Status:{" "}
                          <span
                            className={
                              leaveRecord.status === "PENDING"
                                ? "text-amber-600 font-semibold"
                                : "text-sky-600 font-semibold"
                            }
                          >
                            {leaveRecord.status === "PENDING"
                              ? "Pending approval"
                              : "Approved"}
                          </span>
                        </p>

                        {record &&
                          (record.checkIn || record.checkOut) &&
                          renderAttendanceStats(record, true)}

                        {leaveRecord.reason && (
                          <p className="text-xs text-base-content/50 pt-2 border-t border-base-300/60">
                            Reason: {leaveRecord.reason}
                          </p>
                        )}
                      </div>
                    ) : record ? (
                      renderAttendanceStats(record)
                    ) : selectedIsImplicitAbsent ? (
                      <p className="text-xs text-red-600 font-medium">
                        No check-in/check-out or leave found for this day —
                        marked as Absent.
                      </p>
                    ) : (
                      <p className="text-xs text-base-content/50">
                        No attendance was recorded for this day.
                      </p>
                    )}

                    {/* HR-only note; never shown on an employee's own view */}
                    {employeeId &&
                      !isEditing &&
                      !leaveRecord &&
                      record?.remarks && (
                        <p className="text-xs text-base-content/60 mt-3 pt-3 border-t border-base-300/60">
                          Remarks: {record.remarks}
                        </p>
                      )}
                  </>
                );
              })()}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-5 pb-5 pt-4 text-xs border-t border-base-300/70 mx-5">
        {Object.values(STATUS_META).map((meta) => (
          <div
            key={meta.label}
            className="flex items-center gap-1.5 text-base-content/65 font-medium"
          >
            <span className={`w-2 h-2 rounded-full ${meta.dot}`}></span>
            {meta.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-base-content/65 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          Weekend
        </div>
      </div>

      <style>{`
        .ec-wrapper .fc {
          font-family: var(--font-sans);
        }
        .ec-wrapper .fc .fc-toolbar-title {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--color-base-content);
        }
        .ec-wrapper .fc .fc-button {
          background: var(--color-base-200);
          border: 1px solid var(--color-base-300);
          color: var(--color-primary);
          box-shadow: none;
          border-radius: 0.5rem;
          padding: 0.25rem 0.55rem;
          font-size: 0.8rem;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .ec-wrapper .fc .fc-button:hover {
          background: var(--brand-blue-light);
        }
        .ec-wrapper .fc .fc-button:active {
          transform: scale(0.96);
        }
        .ec-wrapper .fc .fc-button-primary:not(:disabled).fc-button-active,
        .ec-wrapper .fc .fc-button-primary:not(:disabled):active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: var(--color-primary-content);
        }
        .ec-wrapper .fc-theme-standard td,
        .ec-wrapper .fc-theme-standard th {
          border-color: var(--color-base-300);
        }
        .ec-wrapper table tbody tr:hover {
          background-color: transparent !important;
        }
        .ec-wrapper .fc-col-header-cell {
          background: var(--brand-blue-light);
          padding: 0.4rem 0;
        }
        .ec-wrapper .fc-col-header-cell-cushion {
          color: #075985;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .ec-wrapper .fc-day-sat .fc-col-header-cell-cushion,
        .ec-wrapper .fc-day-sun .fc-col-header-cell-cushion {
          color: #b91c1c;
        }
        .ec-wrapper .fc-daygrid-day-frame {
          padding: 0.2rem;
        }
        .ec-wrapper .fc-daygrid-day {
          transition: background 0.15s ease;
        }
        .ec-wrapper .fc-day-today {
          background: transparent !important;
        }
        .ec-wrapper .fc-daygrid-day-number {
          width: 100%;
          padding: 0;
          text-decoration: none;
        }
        .ec-wrapper .ec-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 0.3rem 0 0.4rem;
          width: 100%;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .ec-wrapper .ec-day-num {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-base-content);
        }
        .ec-wrapper .ec-day-muted .ec-day-num {
          color: var(--color-base-content);
          opacity: 0.35;
        }
        .ec-wrapper .ec-dot {
          width: 5px;
          height: 5px;
          border-radius: 999px;
        }
        .ec-wrapper .ec-cell-present {
          background: rgba(34, 197, 94, 0.12);
        }
        .ec-wrapper .ec-cell-present .ec-day-num {
          color: #15803d;
        }
        .ec-wrapper .ec-cell-absent {
          background: rgba(239, 68, 68, 0.1);
        }
        .ec-wrapper .ec-cell-absent .ec-day-num {
          color: #b91c1c;
        }
        .ec-wrapper .ec-cell-half {
          background: rgba(245, 158, 11, 0.12);
        }
        .ec-wrapper .ec-cell-half .ec-day-num {
          color: #b45309;
        }
        .ec-wrapper .ec-cell-leave {
          background: rgba(14, 165, 233, 0.12);
        }
        .ec-wrapper .ec-cell-leave .ec-day-num {
          color: #0369a1;
        }
        .ec-wrapper .ec-day-weekend {
          background: rgba(239, 68, 68, 0.04);
        }
        .ec-wrapper .ec-day-weekend .ec-day-num {
          color: #dc2626;
        }
        .ec-wrapper .ec-day-weekend.ec-day-muted .ec-day-num {
          color: #dc2626;
          opacity: 0.35;
        }
        .ec-wrapper .ec-day-today {
          box-shadow: inset 0 0 0 1.5px var(--color-primary);
        }
        .ec-wrapper .ec-day-today .ec-day-num {
          color: var(--color-primary);
          font-weight: 700;
        }
        .ec-wrapper .fc-daygrid-day:hover .ec-day {
          background: var(--brand-blue-light);
        }
        .ec-wrapper .fc-daygrid-day:hover .ec-cell-present {
          background: rgba(34, 197, 94, 0.18);
        }
        .ec-wrapper .fc-daygrid-day:hover .ec-cell-absent {
          background: rgba(239, 68, 68, 0.16);
        }
        .ec-wrapper .fc-daygrid-day:hover .ec-cell-half {
          background: rgba(245, 158, 11, 0.18);
        }
        .ec-wrapper .fc-daygrid-day:hover .ec-cell-leave {
          background: rgba(14, 165, 233, 0.18);
        }
        .ec-wrapper .fc-daygrid-day:hover .ec-day-weekend {
          background: rgba(239, 68, 68, 0.1);
        }
        .ec-wrapper .fc-scrollgrid {
          border-radius: 0.75rem;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
