import { useEffect, useState } from "react";
import { getAllAttendanceApi } from "../../../api/attendanceApi";
import AttendanceSummary from "../../../components/AttendanceSummary";
// UI को रिच और प्रोफेशनल लुक देने के लिए आइकॉन्स
import {
  Calendar,
  Layers,
  LogIn,
  LogOut,
  Clock,
  ShieldAlert,
  Loader2,
  CalendarRange,
} from "lucide-react";

export default function AttendanceEmployee() {
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentEmployee = JSON.parse(
    localStorage.getItem("technoUser") || "{}",
  );
  const employeeId = currentEmployee?.id;

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await getAllAttendanceApi(year, month);
      setData(res.data || []);

      const lastAttendance = res?.data?.at(-1);
      if (lastAttendance?.checkOut) {
        localStorage.removeItem("checkInTime");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [year, month]);

  const formatTime = (time) =>
    time
      ? new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-5 md:p-6 space-y-6 bg-slate-50/50 text-slate-800 antialiased min-h-screen">
      {/* FILTER & HEADER BAR */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* YEAR SELECT */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              className="w-full sm:w-32 pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none appearance-none transition-all cursor-pointer"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* MONTH SELECT */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              className="w-full sm:w-36 pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none appearance-none transition-all cursor-pointer"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <CalendarRange className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Layers className="h-5 w-5 text-sky-500" />
          <h2 className="font-bold text-base text-slate-700 tracking-tight">
            Attendance Logs
          </h2>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-2 items-center justify-center py-20">
            <Loader2 className="h-9 w-9 animate-spin text-sky-500" />
            <p className="text-xs font-medium text-slate-400 animate-pulse">
              Loading attendance logs...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-2 py-20">
            <ShieldAlert className="h-9 w-9 stroke-1 text-slate-300" />
            <p className="text-sm font-medium">
              No attendance records found for this month.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              {/* HEADER */}
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">
                    <span className="flex items-center gap-1.5">
                      <LogIn className="h-3.5 w-3.5 text-emerald-500" /> Check
                      In
                    </span>
                  </th>
                  <th className="p-4 text-left">
                    <span className="flex items-center gap-1.5">
                      <LogOut className="h-3.5 w-3.5 text-rose-500" /> Check Out
                    </span>
                  </th>
                  <th className="p-4 text-left">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-sky-500" /> Total Hours
                    </span>
                  </th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    {/* DATE */}
                    <td className="p-4 font-semibold text-slate-700">
                      {formatDate(item.date)}
                    </td>

                    {/* CHECK-IN */}
                    <td className="p-4 text-emerald-600 font-medium">
                      {formatTime(item.checkIn)}
                    </td>

                    {/* CHECK-OUT */}
                    <td className="p-4 text-slate-600 font-medium">
                      {item.checkOut ? (
                        <span className="text-rose-600">
                          {formatTime(item.checkOut)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>

                    {/* HOURS */}
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100 shadow-sm">
                        {item.totalHours || "0"} hrs
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${
                          item.status === "present"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : item.status === "half-day"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                            item.status === "present"
                              ? "bg-emerald-500"
                              : item.status === "half-day"
                                ? "bg-amber-500"
                                : "bg-rose-500"
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SUMMARY COMPONENT */}
      <AttendanceSummary employeeId={employeeId} month={month} year={year} />
    </div>
  );
}
