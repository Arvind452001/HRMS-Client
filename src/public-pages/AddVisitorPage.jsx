import { useState } from "react";
import { Link } from "react-router-dom";
import { createVisitorApi } from "../api/auth-Api";
import { FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa";
import {
  experienceOptions,
  interviewDomains,
  jobSourceOptions,
} from "../data/Dummy-Data";
import { FcGoogle } from "react-icons/fc";
import logo from "../assets/logo-2.png";
import { showWarning, showToast, showError } from "../utils/alert";

export default function AddVisitorPage() {
  const initialState = {
    type: "enquiry",
    fullName: "",
    phone: "",
    email: "",
    purposeOfVisit: "",
    personToMeet: "",
    visitDate: "",
    checkInTime: "",
    checkOutTime: "",
    remarks: "",
    technology: "",
    domain: "",
    totalExperience: "",
    currentCtc: "",
    expectedCtc: "",
    currentOrganization: "",
    jobSource: "",
    acknowledge: false, // NEW
  };

  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.acknowledge) {
      showWarning(
        "Acknowledgement Required",
        "Please accept the acknowledgement before submitting.",
      );
      return;
    }

    setLoading(true);

    try {
      const checkInDateTime =
        form.visitDate && form.checkInTime
          ? new Date(`${form.visitDate}T${form.checkInTime}`).toISOString()
          : null;

      const checkOutDateTime =
        form.visitDate && form.checkOutTime
          ? new Date(`${form.visitDate}T${form.checkOutTime}`).toISOString()
          : null;

      const payload = {
        type: form.type,
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        purposeOfVisit: form.purposeOfVisit,
        personToMeet: form.personToMeet,
        remarks: form.remarks,
        visitDate: form.visitDate
          ? new Date(form.visitDate).toISOString()
          : null,
        checkInTime: checkInDateTime,
        checkOutTime: checkOutDateTime,

        // candidate only
        technology: form.type === "candidate" ? form.technology : null,

        // interview only
        domain: form.type === "interview" ? form.domain : null,
        totalExperience:
          form.type === "interview" ? form.totalExperience : null,
        currentCtc: form.type === "interview" ? form.currentCtc : null,
        expectedCtc: form.type === "interview" ? form.expectedCtc : null,
        currentOrganization:
          form.type === "interview" ? form.currentOrganization : null,
        jobSource: form.type === "interview" ? form.jobSource : null,
      };

      const response = await createVisitorApi(payload);

      showToast(
        "success",
        response?.data?.message || "Visitor Saved Successfully 🎉",
      );

      setForm(initialState);
    } catch (err) {
      showError(
        "Error",
        err?.response?.data?.message || err?.message || "Scheduling failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 py-10">
      <div className="card w-full max-w-5xl bg-base-100 rounded-3xl shadow-2xl shadow-sky-900/10 border border-base-300">
        <div className="card-body p-6 sm:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="TechnoAarv HRMS"
              className="h-20 w-auto object-contain rounded-lg px-2.5 py-1 "
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-center text-base-content">
            Visitor Registration
          </h2>
          <p className="text-sm text-base-content/60 text-center mt-1 mb-8">
            Please fill in your details below to register your visit
          </p>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Visitor Type */}
            <div>
              <label className="label text-sm font-medium text-base-content/70">
                Visitor Type
              </label>
              <select
                className="select select-bordered w-full rounded-xl"
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                <option value="enquiry">Enquiry</option>
                <option value="training">Training</option>
                <option value="interview">Interview</option>
                <option value="client">Client</option>
              </select>
            </div>

            {/* Candidate Technology */}
            {form.type === "training" && (
              <div className="md:col-span-2 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 mb-3">
                  Training Details
                </p>
                <div>
                  <label className="label text-sm font-medium text-base-content/70">
                    Technology
                  </label>
                  <select
                    className="select select-bordered w-full rounded-xl bg-base-100"
                    value={form.technology}
                    onChange={(e) => update("technology", e.target.value)}
                    required
                  >
                    <option value="">Select Technology</option>
                    <option value="react">React</option>
                    <option value="node">Node.js</option>
                    <option value="mern">MERN Stack</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="devops">DevOps</option>
                  </select>
                </div>
              </div>
            )}

            {/* Interview Fields */}
            {form.type === "interview" && (
              <div className="md:col-span-2 rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 mb-3">
                  Interview Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Domain */}
                  <div className="w-full">
                    <label className="label text-sm font-medium text-base-content/70">
                      Domain
                    </label>
                    <select
                      className="select select-bordered w-full rounded-xl bg-base-100"
                      value={form.domain}
                      onChange={(e) => update("domain", e.target.value)}
                      required
                    >
                      <option value="">Select Domain</option>
                      {interviewDomains.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Experience Dropdown */}
                  <div className="w-full">
                    <label className="label text-sm font-medium text-base-content/70">
                      Total Experience
                    </label>
                    <select
                      className="select select-bordered w-full rounded-xl bg-base-100"
                      value={form.totalExperience}
                      onChange={(e) =>
                        update("totalExperience", e.target.value)
                      }
                      required
                    >
                      <option value="">Select Experience</option>
                      {experienceOptions.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Current CTC */}
                  <div className="w-full">
                    <label className="label text-sm font-medium text-base-content/70">
                      Current CTC
                    </label>
                    <input
                      placeholder="e.g. 6 LPA"
                      className="input input-bordered w-full rounded-xl bg-base-100"
                      value={form.currentCtc}
                      onChange={(e) => update("currentCtc", e.target.value)}
                      required
                    />
                  </div>

                  {/* Expected CTC */}
                  <div className="w-full">
                    <label className="label text-sm font-medium text-base-content/70">
                      Expected CTC
                    </label>
                    <input
                      placeholder="e.g. 9 LPA"
                      className="input input-bordered w-full rounded-xl bg-base-100"
                      value={form.expectedCtc}
                      onChange={(e) => update("expectedCtc", e.target.value)}
                      required
                    />
                  </div>

                  {/* Current Organization */}
                  <div className="w-full">
                    <label className="label text-sm font-medium text-base-content/70">
                      Current Organization
                    </label>
                    <input
                      className="input input-bordered w-full rounded-xl bg-base-100"
                      value={form.currentOrganization}
                      onChange={(e) =>
                        update("currentOrganization", e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Job Source */}
                  <div className="w-full">
                    <label className="label text-sm font-medium text-base-content/70">
                      How did you know about this job?
                    </label>
                    <select
                      className="select select-bordered w-full rounded-xl bg-base-100"
                      value={form.jobSource}
                      onChange={(e) => update("jobSource", e.target.value)}
                      required
                    >
                      <option value="">Select</option>
                      {jobSourceOptions.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Common Fields */}
            <div className="md:col-span-2 -mb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                Visitor Details
              </p>
            </div>

            <div>
              <label className="label text-sm font-medium text-base-content/70">
                Full Name
              </label>
              <input
                className="input input-bordered w-full rounded-xl"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label text-sm font-medium text-base-content/70">
                Phone
              </label>
              <input
                className="input input-bordered w-full rounded-xl"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label text-sm font-medium text-base-content/70">
                Email
              </label>
              <input
                type="email"
                className="input input-bordered w-full rounded-xl"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label text-sm font-medium text-base-content/70">
                Person To Meet
              </label>
              <input
                className="input input-bordered w-full rounded-xl"
                value={form.personToMeet}
                onChange={(e) => update("personToMeet", e.target.value)}
              />
            </div>

            <div>
              <label className="label text-sm font-medium text-base-content/70">
                Visit Date
              </label>
              <input
                type="date"
                className="input input-bordered w-full rounded-xl"
                value={form.visitDate}
                onChange={(e) => update("visitDate", e.target.value)}
              />
            </div>

            <div>
              <label className="label text-sm font-medium text-base-content/70">
                Check In
              </label>
              <input
                type="time"
                className="input input-bordered w-full rounded-xl"
                value={form.checkInTime}
                onChange={(e) => update("checkInTime", e.target.value)}
              />
            </div>

            <div>
              <label className="label text-sm font-medium text-base-content/70">
                Check Out
              </label>
              <input
                type="time"
                className="input input-bordered w-full rounded-xl"
                value={form.checkOutTime}
                onChange={(e) => update("checkOutTime", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label text-sm font-medium text-base-content/70">
                Remarks
              </label>
              <textarea
                className="textarea textarea-bordered w-full rounded-xl"
                rows={3}
                value={form.remarks}
                onChange={(e) => update("remarks", e.target.value)}
              />
            </div>

            {/* Follow Us */}
            <div className="divider text-xs text-base-content/40 md:col-span-2">
              Follow Us
            </div>
            <div className="md:col-span-2 flex justify-center gap-6 text-2xl mt-4">
              <a
                href="https://in.linkedin.com/company/technorizen-software-solutions-pvt-ltd"
                target="_blank"
                className="text-sky-700"
              >
                <FaLinkedin />
              </a>

              <a
                href="https://www.instagram.com/technorizen_software_solutions"
                target="_blank"
                className="text-pink-600"
              >
                <FaInstagram />
              </a>

              <a
                href="https://www.facebook.com/technorizen/"
                target="_blank"
                className="text-sky-600"
              >
                <FaFacebook />
              </a>
              <a
                href="https://accounts.google.com"
                target="_blank"
                className="text-sky-600"
              >
                <FcGoogle />
              </a>
            </div>

            {/* Acknowledgement */}
            <div className="md:col-span-2 flex items-start sm:items-center justify-center gap-2 mt-2 text-center sm:text-left">
              <input
                type="checkbox"
                className="checkbox checkbox-primary mt-0.5 sm:mt-0"
                checked={form.acknowledge}
                onChange={(e) => update("acknowledge", e.target.checked)}
              />
              <label className="text-sm text-base-content/70">
                I acknowledge that the information provided is correct and I
                agree to proceed.
              </label>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-center pt-1">
              <button
                className="btn btn-primary rounded-xl w-full sm:w-48 shadow-md shadow-sky-900/20"
                type="submit"
                disabled={loading || !form.acknowledge}
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>
          </form>

          <div className="divider text-xs text-base-content/40">OR</div>

          <div className="text-center mt-2 space-y-3">
            <p className="text-sm text-gray-600">Are you an Employee?</p>

            <Link
              to="/login"
              className="btn btn-outline btn-primary btn-sm rounded-xl px-6"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
