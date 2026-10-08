import { useEffect, useState, useMemo } from "react";
import {
  ScrollText,
  Filter,
  Search,
  RotateCw,
  Eye,
  X,
  Calendar,
  Layers,
  Activity,
  PlusCircle,
  Edit3,
  Trash2,
  LogIn,
  Clock,
  User,
  Shield,
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Loader from "../../../components/Loader";
import { getAuditLogsApi, getAuditStatsApi } from "../../../api/adminPanelApi";
import { showError, showSuccess } from "../../../utils/alert";

const MODULES = [
  "EMPLOYEE",
  "ATTENDANCE",
  "LEAVE",
  "SALARY",
  "SALARY_STRUCTURE",
  "PAYROLL",
  "PAYSLIP",
  "JOB",
  "APPLICATION",
  "INTERVIEW",
  "RECRUITMENT",
  "VISITOR",
  "USER",
  "DEPARTMENT",
  "DESIGNATION",
  "SYSTEM_SETTINGS",
  "AUTH",
  "SUPPORT",
];

const ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "CHECK_IN",
  "CHECK_OUT",
];

const ActionBadge = ({ action }) => {
  const upper = String(action || "").toUpperCase();
  const config =
    {
      CREATE: {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: PlusCircle,
      },
      UPDATE: {
        bg: "bg-sky-50 text-sky-700 border-sky-200",
        icon: Edit3,
      },
      DELETE: {
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        icon: Trash2,
      },
      LOGIN: {
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        icon: LogIn,
      },
      CHECK_IN: {
        bg: "bg-teal-50 text-teal-700 border-teal-200",
        icon: Clock,
      },
      CHECK_OUT: {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
      },
    }[upper] || {
      bg: "bg-slate-50 text-slate-700 border-slate-200",
      icon: Activity,
    };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <Icon size={12} className="shrink-0" />
      {upper}
    </span>
  );
};

const ModuleBadge = ({ module }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      <Layers size={11} className="text-slate-500" />
      {module}
    </span>
  );
};

// Recursively cleans buffer objects and formats data for human readability
const cleanHumanReadableData = (data) => {
  if (data === null || data === undefined) return data;

  if (typeof data === "object") {
    // Check for byte map: { buffer: { "0": 106, ... } }
    if (data.buffer && typeof data.buffer === "object") {
      const bytes = Object.values(data.buffer);
      if (
        bytes.length > 0 &&
        bytes.every((b) => typeof b === "number" && !isNaN(b))
      ) {
        return bytes
          .map((b) => Number(b).toString(16).padStart(2, "0"))
          .join("");
      }
    }

    // Check for standard Buffer object: { type: 'Buffer', data: [...] }
    if (data.type === "Buffer" && Array.isArray(data.data)) {
      return data.data
        .map((b) => Number(b).toString(16).padStart(2, "0"))
        .join("");
    }

    if (Array.isArray(data)) {
      return data.map(cleanHumanReadableData);
    }

    const cleaned = {};
    for (const [key, val] of Object.entries(data)) {
      cleaned[key] = cleanHumanReadableData(val);
    }
    return cleaned;
  }

  return data;
};

// Formats value cleanly for diff cards
const formatDiffValue = (val) => {
  if (val === undefined || val === null) return "— (None)";
  const cleaned = cleanHumanReadableData(val);
  if (cleaned === undefined || cleaned === null) return "— (None)";
  if (typeof cleaned === "boolean") return cleaned ? "true" : "false";
  if (typeof cleaned === "number") return String(cleaned);
  if (typeof cleaned === "string") return cleaned;
  return JSON.stringify(cleaned, null, 2);
};

// Pretty JSON View Component with syntax highlight feel
const JsonViewer = ({ data, emptyText = "No data" }) => {
  const cleanedData = cleanHumanReadableData(data);
  if (!cleanedData || (typeof cleanedData === "object" && Object.keys(cleanedData).length === 0)) {
    return <p className="text-xs text-gray-400 italic py-2">{emptyText}</p>;
  }

  return (
    <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto max-h-96 custom-scrollbar leading-relaxed whitespace-pre-wrap word-break">
      {JSON.stringify(cleanedData, null, 2)}
    </pre>
  );
};

