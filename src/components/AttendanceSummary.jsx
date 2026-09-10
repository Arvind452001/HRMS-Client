import { useEffect, useState } from "react";
import { getAttendanceSummaryApi } from "../api/attendanceApi";
import {
  CalendarDays,
  Briefcase,
  UserCheck,
  UserX,
  FileText,
  Clock,
  Coffee,
  Percent,
  Loader2,
  Calendar,
} from "lucide-react";

export default function AttendanceSummary({ employeeId, month, year }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await getAttendanceSummaryApi(employeeId, month, year);
        setSummary(response);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    if (employeeId && month && year) {
      fetchSummary();
    }
  }, [employeeId, month, year]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center py-16 bg-white rounded-2xl border border-slate-200 min-h-40">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        <p className="text-xs font-medium text-slate-500">Loading Summary...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-200 p-8 text-slate-500 gap-3 min-h-40">
        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
          <Calendar className="h-5 w-5 text-slate-500 stroke-[1.5]" />
        </div>
        <p className="text-xs font-semibold text-slate-600">
          No attendance summary found.
        </p>
      </div>
    );
  }

  const getPercentageColor = (pct) => {
    if (pct >= 85) return "bg-emerald-500 text-emerald-700";
    if (pct >= 75) return "bg-sky-500 text-sky-700";
    return "bg-amber-500 text-amber-700";
  };

  const pctColorClass = getPercentageColor(summary.attendancePercentage);

  return (
    <div className="space-y-6 text-slate-800 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-600" />
            Attendance Summary
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Overview of working logs and presence
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-600 shadow-sm self-start sm:self-auto">
          <span>
            Month: <span className="text-slate-900">{summary.month}</span>
          </span>
          <span className="text-slate-200">|</span>
          <span>
            Year: <span className="text-slate-900">{summary.year}</span>
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          title="Total Days"
          value={summary.totalDays}
          icon={<CalendarDays className="h-4 w-4" />}
          color="sky"
        />
        <Card
          title="Working Days"
          value={summary.workingDays}
          icon={<Briefcase className="h-4 w-4" />}
          color="indigo"
        />
        <Card
          title="Present"
          value={summary.present}
          icon={<UserCheck className="h-4 w-4" />}
          color="emerald"
        />
        <Card
          title="Absent"
          value={summary.absent}
          icon={<UserX className="h-4 w-4" />}
          color="rose"
        />
        <Card
          title="Leave"
          value={summary.leave}
          icon={<FileText className="h-4 w-4" />}
          color="amber"
        />
        <Card
          title="Half Day"
          value={summary.halfDay}
          icon={<Coffee className="h-4 w-4" />}
          color="orange"
        />
        <Card
          title="Week Offs"
          value={summary.weekOffs}
          icon={<CalendarDays className="h-4 w-4" />}
          color="slate"
        />
        <Card
          title="Working Hours"
          value={summary.formattedWorkingTime}
          icon={<Clock className="h-4 w-4" />}
          color="violet"
          isTime={true}
        />
      </div>

      {/* Attendance Percentage */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Percent className="h-3.5 w-3.5 text-slate-400" />
            Attendance Percentage
          </span>
          <span
            className={`text-base font-bold ${pctColorClass.split(" ")[1]}`}
          >
            {summary.attendancePercentage.toFixed(2)}%
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${pctColorClass.split(" ")[0]}`}
            style={{
              width: `${Math.min(summary.attendancePercentage, 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Global configuration for cohesive ultra-light premium design
const colorMap = {
  sky: {
    bg: "bg-sky-50/20 border-sky-200/60",
    iconBg: "bg-sky-50 text-sky-700 border-sky-200/80",
  },
  indigo: {
    bg: "bg-indigo-50/20 border-indigo-200/60",
    iconBg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
  },
  emerald: {
    bg: "bg-emerald-50/20 border-emerald-200/60",
    iconBg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  },
  rose: {
    bg: "bg-rose-50/20 border-rose-200/60",
    iconBg: "bg-rose-50 text-rose-700 border-rose-200/80",
  },
  amber: {
    bg: "bg-amber-50/20 border-amber-200/60",
    iconBg: "bg-amber-50 text-amber-700 border-amber-200/80",
  },
  orange: {
    bg: "bg-orange-50/20 border-orange-200/60",
    iconBg: "bg-orange-50 text-orange-700 border-orange-200/80",
  },
  slate: {
    bg: "bg-slate-50/40 border-slate-200/60",
    iconBg: "bg-slate-100 text-slate-700 border-slate-200/80",
  },
  violet: {
    bg: "bg-violet-50/20 border-violet-200/60",
    iconBg: "bg-violet-50 text-violet-700 border-violet-200/80",
  },
};

function Card({ title, value, icon, color = "sky", isTime = false }) {
  const styles = colorMap[color];

  return (
    <div
      className={`w-full flex flex-col justify-between ${styles.bg} border rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md hover:border-slate-300`}
    >
      <div className="w-full flex items-center justify-between gap-2 mb-4">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div
          className={`p-1.5 rounded-lg border shadow-sm shrink-0 transition-colors ${styles.iconBg}`}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate max-w-full">
          {value}
        </span>
        {!isTime && (
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 ml-0.5 shrink-0">
            Days
          </span>
        )}
      </div>
    </div>
  );
}
