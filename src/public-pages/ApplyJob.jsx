import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getJobBySlug } from "../api/jobApi";
import ResponseModal from "../components/ResponseModal";
import { applyJobApi } from "../api/applicationApi";
import { showToast, showError } from "../utils/alert";

const experienceOptions = [
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

const sourceOptions = ["Walk-in", "Online", "Referral", "LinkedIn"];

const ApplyJob = () => {
  const { slug } = useParams();

  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    totalExperience: "",
    currentCtc: "",
    expectedCtc: "",
    currentOrganization: "",
    skills: "",
    resumeUrl: "",
    source: "Online",
    coverLetter: "",
  });

  // Fetch job to get jobId
  useEffect(() => {
    const fetchJob = async () => {
      const res = await getJobBySlug(slug);
      if (res.success) {
        setJobId(res.data._id);
      }
    };
    fetchJob();
  }, [slug]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!jobId) return;

  setLoading(true);

  const payload = {
    ...form,
    job: jobId,
    skills: form.skills
      ? form.skills.split(",").map((s) => s.trim())
      : [],
  };

  try {
    const res = await applyJobApi(jobId, payload);

    if (res.success) {
      showToast("success", res.message || "Application Submitted Successfully!");

      setForm({
        fullName: "",
        phone: "",
        email: "",
        totalExperience: "",
        currentCtc: "",
        expectedCtc: "",
        currentOrganization: "",
        skills: "",
        resumeUrl: "",
        source: "Online",
        coverLetter: "",
      });
    }
  } catch (error) {
    showError(
      "Error",
      error?.response?.data?.message || error?.message || "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <div className="min-h-screen bg-base-200 py-10 px-4">
        <div className="max-w-3xl mx-auto card bg-base-100 shadow-xl">
          <div className="card-body">

            <div className="sm:flex justify-center items-center mx-auto">
                <img className="h-20 sm:h-10 sm:mr-3 w-auto mx-auto" src="https://images.jdmagicbox.com/comp/indore/y7/0731px731.x731.160707160502.g5y7/catalogue/technorizen-software-solutions-pvt-ltd-sapna-sangeeta-road-indore-internet-website-designers-hhlru1nigv.jpg" alt="" />
                <h2 className="text-2xl font-bold text-primary text-center">
              Apply for this Position
            </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 mt-6">

              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="input input-bordered w-full"
                required
                value={form.fullName}
                onChange={handleChange}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="input input-bordered w-full"
                  required
                  value={form.email}
                  onChange={handleChange}
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="input input-bordered w-full"
                  required
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <select
                name="totalExperience"
                className="select select-bordered w-full"
                value={form.totalExperience}
                onChange={handleChange}
              >
                <option value="">Select Total Experience</option>
                {experienceOptions.map((exp, index) => (
                  <option key={index} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="currentCtc"
                  placeholder="Current CTC"
                  className="input input-bordered w-full"
                  value={form.currentCtc}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="expectedCtc"
                  placeholder="Expected CTC"
                  className="input input-bordered w-full"
                  value={form.expectedCtc}
                  onChange={handleChange}
                />
              </div>

              <input
                type="text"
                name="currentOrganization"
                placeholder="Current Organization"
                className="input input-bordered w-full"
                value={form.currentOrganization}
                onChange={handleChange}
              />

              <input
                type="text"
                name="skills"
                placeholder="Skills (comma separated)"
                className="input input-bordered w-full"
                value={form.skills}
                onChange={handleChange}
              />

              <input
                type="url"
                name="resumeUrl"
                placeholder="Paste Resume Link"
                className="input input-bordered w-full"
                required
                value={form.resumeUrl}
                onChange={handleChange}
              />

              <select
                name="source"
                className="select select-bordered w-full"
                value={form.source}
                onChange={handleChange}
              >
                {sourceOptions.map((src, index) => (
                  <option key={index} value={src}>
                    {src}
                  </option>
                ))}
              </select>

              <textarea
                name="coverLetter"
                placeholder="Cover Letter"
                className="textarea textarea-bordered w-full"
                rows={4}
                value={form.coverLetter}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>

            </form>
          </div>
        </div>
      </div>

     
    </>
  );
};

export default ApplyJob;