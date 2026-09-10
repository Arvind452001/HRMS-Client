import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVisitorById } from "../../../api/visitor-Api";
import { getCandidateInterviewsApi } from "../../../api/interviewApi";
import { showError } from "../../../utils/alert";

export default function AdminVisitorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visitor, setVisitor] = useState(null);
  const [interviews, setInterviews] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const visitorRes = await getVisitorById(id);
      setVisitor(visitorRes.data);
      const interviewRes = await getCandidateInterviewsApi(id);
      setInterviews(interviewRes.interviews || []);
    } catch {
      showError("Error", "Failed to load data");
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  if (!visitor) return <div className="p-4 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      {/* Header – compact, matching sidebar header style */}
      <div className="bg-sky-600 rounded-xl px-4 py-3 shadow-md mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Visitor Details</h1>
          <p className="text-sky-100 text-xs">Complete profile & interview history</p>
        </div>
        <button
          className="btn btn-sm bg-white/20 text-white hover:bg-white/30 border-0 normal-case text-sm"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      {/* Main card – reduced padding */}
      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        {/* Step 1 – Personal Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-sky-600 rounded-full"></span>
            Step 1 – Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
            <p><span className="font-medium">Name:</span> {visitor.fullName}</p>
            <p><span className="font-medium">Email:</span> {visitor.email}</p>
            <p><span className="font-medium">Phone:</span> {visitor.phone}</p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span className={`badge badge-sm ${visitor.status === "pending" ? "badge-warning" : "badge-success"}`}>
                {visitor.status}
              </span>
            </p>
          </div>
        </div>

        {/* Step 2 – Application Details (only for interview type) */}
        {visitor.type === "interview" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-sky-600 rounded-full"></span>
              Step 2 – Application Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700">
              <p><span className="font-medium">Domain:</span> {visitor.domain}</p>
              <p><span className="font-medium">Total Experience:</span> {visitor.totalExperience}</p>
              <p><span className="font-medium">Current CTC:</span> {visitor.currentCtc}</p>
              <p><span className="font-medium">Expected CTC:</span> {visitor.expectedCtc}</p>
              <p><span className="font-medium">Current Organization:</span> {visitor.currentOrganization}</p>
            </div>
          </div>
        )}

        {/* Interview Rounds */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-sky-600 rounded-full"></span>
            Interview Rounds
          </h3>

          {interviews.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No rounds scheduled yet.</p>
          ) : (
            <div className="space-y-3">
              {interviews.map((round, index) => (
                <div
                  key={round._id}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50/50"
                >
                  <h4 className="text-sm font-semibold text-sky-700 flex items-center gap-2">
                    <span className="bg-sky-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                      {index + 3}
                    </span>
                    {round.roundType} Round
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 mt-2 text-sm text-gray-700">
                     <p>
                      <span className="font-medium">Interviewer:</span>{" "}
                     <span className="text-md font-bold"> {round.interviewer?.personal?.fullName || "Not assigned"}</span> <span className="text-xs text-gray-500">({round.interviewer?.professional?.employeeId || "Not assigned"})</span>
                    </p>
                    <p>
                      <span className="font-medium">Scheduled:</span>{" "}
                      {new Date(round.scheduledDate).toLocaleDateString("en-IN")}{" "}
                      {new Date(round.scheduledDate).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`badge badge-sm ${
                          round.status === "completed"
                            ? "badge-success"
                            : round.status === "scheduled"
                            ? "badge-warning"
                            : "badge-info"
                        }`}
                      >
                        {round.status}
                      </span>
                    </p>
                  </div>

                  {round.rating && (
                    <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 text-sm text-gray-700">
                      <p><span className="font-medium">Rating:</span> {round.rating}/5</p>
                      <p><span className="font-medium">Feedback:</span> {round.feedback}</p>
                      <p><span className="font-medium">Recommendation:</span> {round.recommendation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}