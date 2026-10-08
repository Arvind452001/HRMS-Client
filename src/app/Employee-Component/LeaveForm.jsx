import React, { useState } from "react";
import DatePicker from "react-multi-date-picker";
import "react-multi-date-picker/styles/colors/teal.css";
import { showWarning, showSuccess, showError } from "../../utils/alert";

import { applyLeaveApi } from "../../api/leaveApi";

const LeaveForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    leaveType: "",
    reason: "",
    emergencyContact: "",
    leaveMode: "",
    dates: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
      setSubmitting(true);
      const formattedDates = formData.dates.map((date) =>
        date.format("YYYY-MM-DD"),
      );

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

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showError(
        "Error",
        error?.message || error?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setSubmitting(false);
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

          {/* Multi-Date Selection - Fixes the hover shrink glitch */}
          <div className="flex flex-col w-full">
            <label className="text-xs font-semibold text-slate-600 tracking-wide mb-1.5">
              Select Leave Dates <span className="text-red-400">*</span>
            </label>
            <div className="w-full block">
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
            </div>

            {/* Selected Dates Display Badges */}
            {formData.dates.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-xl max-h-20 overflow-y-auto">
                {formData.dates.map((date, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center text-xs font-semibold bg-sky-50 border border-sky-100 text-sky-700 px-2 py-0.5 rounded-md"
                  >
                    {date.format("YYYY-MM-DD")}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-600 tracking-wide mb-1.5">
              Emergency Contact Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              name="emergencyContact"
              inputMode="numeric"
              maxLength={10}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 hover:border-slate-300 shadow-sm transition-colors"
              placeholder="Enter 10 digit mobile number"
              value={formData.emergencyContact}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");

                if (value.length <= 10) {
                  handleChange({
                    target: {
                      name: "emergencyContact",
                      value,
                    },
                  });
                }
              }}
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
