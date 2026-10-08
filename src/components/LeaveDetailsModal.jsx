import React from "react";
import {
  X,
  Calendar,
  Phone,
  Clock,
  ShieldCheck,
  UserCheck,
  XCircle,
  AlertCircle,
  Check,
  Mail,
  Briefcase,
  Layers,
  FileText,
} from "lucide-react";

/**
 * Format single date (e.g. 20 Oct 2026)
 */
export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

/**
 * Format date with time (e.g. 08 Oct 2026, 11:44 am)
 */
export const formatDisplayDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
};

/**
 * Compute summary of dates
 */
export const getLeaveDatesSummary = (dates = []) => {
  if (!Array.isArray(dates) || dates.length === 0) {
    return { count: 0, countText: "0 Days", dateRangeText: "No dates specified" };
  }
  const count = dates.length;
  const countText = count === 1 ? "1 Day" : `${count} Days`;

  const validDates = dates
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (validDates.length === 0) {
    return { count, countText, dateRangeText: "Invalid dates" };
  }

  if (validDates.length === 1) {
    return {
      count,
      countText,
      dateRangeText: validDates[0].toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  }

  const firstStr = validDates[0].toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
  const lastStr = validDates[validDates.length - 1].toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return {
    count,
    countText,
    dateRangeText: `${firstStr} - ${lastStr}`,
  };
};

/**
 * Leave Status Badge Component
 */
export const LeaveStatusBadge = ({ status, rejectionReason, compact = false }) => {
  switch (status) {
    case "PENDING_HR":
    case "PENDING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-amber-50 text-amber-800 border-amber-200 ${
            compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <Clock size={compact ? 12 : 13} className="text-amber-600" />
          Pending HR
        </span>
      );
    case "PENDING_ADMIN":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-sky-50 text-sky-800 border-sky-200 ${
            compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <UserCheck size={compact ? 12 : 13} className="text-sky-600" />
          Pending Admin
        </span>
      );
    case "APPROVED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200 ${
            compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"
          }`}
        >
          <ShieldCheck size={compact ? 12 : 13} className="text-emerald-600" />
          Approved
        </span>
      );
    case "REJECTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-rose-50 text-rose-800 border-rose-200 ${
            compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"
          }`}
          title={rejectionReason || ""}
        >
          <XCircle size={compact ? 12 : 13} className="text-rose-600" />
          Rejected
        </span>
      );
    case "CANCELLED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full border bg-slate-100 text-slate-700 border-slate-200 ${
            compact ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"
          }`}
        >
          <X size={compact ? 12 : 13} className="text-slate-500" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {status || "Unknown"}
        </span>
      );
  }
};

/**
 * Modern Clean Leave Details Modal
 */
const LeaveDetailsModal = ({
  leave,
  onClose,
  mode = "employee", // "employee" | "hr" | "admin"
  onApprove,
  onReject,
  onCancel,
  actionLoading = false,
}) => {
  if (!leave) return null;

  const datesSummary = getLeaveDatesSummary(leave?.dates);
  const employee = leave?.employeeId;
  const fullName = employee?.personal?.fullName || "Employee";
  const department = employee?.professional?.department || "General";
  const designation = employee?.professional?.designation || "Staff Member";
  const email = employee?.contact?.personalEmail || employee?.contact?.companyEmail || "";

  const isPending =
    leave.status === "PENDING" ||
    leave.status === "PENDING_HR" ||
    leave.status === "PENDING_ADMIN";

  const isHrPending = leave.status === "PENDING_HR" || leave.status === "PENDING";
  const isAdminPending = leave.status === "PENDING_ADMIN";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[88vh]">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-sky-600 to-sky-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <FileText className="text-white" size={17} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Leave Application Details</h3>
              <p className="text-[11px] text-sky-100">
                Applied on {formatDisplayDateTime(leave?.createdAt)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar text-slate-800">
          {/* EMPLOYEE INFO (FOR HR/ADMIN) */}
          {mode !== "employee" && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                  {fullName?.charAt(0)?.toUpperCase() || "E"}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{fullName}</h4>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <Briefcase size={12} />
                    <span>{department} • {designation}</span>
                  </p>
                  {email && (
                    <p className="text-[11px] text-sky-600 truncate flex items-center gap-1">
                      <Mail size={11} />
                      <span>{email}</span>
                    </p>
                  )}
                </div>
              </div>
              <LeaveStatusBadge status={leave.status} rejectionReason={leave.rejectionReason} />
            </div>
          )}

          {/* APPLICATION STATUS & TYPE OVERVIEW (EMPLOYEE VIEW) */}
          {mode === "employee" && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{leave.leaveType}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {datesSummary.countText} ({datesSummary.dateRangeText})
                  </p>
                </div>
              </div>
              <LeaveStatusBadge status={leave.status} rejectionReason={leave.rejectionReason} />
            </div>
          )}

          {/* KEY DETAILS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Leave Mode</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {leave.leaveMode || "Full Day"}
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Duration</p>
              <p className="text-xs sm:text-sm font-bold text-sky-600 mt-0.5">
                {datesSummary.countText}
              </p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl col-span-2 sm:col-span-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                <Phone size={11} />
                Contact Number
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                {leave.emergencyContact || "—"}
              </p>
            </div>
          </div>

          {/* REQUESTED DATES */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <Calendar size={13} className="text-sky-600" />
                Requested Dates ({datesSummary.count})
              </p>
              <span className="text-[11px] font-medium text-slate-500">
                {datesSummary.dateRangeText}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {Array.isArray(leave.dates) && leave.dates.length > 0 ? (
                leave.dates.map((dt, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 border border-sky-100 text-sky-800 rounded-lg text-xs font-medium"
                  >
                    <Calendar size={11} className="text-sky-600" />
                    {new Date(dt).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400">No dates specified.</p>
              )}
            </div>
          </div>

          {/* REASON */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
            <p className="text-xs font-bold text-slate-700 uppercase mb-1.5">
              Reason For Leave
            </p>
            <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed">
              {leave.reason ? `"${leave.reason}"` : "No reason provided."}
            </p>
          </div>

          {/* REJECTION REASON ALERT (IF REJECTED) */}
          {leave.status === "REJECTED" && leave.rejectionReason && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
              <AlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-900 uppercase">
                  Rejection Reason / Remarks
                </p>
                <p className="text-xs sm:text-sm text-rose-800 mt-0.5 leading-relaxed font-medium">
                  {leave.rejectionReason}
                </p>
              </div>
            </div>
          )}

          {/* 2-STAGE APPROVAL WORKFLOW STEPPER */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl">
            <p className="text-xs font-bold text-slate-700 uppercase mb-3">
              Approval Progress Tracker
            </p>

            <div className="space-y-3">
              {/* STAGE 1: HR */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    leave.hrApprovedBy
                      ? "bg-emerald-100 text-emerald-700"
                      : isHrPending
                      ? "bg-amber-100 text-amber-700 animate-pulse"
                      : leave.status === "REJECTED" && !leave.adminApprovedBy && !leave.hrApprovedBy
                      ? "bg-rose-100 text-rose-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {leave.hrApprovedBy ? (
                    <Check size={13} />
                  ) : leave.status === "REJECTED" && !leave.adminApprovedBy && !leave.hrApprovedBy ? (
                    <X size={13} />
                  ) : (
                    "1"
                  )}
                </div>

                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-800">1. HR Verification</span>
                    {leave.hrApprovedBy ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        Approved
                      </span>
                    ) : isHrPending ? (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        Pending Review
                      </span>
                    ) : leave.status === "REJECTED" && !leave.adminApprovedBy && !leave.hrApprovedBy ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        Rejected
                      </span>
                    ) : null}
                  </div>

                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {leave.hrApprovedBy
                      ? `Approved by ${leave.hrApprovedBy?.personal?.fullName || "HR"} on ${formatDisplayDateTime(
                          leave.hrApprovedAt
                        )}`
                      : isHrPending
                      ? "Awaiting HR review and verification."
                      : leave.status === "REJECTED" && !leave.adminApprovedBy && !leave.hrApprovedBy
                      ? "Rejected at HR verification stage."
                      : "Initial verification completed."}
                  </p>
                </div>
              </div>

              {/* STAGE 2: ADMIN */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    leave.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700"
                      : isAdminPending
                      ? "bg-sky-100 text-sky-700 animate-pulse"
                      : leave.status === "REJECTED" && (leave.adminApprovedBy || leave.hrApprovedBy)
                      ? "bg-rose-100 text-rose-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {leave.status === "APPROVED" ? (
                    <ShieldCheck size={13} />
                  ) : leave.status === "REJECTED" && (leave.adminApprovedBy || leave.hrApprovedBy) ? (
                    <X size={13} />
                  ) : (
                    "2"
                  )}
                </div>

                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-slate-800">2. Admin Final Approval</span>
                    {leave.status === "APPROVED" ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        Final Approved
                      </span>
                    ) : isAdminPending ? (
                      <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        Awaiting Admin
                      </span>
                    ) : leave.status === "REJECTED" && (leave.adminApprovedBy || leave.hrApprovedBy) ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        Rejected
                      </span>
                    ) : null}
                  </div>

                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {leave.status === "APPROVED"
                      ? `Authorized by ${leave.adminApprovedBy?.personal?.fullName || "Admin"} on ${formatDisplayDateTime(
                          leave.adminApprovedAt
                        )}`
                      : isAdminPending
                      ? "Forwarded to Admin for final authorization."
                      : leave.status === "REJECTED" && (leave.adminApprovedBy || leave.hrApprovedBy)
                      ? "Rejected at Admin approval stage."
                      : "Pending initial HR review first."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* EMPLOYEE CANCEL */}
            {mode === "employee" && isPending && onCancel && (
              <button
                type="button"
                onClick={() => onCancel(leave._id)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 transition disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Cancelling..." : "Cancel Application"}
              </button>
            )}

            {/* HR ACTIONS */}
            {mode === "hr" && isHrPending && (
              <>
                {onReject && (
                  <button
                    type="button"
                    onClick={() => onReject(leave)}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    <X size={13} />
                    Reject
                  </button>
                )}
                {onApprove && (
                  <button
                    type="button"
                    onClick={() => onApprove(leave)}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Check size={13} />
                    Approve & Forward
                  </button>
                )}
              </>
            )}

            {/* ADMIN ACTIONS */}
            {mode === "admin" && isAdminPending && (
              <>
                {onReject && (
                  <button
                    type="button"
                    onClick={() => onReject(leave)}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    <X size={13} />
                    Reject
                  </button>
                )}
                {onApprove && (
                  <button
                    type="button"
                    onClick={() => onApprove(leave)}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck size={13} />
                    Final Approve
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetailsModal;
