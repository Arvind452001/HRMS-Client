import { useEffect, useState } from "react";
import {
  UserCheck,
  UserX,
  FileText,
  Coffee,
  Loader2,
  Calendar,
} from "lucide-react";
import { getAttendanceSummaryApi } from "../../../api/attendanceApi";

export default function MonthlyAttendanceStats({ employeeId, month, year }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!employeeId || !month || !year) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await getAttendanceSummaryApi(employeeId, month, year);
        setSummary(response?.data || response);
      } catch (error) {
        console.error(error);
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [employeeId, month, year]);

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col gap-2 justify-center items-center bg-white rounded-2xl border border-slate-100 min-h-40">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        <p className="text-xs font-medium text-slate-400">Loading summary...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border border-slate-100 p-8 text-slate-400 gap-3 min-h-40">
        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
          <Calendar className="h-5 w-5 text-slate-400 stroke-[1.5]" />
        </div>
        <p className="text-xs font-medium text-slate-500">
          No attendance summary found.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 w-full auto-rows-fr">
      <StatCard
        title="Present"
        value={summary.present ?? 0}
        icon={<UserCheck className="h-4 w-4" />}
        color="emerald"
      />
      <StatCard
        title="Absent"
        value={summary.absent ?? 0}
        icon={<UserX className="h-4 w-4" />}
        color="rose"
      />
      <StatCard
        title="Leave"
        value={summary.leave ?? 0}
        icon={<FileText className="h-4 w-4" />}
        color="amber"
      />
      <StatCard
        title="Half Day"
        value={summary.halfDay ?? 0}
        icon={<Coffee className="h-4 w-4" />}
        color="orange"
      />
    </div>
  );
}

// Ultra-light 5% background tints and matching light borders
const colorMap = {
  emerald: {
    bg: "bg-emerald-50/30 border-emerald-100/50",
    text: "text-emerald-600",
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100/70",
  },
  rose: {
    bg: "bg-rose-50/30 border-rose-100/50",
    text: "text-rose-600",
    iconBg: "bg-rose-50 text-rose-600 border-rose-100/70",
  },
  amber: {
    bg: "bg-amber-50/30 border-amber-100/50",
    text: "text-amber-600",
    iconBg: "bg-amber-50 text-amber-600 border-amber-100/70",
  },
  orange: {
    bg: "bg-orange-50/30 border-orange-100/50",
    text: "text-orange-600",
    iconBg: "bg-orange-50 text-orange-600 border-orange-100/70",
  },
};

function StatCard({ title, value, icon, color }) {
  const styles = colorMap[color];

  return (
    <div
      className={`w-full flex flex-col justify-between ${styles.bg} border rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md`}
    >
      <div className="w-full flex items-center justify-between gap-2 mb-4">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div
          className={`p-1.5 rounded-lg border shadow-sm shrink-0 transition-colors ${styles.iconBg}`}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          {value}
        </span>
        <span className="text-[10px] sm:text-xs font-medium text-slate-400 ml-1">
          Days
        </span>
      </div>
    </div>
  );
}
