import React, { useEffect, useState } from "react";
import BaseModal from "../../../components/BaseModal";
import { showError, showSuccess, showWarning } from "../../../utils/alert";
import {
  createCandidateResumeApi,
  getCandidateResumeCategoriesApi,
  updateCandidateResumeApi,
} from "../../../api/candidateResume-Api";

const experienceOptions = [
  "Fresher",
  "Less than 1 year",
  "1-2 years",
  "2-3 years",
  "3-4 years",
  "4-5 years",
  "5-6 years",
  "6-7 years",
  "7-8 years",
  "8-9 years",
  "9-10 years",
  "10+ years",
];

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  totalExperience: "",
  currentCtc: "",
  expectedCtc: "",
  currentOrganization: "",
  category: "",
  source: "Walk-in",
  remarks: "",
};

export default function AddCandidateResumeModal({ candidate, onClose, onCreated }) {
  const isEditMode = Boolean(candidate);

  const [form, setForm] = useState(() =>
    isEditMode
      ? {
          fullName: candidate.fullName || "",
          phone: candidate.phone || "",
          email: candidate.email || "",
          totalExperience: candidate.totalExperience || "",
          currentCtc: candidate.currentCtc || "",
          expectedCtc: candidate.expectedCtc || "",
          currentOrganization: candidate.currentOrganization || "",
          category: candidate.category || "",
          source: candidate.source || "Walk-in",
          remarks: candidate.remarks || "",
        }
      : initialForm
  );
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCandidateResumeCategoriesApi();
        setCategoryOptions(data || []);
      } catch (err) {
        showError(
          "Failed to load categories",
          err.message || "Something went wrong"
        );
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      showWarning(
        "Invalid File",
        "Only PDF, JPG or PNG resumes are allowed"
      );
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showWarning("File Too Large", "Resume must be under 5MB");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
  };

  const handleSubmit = async () => {
    const { category } = form;

    if (!category) {
      return showWarning("Missing Field", "Category is required");
    }

    if (categoryOptions.length && !categoryOptions.includes(category)) {
      return showWarning(
        "Invalid Category",
        "Please pick a category from the list (choose \"Other\" if it isn't listed)"
      );
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const data = isEditMode
        ? await updateCandidateResumeApi(candidate._id, formData)
        : await createCandidateResumeApi(formData);

      await showSuccess(
        isEditMode ? "Candidate Updated" : "Candidate Saved",
        data.message ||
          (isEditMode
            ? "Candidate updated successfully"
            : "Candidate resume saved successfully")
      );

      onCreated?.();
      onClose();
    } catch (error) {
      showError(
        isEditMode ? "Update Failed" : "Save Failed",
        error?.message || "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal
      title={isEditMode ? "Edit Candidate Resume" : "Add Candidate Resume"}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button
            className="btn btn-outline btn-sm sm:btn-md"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm sm:btn-md"
            onClick={handleSubmit}
            disabled={submitting || loadingCategories}
          >
            {submitting
              ? "Saving..."
              : isEditMode
              ? "Update Candidate"
              : "Save Candidate"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
        {/* CATEGORY — same dropdown design as the "All Categories" filter */}
        <div className="form-control sm:col-span-2">
          <label className="label text-sm font-medium">Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="select select-sm w-full border-sky-200 bg-white text-gray-700"
            disabled={loadingCategories}
          >
            <option value="">
              {loadingCategories ? "Loading..." : "Select Category"}
            </option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control sm:col-span-2">
          <label className="label text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="input input-bordered input-sm sm:input-md w-full"
            placeholder="Candidate's full name"
          />
        </div>

        <div className="form-control">
          <label className="label text-sm font-medium">Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="input input-bordered input-sm sm:input-md w-full"
            placeholder="10-digit mobile number"
          />
        </div>

        <div className="form-control">
          <label className="label text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="input input-bordered input-sm sm:input-md w-full"
            placeholder="candidate@email.com"
          />
        </div>

        <div className="form-control">
          <label className="label text-sm font-medium">Total Experience</label>
          <select
            name="totalExperience"
            value={form.totalExperience}
            onChange={handleChange}
            className="select select-bordered select-sm sm:select-md w-full"
          >
            <option value="">Select Experience</option>
            {experienceOptions.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label text-sm font-medium">Current Organization</label>
          <input
            type="text"
            name="currentOrganization"
            value={form.currentOrganization}
            onChange={handleChange}
            className="input input-bordered input-sm sm:input-md w-full"
            placeholder="Current company (if any)"
          />
        </div>

        <div className="form-control">
          <label className="label text-sm font-medium">Current CTC</label>
          <input
            type="text"
            name="currentCtc"
            value={form.currentCtc}
            onChange={handleChange}
            className="input input-bordered input-sm sm:input-md w-full"
            placeholder="e.g. 4.5 LPA"
          />
        </div>

        <div className="form-control">
          <label className="label text-sm font-medium">Expected CTC</label>
          <input
            type="text"
            name="expectedCtc"
            value={form.expectedCtc}
            onChange={handleChange}
            className="input input-bordered input-sm sm:input-md w-full"
            placeholder="e.g. 6 LPA"
          />
        </div>

        <div className="form-control">
          <label className="label text-sm font-medium">Source</label>
          <select
            name="source"
            value={form.source}
            onChange={handleChange}
            className="select select-bordered select-sm sm:select-md w-full"
          >
            <option value="Walk-in">Walk-in</option>
            <option value="Online">Online</option>
            <option value="Referral">Referral</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-control sm:col-span-2">
          <label className="label text-sm font-medium">Remarks</label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
            rows={2}
            placeholder="Any additional notes"
          />
        </div>

        <div className="form-control sm:col-span-2">
          <label className="label text-sm font-medium">
            Resume / CV (PDF / JPG / PNG, max 5MB)
          </label>
          {isEditMode && candidate?.resumeFileName && !resumeFile && (
            <p className="text-xs text-gray-500 mb-1">
              Current file: {candidate.resumeFileName} — choose a new file only
              if you want to replace it.
            </p>
          )}
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="file-input file-input-bordered file-input-sm sm:file-input-md w-full"
          />
          {resumeFile && (
            <p className="text-xs text-gray-500 mt-1">Selected: {resumeFile.name}</p>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
