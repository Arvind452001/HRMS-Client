import React from "react";
import { Pencil, Share2, Trash2 } from "lucide-react";

const JobCard = ({ job, onShare, onView, onEdit, onDelete }) => {
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatSalary = () => {
    if (!job.salaryMin || !job.salaryMax)
      return "Salary Not Disclosed";

    return `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`;
  };

  const getStatusColor = () => {
    switch (job.status?.toLowerCase()) {
      case "published":
        return "bg-success/20 text-success";
      case "closed":
        return "bg-error/20 text-error";
      case "archived":
        return "bg-base-300 text-base-content";
      case "draft":
        return "bg-warning/20 text-warning";
      default:
        return "bg-base-200 text-base-content";
    }
  };

  const shareUrl = `${window.location.origin}/jobs/${job.slug}`;

  return (
    <div
      onClick={onView}
      className="relative w-full max-w-md rounded-2xl bg-base-100 p-5 shadow-md border border-base-200 
      cursor-pointer hover:shadow-lg transition duration-200"
    >

      {/* Edit & Delete Icons */}
      <div className="absolute top-2 right-3 flex gap-2">

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onEdit) onEdit(job);
          }}
          className="text-base-content/60 hover:text-info"
        >
          <Pencil size={14} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(job);
          }}
          className="text-base-content/60 hover:text-error"
        >
          <Trash2 size={14} />
        </button>

      </div>

      {/* Top Row */}
      <div className="flex items-start justify-between">
        
        {/* Deadline Badge */}
        <span className="rounded-lg border border-base-300 px-3 py-1 text-xs font-medium text-base-content/70">
          DeadLine :{" "}
          <span className="font-semibold">
            {formatDate(job.applicationDeadline)}
          </span>
        </span>

        {/* Status Badge */}
        <span
          className={`rounded-lg px-3 my-2 py-1 text-xs font-medium ${getStatusColor()}`}
        >
          {job.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-4 text-lg font-semibold text-base-content">
        {job.title}
      </h3>

      {/* Company + Location */}
      <p className="text-sm text-base-content/60">
        {job.companyName} • {job.location}
      </p>

      {/* Overview */}
      <p className="mt-2 text-sm text-base-content/70 line-clamp-3">
        {job.overview || "No description available."}
      </p>

      {/* Experience + Salary */}
      <div className="mt-3 text-xs text-base-content/70 space-y-1">
        <p>
          Experience: {job.experienceMin} - {job.experienceMax} yrs
        </p>
        <p>Salary: {formatSalary()}</p>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">

          <span className="flex items-center gap-1 rounded-full bg-success/20 px-3 py-1 text-xs font-medium text-success">
            <span className="h-2 w-2 rounded-full bg-success"></span>
            {job.department}
          </span>

          <span className="rounded-full border border-base-300 px-3 py-1 text-xs text-base-content/70">
            {job.employmentType}
          </span>

          <span className="rounded-full border border-base-300 px-3 py-1 text-xs text-base-content/70">
            {job.workplaceType}
          </span>

        </div>

        {/* Share Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare(shareUrl);
          }}
          className="rounded-lg p-1 text-base-content/60 hover:bg-base-200"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default JobCard;