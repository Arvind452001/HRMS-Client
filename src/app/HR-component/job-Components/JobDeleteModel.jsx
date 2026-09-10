import React from "react";

const JobDeleteModal = ({ deleteJob, setDeleteJob, onDelete }) => {
  if (!deleteJob) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Delete Job
        </h2>

        <p className="mb-6 text-sm text-gray-600">
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold text-gray-900">
            "{deleteJob.title}"
          </span>
          ?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteJob(null)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={() => onDelete(deleteJob)}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDeleteModal;