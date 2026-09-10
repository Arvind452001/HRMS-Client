import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobBySlug } from "../api/jobApi";

const normalizeListField = (field) => {
  if (!field || field.length === 0) return [];
  return field
    .join(", ")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};

const PublicJobDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await getJobBySlug(slug);
        if (res.success && res.data) {
          setJob(res.data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 text-center px-4">
        <div className="card bg-base-100 shadow-xl p-6 sm:p-8 max-w-sm w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-error">
            No Job Found
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            The job you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary mt-4 w-full sm:w-auto self-center"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const responsibilities = normalizeListField(job.responsibilities);
  const requiredSkills = normalizeListField(job.requiredSkills);
  const goodToHaveSkills = normalizeListField(job.goodToHaveSkills);
  const benefits = normalizeListField(job.benefits);

  return (
    <div className="min-h-screen bg-base-200 py-6 sm:py-10 px-3 sm:px-4 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <div className="card bg-base-100 shadow-xl overflow-hidden">
          <div className="card-body flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 p-5 sm:p-6">
            <img
              src="/logo.jpg"
              alt={job.companyName}
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-primary wrap-break-word">
                {job.title}
              </h1>
              <p className="text-base sm:text-lg text-gray-500 mt-1 wrap-break-word">
                {job.companyName} • {job.location}
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                {job.department && (
                  <span className="badge badge-primary badge-outline sm:badge-md">
                    {job.department}
                  </span>
                )}
                {job.employmentType && (
                  <span className="badge badge-secondary badge-outline sm:badge-md">
                    {job.employmentType}
                  </span>
                )}
                {job.workplaceType && (
                  <span className="badge badge-accent badge-outline sm:badge-md">
                    {job.workplaceType}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => navigate(`/apply/${job.slug}`)}
              className="btn btn-primary hidden sm:inline-flex shrink-0"
            >
              Apply Now
            </button>
          </div>
        </div>

        {job.overview && (
          <div className="card bg-base-100 shadow-md">
            <div className="card-body p-5 sm:p-6">
              <h2 className="card-title text-primary text-lg sm:text-xl">
                Job Overview
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {job.overview}
              </p>
            </div>
          </div>
        )}

        {responsibilities.length > 0 && (
          <div className="card bg-base-100 shadow-md">
            <div className="card-body p-5 sm:p-6">
              <h2 className="card-title text-primary text-lg sm:text-xl">
                Responsibilities
              </h2>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base text-gray-600">
                {responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {(requiredSkills.length > 0 || goodToHaveSkills.length > 0) && (
          <div className="card bg-base-100 shadow-md">
            <div className="card-body p-5 sm:p-6">
              {requiredSkills.length > 0 && (
                <>
                  <h2 className="card-title text-primary text-lg sm:text-xl">
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {requiredSkills.map((skill, index) => (
                      <span key={index} className="badge badge-outline">
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {goodToHaveSkills.length > 0 && (
                <>
                  <h2 className="card-title text-secondary text-lg sm:text-xl mt-4">
                    Good To Have
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {goodToHaveSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="badge badge-outline badge-secondary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="card bg-base-100 shadow-md">
          <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 sm:p-6">
            <div>
              <h3 className="font-semibold text-primary text-sm sm:text-base">
                Experience
              </h3>
              <p className="text-sm sm:text-base mt-1">
                {job.experienceMin} - {job.experienceMax} Years
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary text-sm sm:text-base">
                Salary
              </h3>
              <p className="text-sm sm:text-base mt-1">
                ₹{job.salaryMin?.toLocaleString()} - ₹
                {job.salaryMax?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {benefits.length > 0 && (
          <div className="card bg-base-100 shadow-md">
            <div className="card-body p-5 sm:p-6">
              <h2 className="card-title text-primary text-lg sm:text-xl">
                Benefits
              </h2>
              <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base text-gray-600">
                {benefits.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="text-center pt-4 sm:pt-6 pb-4 sm:pb-0">
          <button
            onClick={() => navigate(`/apply/${job.slug}`)}
            className="btn btn-primary btn-lg w-full sm:w-auto sm:px-10"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicJobDetails;
