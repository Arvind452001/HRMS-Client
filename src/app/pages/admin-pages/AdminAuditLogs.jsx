import { useEffect, useState } from "react";
import { Filter, ScrollText } from "lucide-react";
import Loader from "../../../components/Loader";
import { getAuditLogsApi } from "../../../api/adminPanelApi";
import { showError } from "../../../utils/alert";

const MODULES = [
  "EMPLOYEE",
  "ATTENDANCE",
  "LEAVE",
  "SALARY",
  "JOB",
  "PERFORMANCE",
  "RECRUITMENT",
  "DOCUMENTS",
  "USER",
  "DEPARTMENT",
  "DESIGNATION",
  "SYSTEM_SETTINGS",
];

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "VIEW", "LOGIN"];

const ActionBadge = ({ action }) => {
  const tint =
    {
      CREATE: "bg-green-100 text-green-700",
      UPDATE: "bg-sky-100 text-sky-700",
      DELETE: "bg-red-100 text-red-700",
      VIEW: "bg-gray-200 text-gray-600",
      LOGIN: "bg-purple-100 text-purple-700",
    }[action] || "bg-gray-100 text-gray-600";

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tint}`}>{action}</span>
  );
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getAuditLogsApi({
        module: moduleFilter || undefined,
        action: actionFilter || undefined,
        limit: 100,
      });
      setLogs(res?.data || []);
      setTotal(res?.total ?? 0);
    } catch (err) {
      showError("Error", err?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleFilter, actionFilter]);

  return (
    <div className="w-full min-h-screen space-y-5">
      <div className="bg-white/80 backdrop-blur-xl border border-sky-100 rounded-2xl p-5 shadow-sm">
        <h1 className="text-sky-600 text-2xl font-bold flex items-center gap-2">
          <ScrollText size={22} />
          Audit Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          A full trail of who did what, and when — across the entire system.
        </p>
      </div>

      <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <span className="flex items-center gap-1 text-sm text-gray-500 shrink-0">
          <Filter size={14} /> Filter by:
        </span>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="select select-bordered rounded-xl w-full md:w-auto"
        >
          <option value="">All modules</option>
          {MODULES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="select select-bordered rounded-xl w-full md:w-auto"
        >
          <option value="">All actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div className="card bg-base-100 shadow-xl border border-base-200 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar">
          {loading ? (
            <div className="p-16 flex justify-center">
              <Loader />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-16 text-center text-gray-500 text-sm">No audit logs found</div>
          ) : (
            <table className="table table-zebra w-full min-w-[850px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <p className="font-medium text-gray-800">{log.userName || "System"}</p>
                    </td>
                    <td>
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="text-sm text-gray-600">{log.module}</td>
                    <td className="text-xs text-gray-400">{log.ipAddress || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && (
          <div className="px-5 py-3 text-xs text-gray-400 border-t border-base-200">
            Showing {logs.length} of {total} entries
          </div>
        )}
      </div>
    </div>
  );
}
