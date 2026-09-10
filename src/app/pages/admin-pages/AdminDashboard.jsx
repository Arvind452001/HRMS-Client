import { useEffect, useState } from "react";
import { Users, ShieldCheck, UserCheck, UserX, Activity } from "lucide-react";
import Loader from "../../../components/Loader";
import {
  getAdminDashboardSummaryApi,
  getAdminAuditSummaryApi,
} from "../../../api/adminPanelApi";
import { showError } from "../../../utils/alert";
import { timeAgo } from "../../../utils/timeAgo";

const StatCard = ({ icon: Icon, label, value, tint }) => (
  <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
    <span
      className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${tint}`}
    >
      <Icon size={20} />
    </span>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [summaryRes, auditRes] = await Promise.all([
          getAdminDashboardSummaryApi(),
          getAdminAuditSummaryApi(),
        ]);
        setSummary(summaryRes?.data || null);
        setActivity(auditRes?.data?.recent || []);
      } catch (err) {
        showError("Error", err?.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-16 flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen space-y-5">
      <div className="bg-white/80 backdrop-blur-xl border border-sky-100 rounded-2xl p-5 shadow-sm">
        <h1 className="text-sky-600 text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          System-wide overview — accounts, roles, and recent activity across the HRMS.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Total Accounts" value={summary?.totalUsers ?? 0} tint="bg-sky-100 text-sky-600" />
        <StatCard icon={ShieldCheck} label="Admins" value={summary?.admins ?? 0} tint="bg-purple-100 text-purple-600" />
        <StatCard icon={Users} label="HR Staff" value={summary?.hrs ?? 0} tint="bg-amber-100 text-amber-600" />
        <StatCard icon={Users} label="Employees" value={summary?.employeesOnly ?? 0} tint="bg-emerald-100 text-emerald-600" />
        <StatCard icon={UserCheck} label="Active" value={summary?.active ?? 0} tint="bg-green-100 text-green-600" />
        <StatCard icon={UserX} label="Inactive" value={summary?.inactive ?? 0} tint="bg-red-100 text-red-600" />
      </div>

      <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-sky-600" />
          Recent Activity
        </h2>

        {activity.length === 0 ? (
          <p className="text-sm text-gray-400">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-sky-50">
            {activity.map((log) => (
              <li key={log._id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {log.userName} — {log.action} {log.module}
                  </p>
                  <p className="text-xs text-gray-400">{timeAgo(log.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
