import React, { useState, useEffect } from "react";
import ResponseModal from "../../../components/ResponseModal";
import { createJobApi, updateJobApi } from "../../../api/jobApi";

export default function JobFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode = "create", // create | view | edit
  jobData = null,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const [loading, setLoading] = useState(false);

  const [responseModal, setResponseModal] = useState({
    open: false,
    type: "success",
    message: "",
  });
  const [form, setForm] = useState({
    title: "",
    department: "Development",
    companyName: "",
    location: "",
    workplaceType: "On-Site",
    employmentType: "Full-time",
    experienceMin: "",
    experienceMax: "",
    overview: "",
    responsibilities: "",
    requiredSkills: "",
    goodToHaveSkills: "",
    qualifications: "",
    certifications: "",
    salaryMin: "",
    salaryMax: "",
    currency: "INR",
    benefits: "",
    applicationEmail: "",
    applicationLink: "",
    applicationDeadline: "",
    visibility: "Public",
    status: "Draft",
  });

  // Prefill form in edit/view mode
  useEffect(() => {
    if (jobData && (isEdit || isView)) {
      setForm({
        ...jobData,
        responsibilities: jobData.responsibilities?.join(", ") || "",
        requiredSkills: jobData.requiredSkills?.join(", ") || "",
        goodToHaveSkills: jobData.goodToHaveSkills?.join(", ") || "",
        benefits: jobData.benefits?.join(", ") || "",
        applicationDeadline: jobData.applicationDeadline
          ? jobData.applicationDeadline.split("T")[0]
          : "",
      });
    }
  }, [jobData, mode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      experienceMin: Number(form.experienceMin),
      experienceMax: Number(form.experienceMax),
      salaryMin: Number(form.salaryMin),
      salaryMax: Number(form.salaryMax),
      responsibilities: form.responsibilities
        ? form.responsibilities.split(",").map((s) => s.trim())
        : [],
      requiredSkills: form.requiredSkills
        ? form.requiredSkills.split(",").map((s) => s.trim())
        : [],
      goodToHaveSkills: form.goodToHaveSkills
        ? form.goodToHaveSkills.split(",").map((s) => s.trim())
        : [],
      benefits: form.benefits
        ? form.benefits.split(",").map((s) => s.trim())
        : [],
    };

    try {
      if (isCreate) {
        await createJobApi(payload);
      }

      if (isEdit && jobData?._id) {
        await updateJobApi(jobData._id, payload);
      }

      setResponseModal({
        open: true,
        type: "success",
        message: isCreate
          ? "Job created successfully!"
          : "Job updated successfully!",
      });

      onSuccess?.();
    } catch (err) {
      setResponseModal({
        open: true,
        type: "error",
        message: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl rounded-xl bg-white p-5 overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-center text-base font-semibold">
          {isCreate && "Create Job"}
          {isEdit && "Update Job"}
          {isView && "View Job"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Job Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={isView}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              disabled={isView}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            >
              <option value="Development">Development</option>
              <option value="HR">HR</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Support">Support</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Company + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Name
              </label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                disabled={isView}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                disabled={isView}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Workplace + Employment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Workplace Type
              </label>
              <select
                name="workplaceType"
                value={form.workplaceType}
                onChange={handleChange}
                disabled={isView}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              >
                <option value="On-Site">On-Site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                disabled={isView}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Temporary">Temporary</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
          </div>

          {/* Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Minimum Experience
              </label>
              <input
                type="number"
                name="experienceMin"
                value={form.experienceMin}
                onChange={handleChange}
                disabled={isView}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Maximum Experience
              </label>
              <input
                type="number"
                name="experienceMax"
                value={form.experienceMax}
                onChange={handleChange}
                disabled={isView}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Minimum Salary
              </label>
              <input
                type="number"
                name="salaryMin"
                value={form.salaryMin}
                onChange={handleChange}
                disabled={isView}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Maximum Salary
              </label>
              <input
                type="number"
                name="salaryMax"
                value={form.salaryMax}
                onChange={handleChange}
                disabled={isView}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Overview */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Job Overview
            </label>
            <textarea
              name="overview"
              rows={3}
              value={form.overview}
              onChange={handleChange}
              disabled={isView}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            />
          </div>

          {/* Responsibilities */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Responsibilities
            </label>
            <textarea
              name="responsibilities"
              rows={2}
              value={form.responsibilities}
              onChange={handleChange}
              disabled={isView}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Required Skills
            </label>
            <textarea
              name="requiredSkills"
              rows={1}
              value={form.requiredSkills}
              onChange={handleChange}
              disabled={isView}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Good To Have Skills
            </label>
            <textarea
              name="goodToHaveSkills"
              rows={1}
              value={form.goodToHaveSkills}
              onChange={handleChange}
              disabled={isView}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Benefits
            </label>
            <textarea
              name="benefits"
              rows={1}
              value={form.benefits}
              onChange={handleChange}
              disabled={isView}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            />
          </div>

          {/* Application Info */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Application Email
            </label>
            <input
              type="email"
              name="applicationEmail"
              value={form.applicationEmail}
              onChange={handleChange}
              disabled={isView}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Application Link
            </label>
            <input
              name="applicationLink"
              value={form.applicationLink}
              onChange={handleChange}
              disabled={isView}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Application Deadline
            </label>
            <input
              type="date"
              name="applicationDeadline"
              value={form.applicationDeadline}
              onChange={handleChange}
              disabled={isView}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
            />
          </div>

          {/* Visibility + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Visibility
              </label>
              <select
                name="visibility"
                value={form.visibility}
                onChange={handleChange}
                disabled={isView}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={isView}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Closed">Closed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>
          {!isView && (
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full px-10 py-2 text-sm font-semibold text-white
      bg-sky-600
      hover:bg-sky-700 transition-all shadow-md
      disabled:opacity-50"
              >
                {loading
                  ? "Submitting..."
                  : isCreate
                    ? "Create Job"
                    : "Update Job"}
              </button>
            </div>
          )}
        </form>
      </div>

      <ResponseModal
        isOpen={responseModal.open}
        type={responseModal.type}
        message={responseModal.message}
        duration={1000}
        onClose={() => {
          setResponseModal({ ...responseModal, open: false });

          if (responseModal.type === "success") {
            onSuccess?.(); // refresh jobs
            onClose(); // close modal
          }
        }}
      />
    </div>
  );
}
