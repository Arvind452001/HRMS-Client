import { useEffect, useState } from "react";
import { getAllSupportApi } from "../../../api/suportApi";
import {
  ShieldCheck,
  FileText,
  CircleDollarSign,
  CalendarClock,
  MessageSquare,
  Search,
  Filter,
  Loader2,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function SupportAdmin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllSupportApi();
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCategoryStyle = (cat) => {
    switch (cat) {
      case "Payroll":
        return "bg-sky-50 text-sky-600 border border-sky-200";
      case "Leave":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      case "General":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-200";
    }
  };

  // Stats counts
  const totalRequests = data.length;
  const payrollCount = data.filter(
    (item) => item.category === "Payroll",
  ).length;
  const leaveCount = data.filter((item) => item.category === "Leave").length;
  const generalCount = data.filter(
    (item) => item.category === "General",
  ).length;

  // Filter logic
  const filteredData = data.filter((item) => {
    const matchSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase());

    const matchCategory = category === "All" || item.category === category;
    return matchSearch && matchCategory;
  });

  // Pagination
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / perPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, perPage]);

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8 text-slate-700 antialiased">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-slate-800 text-xl md:text-3xl tracking-tight flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-sky-500" />
              HR Support Panel
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Manage and track employee support requests smoothly
            </p>
          </div>
        </div>

        {/* Stats Cards Grid - Large Size */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Total Tickets
              </p>
              <p className="text-3xl font-medium text-slate-800 mt-1">
                {totalRequests}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 text-sky-500">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Payroll
              </p>
              <p className="text-3xl font-medium text-slate-800 mt-1">
                {payrollCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 text-sky-500">
              <CircleDollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                Leave
              </p>
              <p className="text-3xl font-medium text-slate-800 mt-1">
                {leaveCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500">
              <CalendarClock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                General
              </p>
              <p className="text-3xl font-medium text-slate-800 mt-1">
                {generalCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-500">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters Row - Spacious */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all font-medium"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="h-4 w-4" /> Filter:
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Payroll">Payroll</option>
              <option value="Leave">Leave</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        {/* Table Card - Large and Spacious Structure */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-200">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-5">Name</th>
                  <th className="py-4 px-5">Email</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin h-7 w-7 text-sky-500" />
                        <span className="text-sm text-slate-400 font-medium">
                          Loading support tickets...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((item, idx) => (
                    <tr
                      key={item._id || idx}
                      className="hover:bg-slate-50/50 transition-colors duration-150"
                    >
                      <td className="py-4 px-5 font-medium text-slate-800 max-w-50 truncate">
                        {item.name}
                      </td>
                      <td className="py-4 px-5 text-slate-500 max-w-55 truncate">
                        {item.email}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${getCategoryStyle(item.category)}`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td
                        className="py-4 px-5 text-slate-500 max-w-xs md:max-w-md truncate"
                        title={item.message}
                      >
                        {item.message}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Inbox className="w-10 h-10 text-slate-300 stroke-1" />
                        <p className="text-sm font-semibold text-slate-600">
                          No support requests found
                        </p>
                        <p className="text-xs text-slate-400">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Row - Large Text and Beautiful Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <p className="text-sm font-medium text-slate-500">
            Showing{" "}
            <span className="text-slate-700 font-semibold">
              {filteredData.length === 0 ? 0 : indexOfFirst + 1}
            </span>{" "}
            to{" "}
            <span className="text-slate-700 font-semibold">
              {Math.min(indexOfLast, filteredData.length)}
            </span>{" "}
            of{" "}
            <span className="text-slate-700 font-semibold">
              {filteredData.length}
            </span>{" "}
            entries
          </p>

          <div className="flex gap-3 items-center">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
                currentPage === 1
                  ? "bg-slate-100 text-slate-400 border-transparent cursor-not-allowed shadow-none"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <div className="bg-sky-50 border border-sky-100 px-4 py-2 rounded-xl text-sm font-bold text-sky-600 shadow-inner">
              Page {currentPage} of {totalPages || 1}
            </div>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
              className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
                currentPage === totalPages || totalPages === 0
                  ? "bg-slate-100 text-slate-400 border-transparent cursor-not-allowed shadow-none"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
