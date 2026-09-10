import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicationsByIDApi } from "../../../api/applicationApi";
import { getCandidateInterviewsApi } from "../../../api/interviewApi";
import { showError } from "../../../utils/alert";

export default function AdminApplicantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [interviews, setInterviews] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const res = await getApplicationsByIDApi(id);
      setApplicant(res.data);

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

  if (!applicant) return <div className="p-4 text-center text-gray-500">Loading...</div>;

  const handleDownloadResume = () => {
    if (applicant.resumeUrl) {
      window.open(applicant.resumeUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-sky-600 rounded-xl px-4 py-3 shadow-md mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Applicant Details</h1>
          <p className="text-sky-100 text-xs">Complete profile & interview history</p>
        </div>
        <button
          className="btn btn-sm bg-white/20 text-white hover:bg-white/30 border-0 normal-case text-sm"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow p-4 space-y-4">
        {/* Step 1 – Personal Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-sky-600 rounded-full"></span>
            Step 1 – Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <p>
              <span className="text-gray-500 font-medium">Full Name:</span>{" "}
              <span className="text-gray-800 font-semibold">{applicant.fullName}</span>
            </p>
            <p>
              <span className="text-gray-500 font-medium">Email:</span>{" "}
              <span className="text-gray-800 font-semibold">{applicant.email}</span>
            </p>
            <p>
              <span className="text-gray-500 font-medium">Phone:</span>{" "}
              <span className="text-gray-800 font-semibold">{applicant.phone}</span>
            </p>
            <p>
              <span className="text-gray-500 font-medium">Status:</span>{" "}
              <span className={`badge badge-sm ${
                applicant.status === "Applied" ? "badge-info" :
                applicant.status === "Shortlisted" ? "badge-warning" :
                applicant.status === "Rejected" ? "badge-error" : "badge-success"
              }`}>
                {applicant.status}
              </span>
            </p>
            <p>
              <span className="text-gray-500 font-medium">Total Experience:</span>{" "}
              <span className="text-gray-800 font-semibold">{applicant.totalExperience || "—"}</span>
            </p>
            <p>
              <span className="text-gray-500 font-medium">Current Organization:</span>{" "}
              <span className="text-gray-800 font-semibold">{applicant.currentOrganization || "—"}</span>
            </p>
            <p>
              <span className="text-gray-500 font-medium">Current CTC:</span>{" "}
              <span className="text-gray-800 font-semibold">{applicant.currentCtc || "—"}</span>
            </p>
            <p>
              <span className="text-gray-500 font-medium">Expected CTC:</span>{" "}
              <span className="text-gray-800 font-semibold">{applicant.expectedCtc || "—"}</span>
            </p>
            <p className="col-span-1 md:col-span-2">
              <span className="text-gray-500 font-medium">Skills:</span>{" "}
              <span className="text-gray-800 font-semibold">
                {applicant.skills?.length ? applicant.skills.join(", ") : "—"}
              </span>
            </p>
            <p className="col-span-1 md:col-span-2">
              <span className="text-gray-500 font-medium">Source:</span>{" "}
              <span className="text-gray-800 font-semibold">{applicant.source || "—"}</span>
            </p>
            <p className="col-span-1 md:col-span-2">
              <span className="text-gray-500 font-medium">Cover Letter:</span>{" "}
              <span className="text-gray-800 font-semibold">
                {applicant.coverLetter || "No cover letter provided"}
              </span>
            </p>
            <p className="col-span-1 md:col-span-2">
              <span className="text-gray-500 font-medium">Resume:</span>{" "}
              {applicant.resumeUrl ? (
                <button
                  onClick={handleDownloadResume}
                  className="text-sky-600 hover:text-sky-800 underline text-sm font-medium inline-flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Resume
                </button>
              ) : (
                <span className="text-gray-800 font-semibold">Not uploaded</span>
              )}
            </p>
          </div>
        </div>

        {/* Step 2 – Applied Job */}
        {applicant.job && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-sky-600 rounded-full"></span>
              Step 2 – Applied Job
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <p>
                <span className="text-gray-500 font-medium">Job Title:</span>{" "}
                <span className="text-gray-800 font-semibold">{applicant.job.title}</span>
              </p>
              <p>
                <span className="text-gray-500 font-medium">Company:</span>{" "}
                <span className="text-gray-800 font-semibold">{applicant.job.companyName}</span>
              </p>
              <p>
                <span className="text-gray-500 font-medium">Department:</span>{" "}
                <span className="text-gray-800 font-semibold">{applicant.job.department}</span>
              </p>
              <p>
                <span className="text-gray-500 font-medium">Location:</span>{" "}
                <span className="text-gray-800 font-semibold">{applicant.job.location}</span>
              </p>
              <p>
                <span className="text-gray-500 font-medium">Workplace Type:</span>{" "}
                <span className="text-gray-800 font-semibold">{applicant.job.workplaceType}</span>
              </p>
              <p>
                <span className="text-gray-500 font-medium">Employment Type:</span>{" "}
                <span className="text-gray-800 font-semibold">{applicant.job.employmentType}</span>
              </p>
              <p>
                <span className="text-gray-500 font-medium">Experience Required:</span>{" "}
                <span className="text-gray-800 font-semibold">
                  {applicant.job.experienceMin} – {applicant.job.experienceMax} years
                </span>
              </p>
              <p>
                <span className="text-gray-500 font-medium">Salary Range:</span>{" "}
                <span className="text-gray-800 font-semibold">
                  {applicant.job.currency} {applicant.job.salaryMin} – {applicant.job.salaryMax}
                </span>
              </p>
              <p className="col-span-1 md:col-span-2">
                <span className="text-gray-500 font-medium">Overview:</span>{" "}
                <span className="text-gray-800 font-semibold">{applicant.job.overview || "—"}</span>
              </p>
              <p className="col-span-1 md:col-span-2">
                <span className="text-gray-500 font-medium">Responsibilities:</span>{" "}
                <span className="text-gray-800 font-semibold">
                  {applicant.job.responsibilities?.length ? applicant.job.responsibilities.join(", ") : "—"}
                </span>
              </p>
              <p className="col-span-1 md:col-span-2">
                <span className="text-gray-500 font-medium">Required Skills:</span>{" "}
                <span className="text-gray-800 font-semibold">
                  {applicant.job.requiredSkills?.length ? applicant.job.requiredSkills.join(", ") : "—"}
                </span>
              </p>
              <p className="col-span-1 md:col-span-2">
                <span className="text-gray-500 font-medium">Good to Have Skills:</span>{" "}
                <span className="text-gray-800 font-semibold">
                  {applicant.job.goodToHaveSkills?.length ? applicant.job.goodToHaveSkills.join(", ") : "—"}
                </span>
              </p>
              <p className="col-span-1 md:col-span-2">
                <span className="text-gray-500 font-medium">Benefits:</span>{" "}
                <span className="text-gray-800 font-semibold">
                  {applicant.job.benefits?.length ? applicant.job.benefits.join(", ") : "—"}
                </span>
              </p>
              <p className="col-span-1 md:col-span-2">
                <span className="text-gray-500 font-medium">Application Deadline:</span>{" "}
                <span className="text-gray-800 font-semibold">
                  {new Date(applicant.job.applicationDeadline).toLocaleDateString("en-IN")}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Step 3 – Interview Rounds */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-2 flex items-center gap-2">
            <span className="inline-block w-1 h-4 bg-sky-600 rounded-full"></span>
            Step 3 – Interview Rounds
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
                      {index + 1}
                    </span>
                    {round.roundType} Round
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 mt-2 text-sm">
                    <p>
                      <span className="text-gray-500 font-medium">Interviewer:</span>{" "}
                      <span className="text-gray-800 font-semibold">
                        {round.interviewer?.personal?.fullName || "Not assigned"}
                        {round.interviewer?.professional?.employeeId && (
                          <span className="text-xs text-gray-500 ml-1 font-normal">
                            ({round.interviewer.professional.employeeId})
                          </span>
                        )}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500 font-medium">Scheduled:</span>{" "}
                      <span className="text-gray-800 font-semibold">
                        {new Date(round.scheduledDate).toLocaleDateString("en-IN")}{" "}
                        {new Date(round.scheduledDate).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Asia/Kolkata",
                        })}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500 font-medium">Status:</span>{" "}
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
                    <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                      <p>
                        <span className="text-gray-500 font-medium">Rating:</span>{" "}
                        <span className="text-gray-800 font-semibold">{round.rating}/5</span>
                      </p>
                      <p>
                        <span className="text-gray-500 font-medium">Feedback:</span>{" "}
                        <span className="text-gray-800 font-semibold">{round.feedback}</span>
                      </p>
                      <p>
                        <span className="text-gray-500 font-medium">Recommendation:</span>{" "}
                        <span className="text-gray-800 font-semibold">{round.recommendation}</span>
                      </p>
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