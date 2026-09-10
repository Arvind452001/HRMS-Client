import React, { useState } from "react";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/teal.css";
import { showWarning, showSuccess, showError } from "../../utils/alert";

import { applyLeaveApi } from "../../api/leaveApi";

const LeaveForm = () => {
  const [formData, setFormData] = useState({
    leaveType: "",
    reason: "",
    emergencyContact: "",
    leaveMode: "",
    dates: [],
  });

  // "range" = pick a single "from" and "to" date and every day in between
  // is auto-filled; "multiple" = pick individual, possibly non-consecutive
  // days one by one (old behaviour, kept as an option).
  const [dateSelectionMode, setDateSelectionMode] = useState("range");
  const [rangeValue, setRangeValue] = useState([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Expand a picked [from, to] range into every individual day in between
  // (inclusive) — the backend still expects a flat `dates` array, so this
  // keeps the API payload identical to the old multi-pick flow.
  const expandDateRange = (start, end) => {
    const startDate = start.toDate();
    const endDate = end.toDate();
    const [from, to] =
      startDate <= endDate ? [startDate, endDate] : [endDate, startDate];

    const list = [];
    const cursor = new Date(from);
    while (cursor <= to) {
      list.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return list;
  };

  // Some picked dates are react-multi-date-picker `DateObject`s (have
  // .format()), others (range-expanded) are plain JS Dates — handle both.
  const formatPickedDate = (date) =>
    typeof date.format === "function"
      ? date.format("YYYY-MM-DD")
      : date.toISOString().split("T")[0];

  const leaveTypes = [
    "Sick Leave",
    "Casual Leave",
    "Paid Leave",
    "Emergency Leave",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.leaveType ||
      !formData.leaveMode ||
      !formData.reason.trim() ||
      !formData.emergencyContact.trim() ||
      formData.dates.length === 0
    ) {
      return showWarning(
        "Missing Fields",
        "Please fill all fields, including selecting at least one leave date.",
      );
    }

    try {
      const formattedDates = formData.dates.map(formatPickedDate);

      // Sort dates chronologically
      formattedDates.sort((a, b) => new Date(a) - new Date(b));

      const payload = {
        leaveType: formData.leaveType,
        reason: formData.reason,
        emergencyContact: formData.emergencyContact,
        leaveMode: formData.leaveMode,
        dates: formattedDates,
      };

      const res = await applyLeaveApi(payload);
      showSuccess("Success", res.message || "Leave applied successfully");

      setFormData({
        leaveType: "",
        reason: "",
        emergencyContact: "",
        leaveMode: "",
        dates: [],
      });
      setRangeValue([]);
    } catch (error) {
      showError(
        "Error",
        error?.response?.data?.message || "Something went wrong",
      );
    }
  };

  return (
    // Max-width set to 3xl for a wider layout
    <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/40 text-slate-800 antialiased overflow-hidden">
      {/* HEADER - Compact padding */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
        <div className="bg-sky-50 border border-sky-200/60 p-2 rounded-xl text-sky-600 hidden sm:block shadow-sm">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Apply for Leave
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select your specific date(s) and reason for formal absence request.
          </p>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Grid: Type & Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Leave Type */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 tracking-wide mb-1.5">
                Leave Type <span className="text-red-400">*</span>
              </label>
              <select
                name="leaveType"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 hover:border-slate-300 shadow-sm transition-colors"
                value={formData.leaveType}
                onChange={handleChange}
              >
                <option value="">Select leave classification</option>
                {leaveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Leave Mode */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 tracking-wide mb-1.5">
                Leave Mode <span className="text-red-400">*</span>
              </label>
              <select
                name="leaveMode"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 hover:border-slate-300 shadow-sm transition-colors"
                value={formData.leaveMode}
                onChange={handleChange}
              >
                <option value="">Select full or half day</option>
                <option value="Full Day">Full Day</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
          </div>

          {/* Date Selection */}
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600 tracking-wide">
                Select Leave Dates <span className="text-red-400">*</span>
              </label>

              {/* Range vs individual-day picking */}
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setDateSelectionMode("range");
                    setFormData((prev) => ({ ...prev, dates: [] }));
                    setRangeValue([]);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    dateSelectionMode === "range"
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  From – To
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateSelectionMode("multiple");
                    setFormData((prev) => ({ ...prev, dates: [] }));
                    setRangeValue([]);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    dateSelectionMode === "multiple"
                      ? "bg-sky-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Pick Days
                </button>
              </div>
            </div>

            <div className="w-full block">
              {dateSelectionMode === "range" ? (
                <DatePicker
                  range
                  rangeHover
                  value={rangeValue}
                  onChange={(picked) => {
                    const vals = picked || [];
                    setRangeValue(vals);

                    if (vals.length === 2) {
                      setFormData((prev) => ({
                        ...prev,
                        dates: expandDateRange(vals[0], vals[1]),
                      }));
                    } else {
                      setFormData((prev) => ({ ...prev, dates: [] }));
                    }
                  }}
                  format="YYYY-MM-DD"
                  minDate={today}
                  containerClassName="w-full"
                  style={{ width: "100%" }}
                  inputClass="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 hover:border-slate-300 shadow-sm transition-colors cursor-pointer truncate"
                  placeholder="Click to pick a from and to date"
                />
              ) : (
                <DatePicker
                  multiple
                  value={formData.dates}
                  onChange={(dates) =>
                    setFormData({ ...formData, dates: dates || [] })
                  }
                  format="YYYY-MM-DD"
                  minDate={today}
                  containerClassName="w-full"
                  style={{ width: "100%" }}
                  inputClass="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 hover:border-slate-300 shadow-sm transition-colors cursor-pointer truncate"
                  placeholder="Click to pick one or multiple dates"
                />
              )}
            </div>

            {/* Selected dates summary — compact range instead of a badge per day */}
            {formData.dates.length > 0 &&
              (() => {
                const sorted = [...formData.dates].sort((a, b) => a - b);
                const count = sorted.length;

                if (dateSelectionMode === "range" && count > 1) {
                  return (
                    <div className="mt-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-sky-700">
                      {formatPickedDate(sorted[0])} →{" "}
                      {formatPickedDate(sorted[count - 1])}{" "}
                      <span className="text-slate-400 font-normal">
                        ({count} days)
                      </span>
                    </div>
                  );
                }

                return (
                  <div className="mt-2 flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-xl max-h-20 overflow-y-auto">
                    {sorted.map((date, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-xs font-semibold bg-sky-50 border border-sky-100 text-sky-700 px-2 py-0.5 rounded-md"
                      >
                        {formatPickedDate(date)}
                      </span>
                    ))}
                  </div>
                );
              })()}
          </div>

          {/* Contact Details */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-600 tracking-wide mb-1.5">
              Emergency Contact Number <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="emergencyContact"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 hover:border-slate-300 shadow-sm transition-colors"
              placeholder="e.g., +1 (555) 019-2834"
              value={formData.emergencyContact}
              onChange={handleChange}
            />
          </div>

          {/* Reason Box */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-600 tracking-wide mb-1.5">
              Reason for Request <span className="text-red-400">*</span>
            </label>
            <textarea
              name="reason"
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 hover:border-slate-300 shadow-sm transition-colors resize-none"
              placeholder="State your reason clearly..."
              value={formData.reason}
              onChange={handleChange}
            />
          </div>

          {/* Action Trigger Button */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 shadow-md shadow-sky-600/10 hover:shadow-lg transition-all duration-150"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveForm;
