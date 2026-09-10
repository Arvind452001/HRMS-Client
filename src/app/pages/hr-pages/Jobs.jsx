import React, { useEffect, useState } from "react";
import JobHeader from "../../HR-component/job-Components/JobHeader";
import SharePostModal from "../../HR-component/job-Components/SharePostModal";
import JobCard from "../../HR-component/job-Components/JobCard";
import JobFormModal from "../../HR-component/job-Components/JobFormModal";
import JobDeleteModal from "../../HR-component/job-Components/JobDeleteModel";
import { getAllJobApi, deleteJobApi } from "../../../api/jobApi";
import Loader from "../../../components/Loader";
import { showToast, showError } from "../../../utils/alert";
// पेजिनेशन और विजुअल स्टेट्स को आकर्षक बनाने के लिए आइकॉन्स
import { ChevronLeft, ChevronRight, Briefcase, Inbox } from "lucide-react";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openShare, setOpenShare] = useState(false);

  // States for job form modal (create / view / edit)
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalMode, setModalMode] = useState("view");

  // State for delete confirmation modal
  const [deleteJob, setDeleteJob] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Status filter
  const [filter, setFilter] = useState("All");

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await getAllJobApi({ page, limit, status: filter });
      if (res.success) {
        setJobs(res.data);
        setTotalPages(res.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, filter]);

  // Handlers
  const handleViewJob = (job) => {
    setSelectedJob(job);
    setModalMode("view");
    setOpenModal(true);
  };

  const handleShareJob = (url) => {
    setShareLink(url);
    setOpenShare(true);
  };

  const handleEdit = (job) => {
    setSelectedJob(job);
    setModalMode("edit");
    setOpenModal(true);
  };

  const handleDelete = async (job) => {
    try {
      const res = await deleteJobApi(job._id);

      await showToast("success", res.message || "Job deleted successfully.");

      setDeleteJob(null);
      fetchJobs();
    } catch (error) {
      showError(
        "Delete Failed",
        error?.message || error?.response?.data?.message || "Something went wrong."
      );
    }
  };

  return (
    <div className="space-y-6 text-slate-700 antialiased">
      <JobHeader
        title="Job Post"
        subtitle="Create and manage job openings"
        filter={filter}
        setFilter={(value) => {
          setFilter(value);
          setPage(1);
        }}
        onCreate={() => {
          setSelectedJob(null);
          setModalMode("create");
          setOpenModal(true);
        }}
      />

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col gap-2 items-center justify-center min-h-100">
          <Loader />
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-2xl border border-slate-200/60 text-slate-400 gap-2 shadow-sm">
          <Inbox className="h-10 w-10 text-slate-300 stroke-1" />
          <p className="text-sm font-semibold text-slate-600">No jobs found</p>
          <p className="text-xs text-slate-400 max-w-xs">
            There are no job postings available under the selected filter
            criteria.
          </p>
        </div>
      ) : (
        <>
          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onView={() => handleViewJob(job)}
                onShare={handleShareJob}
                onEdit={() => handleEdit(job)}
                onDelete={() => setDeleteJob(job)}
              />
            ))}
          </div>

          {/* 🌟 NEW IMPROVED PREMIUM PAGINATION CONTROLS */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-400">
              Showing page{" "}
              <span className="font-semibold text-slate-600">{page}</span> of{" "}
              <span className="font-semibold text-slate-600">{totalPages}</span>
            </p>

            <div className="flex gap-2 items-center">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm border ${
                  page === 1
                    ? "bg-slate-100 text-slate-400 border-transparent cursor-not-allowed shadow-none"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100"
                }`}
              >
                <ChevronLeft size={14} />
                Prev
              </button>

              <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 shadow-inner">
                {page} / {totalPages || 1}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm border ${
                  page === totalPages
                    ? "bg-slate-100 text-slate-400 border-transparent cursor-not-allowed shadow-none"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100"
                }`}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Job Form Modal (Create / View / Edit) */}
      <JobFormModal
        isOpen={openModal}
        mode={modalMode}
        jobData={selectedJob}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          fetchJobs();
        }}
      />

      {/* Share Post Modal */}
      <SharePostModal
        isOpen={openShare}
        shareUrl={shareLink}
        onClose={() => setOpenShare(false)}
      />

      {/* Delete Confirmation Modal */}
      <JobDeleteModal
        deleteJob={deleteJob}
        setDeleteJob={setDeleteJob}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Jobs;
