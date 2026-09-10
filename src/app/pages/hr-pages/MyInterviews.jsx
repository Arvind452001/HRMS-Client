import React, { useEffect, useMemo, useState } from "react";
import { getEmployeeInterviewsApi } from "../../../api/interviewApi";
import InterviewReviewModal from "../../HR-component/model/InterviewReviewModal";
// Icons के लिए Lucide-React का उपयोग किया गया है, जो UI को प्रोफेशनल लुक देता है
import {
  Calendar,
  CheckCircle2,
  Loader2,
  Users,
  Clock,
  ArrowLeft,
  ArrowRight,
  Eye,
  MessageSquareText,
} from "lucide-react";

const MyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [modalMode, setModalMode] = useState("edit");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);

  const user = JSON.parse(localStorage.getItem("technoUser"));

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeInterviewsApi(user.id);

      if (response?.success && Array.isArray(response.interviews)) {
        setInterviews(response.interviews);
      } else {
        setInterviews([]);
      }
    } catch (error) {
      console.error(error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Compute stats
  const totalInterviews = interviews.length;
  const scheduledCount = interviews.filter(
    (i) => i.status === "scheduled",
  ).length;
  const completedCount = interviews.filter(
    (i) => i.status === "completed",
  ).length;
  const inProgressCount = interviews.filter(
    (i) => i.status === "in-progress",
  ).length;

  // Pagination
  const totalPages = Math.ceil(interviews.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return interviews.slice(startIndex, startIndex + rowsPerPage);
  }, [interviews, currentPage, rowsPerPage]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          Loading interviews...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50/50 text-slate-800 antialiased">
      {/* HEADER */}
      <div className="bg-sky-600 rounded-2xl p-6 shadow-md shadow-sky-100 mb-8 border border-sky-500/10">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          My Interviews
        </h1>
        <p className="text-sky-100 text-sm mt-1 font-medium opacity-90">
          Manage and evaluate your assigned candidate schedules
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Interviews
            </p>
            <h2 className="text-3xl font-bold text-slate-800 mt-1">
              {totalInterviews}
            </h2>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Scheduled
            </p>
            <h2 className="text-3xl font-bold text-amber-600 mt-1">
              {scheduledCount}
            </h2>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Completed
            </p>
            <h2 className="text-3xl font-bold text-emerald-600 mt-1">
              {completedCount}
            </h2>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              In Progress
            </p>
            <h2 className="text-3xl font-bold text-indigo-600 mt-1">
              {inProgressCount}
            </h2>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 text-left">Candidate</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Application Type</th>
                <th className="p-4 text-left">Round</th>
                <th className="p-4 text-left">Date & Time</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Calendar className="h-8 w-8 stroke-1" />
                      <p className="font-medium">No Interviews Assigned</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const candidate = item.candidate || {};
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/50 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">
                            {candidate.fullName || "N/A"}
                          </span>
                          <span className="text-xs text-slate-400 mt-0.5">
                            {candidate.phone || "No phone"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        {candidate.email || "N/A"}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {item.candidateModel || "—"}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {item.roundType}
                      </td>
                      <td className="p-4 text-slate-600">
                        {item.scheduledDate
                          ? new Date(item.scheduledDate).toLocaleString(
                              "en-IN",
                              {
                                timeZone: "Asia/Kolkata",
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            item.status === "completed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.status === "scheduled"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-sky-50 text-sky-700 border border-sky-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                              item.status === "completed"
                                ? "bg-emerald-500"
                                : item.status === "scheduled"
                                  ? "bg-amber-500"
                                  : "bg-sky-500"
                            }`}
                          />
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {item.status === "completed" ? (
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-all duration-150 shadow-sm"
                            onClick={() => {
                              setSelectedInterview(item);
                              setModalMode("view");
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Feedback
                          </button>
                        ) : (
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm hover:shadow transition-all duration-150"
                            onClick={() => {
                              setSelectedInterview(item);
                              setModalMode("edit");
                            }}
                          >
                            <MessageSquareText className="h-3.5 w-3.5" />
                            Give Feedback
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <button
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Prev
            </button>
            <span className="text-xs font-semibold text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal Integration */}
      {selectedInterview && (
        <InterviewReviewModal
          interview={selectedInterview}
          mode={modalMode}
          onClose={() => setSelectedInterview(null)}
          onSuccess={() => {
            setSelectedInterview(null);
            fetchInterviews();
          }}
        />
      )}
    </div>
  );
};

export default MyInterviews;
