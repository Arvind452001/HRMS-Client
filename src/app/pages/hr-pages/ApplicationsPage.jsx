import React, { useEffect, useState } from "react";
import { getAllApplicationsApi } from "../../../api/applicationApi";

import Loader from "../../../components/Loader";
import InterviewScheduleModal from "../../HR-component/model/InterviewScheduleModal";
import { getAllEmployeesApi } from "../../../api/employee-Api";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, X } from "lucide-react";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Applied");
  const [employees, setEmployees] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [, setEmployeesLoading] = useState(true); // loading flag reserved for future UI use
  const [, setError] = useState(""); // error flag reserved for future UI use
  // MODAL STATE
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
    const cleanedFilters = {
    role: "employee",
    active: true,
    status: "approved",
  };
  
  // FETCH
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await getAllApplicationsApi({
        status: statusFilter,
      });
      setApplications(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);
  
        const res = await getAllEmployeesApi(cleanedFilters);
        setEmployees(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch employees");
      } finally {
        setEmployeesLoading(false);
      }
    };

  useEffect(() => {
    fetchApplications();
    fetchEmployees();
  }, [statusFilter]);

  
  // BADGE
  const getStatusBadge = (status) => {
    switch (status) {
      case "Applied":
        return "badge badge-info";
      case "Shortlisted":
        return "badge badge-primary";
      case "Interview":
        return "badge badge-warning";
      case "Rejected":
        return "badge badge-error";
      case "Hired":
        return "badge badge-success";
      default:
        return "badge";
    }
  };

  // PAGINATION LOGIC
  const totalPages = Math.ceil(applications.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = applications.slice(startIndex, endIndex);

  // LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  return (
    <div className="bg-slate-50 p-4 space-y-4 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white/80 backdrop-blur-xl border border-sky-100 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-sky-600 text-xl font-bold">Job Applications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage candidate applications and update status
          </p>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <select
            className="select select-sm w-32 border-sky-200 bg-white text-gray-700 focus:border-sky-400 focus:outline-none"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="Applied">All</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>
          <select
            className="select select-sm w-24 border-sky-200 focus:outline-none"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5/page</option>
            <option value={10}>10/page</option>
            <option value={20}>20/page</option>
            <option value={50}>50/page</option>
          </select>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="overflow-x-auto rounded-2xl border border-sky-100 bg-white/80 backdrop-blur-xl shadow-lg">
        <table className="table table-zebra min-w-200">
          <thead className="bg-sky-600 shadow-lg">
            <tr className="text-md uppercase tracking-wider text-white">
              <th className="py-3">Candidate</th>
              <th className="py-3">Job</th>
              <th className="py-3">Experience</th>
              <th className="py-3">Skills</th>
              <th className="py-3">Status</th>
              <th className="py-3">Applied</th>
              <th className="py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((app, index) => (
              <tr
                key={app._id}
                className={`hover:bg-sky-50/50 transition-all duration-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                {/* CANDIDATE */}
                <td>
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-600 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                      {app?.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        {app.fullName}
                      </p>
                      <p className="text-xs text-gray-500">{app.email}</p>
                      <p className="text-xs text-gray-400">{app.phone}</p>
                    </div>
                  </div>
                </td>

                {/* JOB */}
                <td>
                  <p className="font-medium text-sm text-gray-700">
                    {app.job?.title}
                  </p>
                  <p className="text-xs text-gray-500">{app.job?.department}</p>
                </td>

                {/* EXPERIENCE */}
                <td className="text-sm font-medium text-gray-700">
                  {app.totalExperience}
                </td>

                {/* SKILLS */}
                <td>
                  <div className="flex flex-wrap gap-1">
                    {app.skills?.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-sky-100 px-2 py-1 rounded-lg text-[10px] font-medium text-sky-700 border border-sky-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>

                {/* STATUS */}
                <td>
                  <span
                    className={`${getStatusBadge(
                      app.status,
                    )} text-[11px] px-3 py-1 rounded-xl font-semibold shadow-sm`}
                  >
                    {app.status}
                  </span>
                </td>

                {/* DATE */}
                <td className="text-sm text-gray-600">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>

                {/* ACTION */}
                <td>
                  <div className="flex items-center justify-center gap-2">
                    {/* VIEW */}
                    <button
                      onClick={() => navigate(`/hr/applicantDetails/${app._id}`)}
                      className="bg-sky-500 w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200"
                    >
                      <Eye />
                    </button>

                    {/* EDIT */}
                    <button
                      className={`px-4 py-[9.5px] rounded-xl text-xs font-medium shadow-md transition-all duration-200 bg-green-500 text-white hover:scale-105`}

                      onClick={() =>
                        setSelectedVisitor(app)
                      }
                    >
                      Schedule
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
{selectedVisitor && (
 <InterviewScheduleModal
  selectedVisitor={selectedVisitor}
  employees={employees}
  onClose={() => setSelectedVisitor(null)}
/>
)}
      {/* PAGINATION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-xl border border-sky-100 rounded-2xl p-4 shadow-sm">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
          <span className="font-semibold">
            {Math.min(endIndex, applications.length)}
          </span>{" "}
          of <span className="font-semibold">{applications.length}</span>{" "}
          entries
        </div>
        <div className="join">
          <button
            className="join-item btn btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            «
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`join-item btn btn-sm ${
                currentPage === i + 1 ? "bg-sky-600 text-white border-0" : ""
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="join-item btn btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            »
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedApplication && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl p-0 bg-white/95 backdrop-blur-xl border border-sky-100 shadow-2xl rounded-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-sky-100 bg-sky-50/50">
              <h3 className="text-xl font-bold text-gray-800">
                Candidate Details
              </h3>
              <button
                onClick={closeModal}
                className="btn btn-sm btn-ghost text-gray-500 hover:bg-sky-100 rounded-full w-8 h-8 p-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Row: Full Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <p className="text-gray-800 font-medium text-base">
                    {selectedApplication.fullName}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Email
                  </label>
                  <p className="text-gray-800 font-medium text-base">
                    {selectedApplication.email}
                  </p>
                </div>
              </div>

              {/* Row: Phone & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Phone
                  </label>
                  <p className="text-gray-800 font-medium text-base">
                    {selectedApplication.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </label>
                  <span
                    className={`${getStatusBadge(
                      selectedApplication.status,
                    )} text-xs px-3 py-1 rounded-xl font-semibold shadow-sm inline-block mt-1`}
                  >
                    {selectedApplication.status}
                  </span>
                </div>
              </div>

              {/* Row: Job Title & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Job Title
                  </label>
                  <p className="text-gray-800 font-medium text-base">
                    {selectedApplication.job?.title || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Department
                  </label>
                  <p className="text-gray-800 font-medium text-base">
                    {selectedApplication.job?.department || "N/A"}
                  </p>
                </div>
              </div>

              {/* Row: Experience & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total Experience
                  </label>
                  <p className="text-gray-800 font-medium text-base">
                    {selectedApplication.totalExperience || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedApplication.skills?.length ? (
                      selectedApplication.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-sky-100 px-3 py-1 rounded-lg text-xs font-medium text-sky-700 border border-sky-100"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Row: Applied Date & Additional Info (if any) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Applied On
                  </label>
                  <p className="text-gray-800 font-medium text-base">
                    {new Date(
                      selectedApplication.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
                {/* You can add more fields here, e.g., cover letter, address, etc. */}
                {selectedApplication.coverLetter && (
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Cover Letter
                    </label>
                    <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-sky-100 bg-sky-50/50">
              <button
                onClick={closeModal}
                className="btn btn-sm bg-sky-600 hover:bg-sky-700 text-white border-0 px-6 rounded-lg shadow-md"
              >
                Close
              </button>
            </div>
          </div>

          {/* Backdrop (click to close) */}
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeModal}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