// Compare objects and extract changed keys
const extractDiff = (oldData, newData) => {
  const cleanOld = cleanHumanReadableData(oldData);
  const cleanNew = cleanHumanReadableData(newData);

  const oldObj = cleanOld && typeof cleanOld === "object" ? cleanOld : {};
  const newObj = cleanNew && typeof cleanNew === "object" ? cleanNew : {};

  const allKeys = Array.from(
    new Set([...Object.keys(oldObj), ...Object.keys(newObj)])
  );

  const changed = [];
  const unchanged = [];

  for (const key of allKeys) {
    // Skip internal mongo/mongoose noise if not meaningful
    if (["__v", "updatedAt"].includes(key)) continue;

    const oldVal = oldObj[key];
    const newVal = newObj[key];

    const isDifferent =
      JSON.stringify(oldVal) !== JSON.stringify(newVal);

    const item = {
      key,
      oldVal,
      newVal,
      isDifferent,
    };

    if (isDifferent) {
      changed.push(item);
    } else {
      unchanged.push(item);
    }
  }

  return { changed, unchanged, allKeys };
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    creates: 0,
    updates: 0,
    deletes: 0,
    today: 0,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalTab, setModalTab] = useState("diff"); // "diff", "sideBySide", "raw"
  const [copied, setCopied] = useState(false);

  // Fetch Summary Stats
  const fetchStats = async () => {
    try {
      const res = await getAuditStatsApi();
      if (res?.data) {
        setStats(res.data);
      }
    } catch {
      // Non-blocking
    }
  };

  // Fetch Audit Logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getAuditLogsApi({
        module: moduleFilter || undefined,
        action: actionFilter || undefined,
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit,
      });

      setLogs(res?.data || []);
      setTotal(res?.total ?? 0);
      setTotalPages(res?.totalPages ?? 1);
    } catch (err) {
      showError("Error", err?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, moduleFilter, actionFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch("");
    setModuleFilter("");
    setActionFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleCopyJSON = (data) => {
    if (!data) return;
    const cleaned = cleanHumanReadableData(data);
    navigator.clipboard.writeText(JSON.stringify(cleaned, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (moduleFilter) count++;
    if (actionFilter) count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [search, moduleFilter, actionFilter, startDate, endDate]);

  return (
    <div className="w-full min-h-screen space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-sky-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                <ScrollText size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  System Audit Logs
                </h1>
                <p className="text-sky-100 text-sm mt-0.5">
                  Complete before &amp; after trail of actions, mutations, and user activities across HRMS.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              fetchStats();
              fetchLogs();
            }}
            disabled={loading}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 active:scale-95 transition backdrop-blur-md text-white rounded-xl text-sm font-semibold cursor-pointer border border-white/20 disabled:opacity-50"
          >
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Logs
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs font-medium text-sky-100">Total Recorded Logs</p>
            <p className="text-2xl font-bold mt-1">{stats.total || total || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs font-medium text-emerald-200">Creates</p>
            <p className="text-2xl font-bold text-emerald-100 mt-1">{stats.creates || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs font-medium text-sky-200">Updates</p>
            <p className="text-2xl font-bold text-sky-100 mt-1">{stats.updates || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-xs font-medium text-rose-200">Deletes</p>
            <p className="text-2xl font-bold text-rose-100 mt-1">{stats.deletes || 0}</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, email, module, description, or record ID..."
              className="w-full pl-10 pr-24 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Search
            </button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Module Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={moduleFilter}
                onChange={(e) => {
                  setModuleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-700 cursor-pointer"
              >
                <option value="">All Modules</option>
                {MODULES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-700 cursor-pointer"
              >
                <option value="">All Actions</option>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5">
              <Calendar size={13} className="text-slate-400 shrink-0 ml-1" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-transparent border-none focus:outline-none text-slate-600 cursor-pointer"
                title="Start Date"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-transparent border-none focus:outline-none text-slate-600 cursor-pointer"
                title="End Date"
              />
            </div>

            {/* Reset Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-rose-100"
              >
                <X size={13} />
                Clear Filters ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full custom-scrollbar">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader />
              <p className="text-xs text-slate-400 font-medium">Loading audit trail...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <ScrollText size={22} />
              </div>
              <p className="text-base font-semibold text-slate-700">No audit logs found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No system activity matches your active search or filter criteria. Try resetting filters.
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-1.5 text-xs font-semibold bg-sky-50 text-sky-600 rounded-lg border border-sky-200 hover:bg-sky-100 transition cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Date &amp; Time</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Module</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-5 text-right">View Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-sky-50/40 transition-colors group"
                  >
                    {/* Date & Time */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="text-xs font-semibold text-slate-800">
                        {new Date(log.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {String(log.userName || "S")[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-xs truncate">
                            {log.userName || "System"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {log.userRole && (
                              <span className="text-[10px] font-medium text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                                {log.userRole}
                              </span>
                            )}
                            {log.userEmail && (
                              <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                {log.userEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <ActionBadge action={log.action} />
                    </td>

                    {/* Module */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <ModuleBadge module={log.module} />
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-xs text-slate-700 font-medium truncate" title={log.description || "—"}>
                        {log.description || "—"}
                      </p>
                      {log.recordId && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {String(log.recordId).slice(-8)}
                        </span>
                      )}
                    </td>

                    {/* IP */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {log.ipAddress || "Localhost"}
                      </span>
                    </td>

                    {/* View Diff Button */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setModalTab(log.oldData && log.newData ? "diff" : "raw");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer border border-sky-200 hover:border-transparent group-hover:scale-105"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {!loading && total > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-slate-400">|</span>
              <span>
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, total)} of {total} records
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL & BEFORE/AFTER DIFF MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-sky-50/30">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <ActionBadge action={selectedLog.action} />
                  <ModuleBadge module={selectedLog.module} />
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedLog._id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedLog.description || `${selectedLog.action} on ${selectedLog.module}`}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/70 border-b border-slate-100 text-xs">
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <User size={11} /> Performed By
                </p>
                <p className="font-bold text-slate-800 truncate">
                  {selectedLog.userName || "System"}
                </p>
                {selectedLog.userRole && (
                  <p className="text-[10px] text-sky-600 font-medium">
                    {selectedLog.userRole}
                  </p>
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock size={11} /> Timestamp (IST)
                </p>
                <p className="font-semibold text-slate-800">
                  {new Date(selectedLog.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Shield size={11} /> IP Address
                </p>
                <p className="font-mono text-slate-700 truncate">
                  {selectedLog.ipAddress || "Localhost"}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Laptop size={11} /> Target Record ID
                </p>
                <p className="font-mono text-slate-700 truncate" title={selectedLog.recordId || "—"}>
                  {selectedLog.recordId || "—"}
                </p>
              </div>
            </div>

            {/* Tabs for comparison view */}
            <div className="px-5 pt-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedLog.oldData && selectedLog.newData && (
                  <>
                    <button
                      onClick={() => setModalTab("diff")}
                      className={`px-3 py-2 text-xs font-semibold rounded-t-xl border-b-2 transition cursor-pointer ${
                        modalTab === "diff"
                          ? "border-sky-600 text-sky-600 bg-sky-50/50"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Field Changes Diff
                    </button>
                    <button
                      onClick={() => setModalTab("sideBySide")}
                      className={`px-3 py-2 text-xs font-semibold rounded-t-xl border-b-2 transition cursor-pointer ${
                        modalTab === "sideBySide"
                          ? "border-sky-600 text-sky-600 bg-sky-50/50"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Side-by-Side (Before &amp; After)
                    </button>
                  </>
                )}
                <button
                  onClick={() => setModalTab("raw")}
                  className={`px-3 py-2 text-xs font-semibold rounded-t-xl border-b-2 transition cursor-pointer ${
                    modalTab === "raw"
                      ? "border-sky-600 text-sky-600 bg-sky-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Raw Snapshots
                </button>
              </div>

              <button
                onClick={() =>
                  handleCopyJSON({
                    oldData: selectedLog.oldData,
                    newData: selectedLog.newData,
                  })
                }
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-sky-600 bg-slate-100 hover:bg-sky-50 rounded-lg transition"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy JSON"}
              </button>
            </div>

            {/* Modal Body: Comparison Content */}
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              {/* TAB 1: FIELD CHANGES DIFF */}
              {modalTab === "diff" && selectedLog.oldData && selectedLog.newData && (
                (() => {
                  const { changed, unchanged } = extractDiff(
                    selectedLog.oldData,
                    selectedLog.newData
                  );

                  return (
                    <div className="space-y-4">
                      {changed.length === 0 ? (
                        <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                          No direct top-level field differences detected between the before and after payloads.
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-500" />
                            Modified Attributes ({changed.length})
                          </h4>
                          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                            {changed.map(({ key, oldVal, newVal }) => (
                              <div
                                key={key}
                                className="p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center hover:bg-slate-50/60 transition"
                              >
                                <div className="md:col-span-3">
                                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                    {key}
                                  </span>
                                </div>

                                <div className="md:col-span-4 bg-rose-50/70 border border-rose-100 p-2.5 rounded-xl">
                                  <span className="text-[10px] font-bold uppercase text-rose-600 block mb-1">
                                    Before (Old Value)
                                  </span>
                                  <div className="text-xs text-rose-900 font-mono break-all max-h-24 overflow-y-auto custom-scrollbar">
                                    {formatDiffValue(oldVal)}
                                  </div>
                                </div>

                                <div className="hidden md:flex md:col-span-1 justify-center text-slate-400">
                                  <ArrowRight size={16} />
                                </div>

                                <div className="md:col-span-4 bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl">
                                  <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">
                                    After (New Value)
                                  </span>
                                  <div className="text-xs text-emerald-900 font-mono break-all max-h-24 overflow-y-auto custom-scrollbar">
                                    {formatDiffValue(newVal)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {unchanged.length > 0 && (
                        <details className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                          <summary className="font-semibold cursor-pointer select-none">
                            View Unchanged Fields ({unchanged.length})
                          </summary>
                          <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                            {unchanged.map(({ key, oldVal }) => (
                              <div key={key} className="bg-white p-2 rounded-lg border border-slate-100 font-mono text-[11px]">
                                <span className="text-slate-400 font-medium">{key}:</span>{" "}
                                <span className="text-slate-700 truncate">
                                  {formatDiffValue(oldVal)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  );
                })()
              )}

              {/* TAB 2: SIDE-BY-SIDE (BEFORE & AFTER) */}
              {modalTab === "sideBySide" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        Before (Old State)
                      </span>
                    </div>
                    <JsonViewer
                      data={selectedLog.oldData}
                      emptyText="No previous record data captured (initial creation or unrecorded)."
                    />
                  </div>

                  {/* After Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        After (New State)
                      </span>
                    </div>
                    <JsonViewer
                      data={selectedLog.newData}
                      emptyText="No after state data (e.g., deleted record)."
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: RAW SNAPSHOTS */}
              {modalTab === "raw" && (
                <div className="space-y-4">
                  {selectedLog.oldData && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-rose-700">Before Data (oldData)</span>
                      <JsonViewer data={selectedLog.oldData} />
                    </div>
                  )}

                  {selectedLog.newData && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-emerald-700">After Data (newData)</span>
                      <JsonViewer data={selectedLog.newData} />
                    </div>
                  )}

                  {!selectedLog.oldData && !selectedLog.newData && (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-400">
                      No JSON snapshots attached to this log entry.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Audit Log System &bull; Immutable record
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

