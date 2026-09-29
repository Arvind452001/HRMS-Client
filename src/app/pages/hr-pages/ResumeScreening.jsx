import React, { useState } from "react";
import { analyzeResumeApi } from "../../../api/resumeScreeningApi";
import { showError, showSuccess } from "../../../utils/alert";
import Header from "../../../components/Header";

const ResumeScreening = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      showError("Validation Error", "Please upload a resume (PDF)");
      return;
    }
    if (!jobDescription.trim()) {
      showError("Validation Error", "Please provide a job description");
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await analyzeResumeApi(formData);
      if (res.success) {
        showSuccess("Success", "Resume analyzed successfully");
        setResult(res.data);
      }
    } catch (error) {
      showError("Analysis Failed", error.message || "Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">AI Resume Screening</h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload a candidate's resume and job description to get an AI-powered evaluation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Input Data</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Resume (PDF)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    rows={8}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:ring-4 focus:ring-sky-50 focus:border-sky-400 outline-none transition-all resize-none bg-slate-50"
                  />
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Resume"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full min-h-[500px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-sky-600 space-y-4">
                  <span className="w-10 h-10 border-4 border-sky-100 border-t-sky-600 rounded-full animate-spin" />
                  <p className="font-medium animate-pulse">AI is reading the resume...</p>
                </div>
              ) : result ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Analysis Result</h2>
                      <p className="text-sm text-slate-500 mt-1">Recommendation: <span className="font-semibold text-slate-700">{result.recommendation}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`text-4xl font-black ${getScoreColor(result.matchScore)}`}>
                          {result.matchScore}%
                        </div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Overall Match</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> Matched Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.matchedSkills?.length > 0 ? (
                          result.matchedSkills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-100">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400 italic">None identified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> Missing Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills?.length > 0 ? (
                          result.missingSkills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold border border-red-100">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-400 italic">None identified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">Experience Match ({result.experienceMatch?.score}%)</h3>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {result.experienceMatch?.summary}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">Education Match ({result.educationMatch?.score}%)</h3>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {result.educationMatch?.summary}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-3">Strengths</h3>
                      <ul className="space-y-2">
                        {result.strengths?.length > 0 ? result.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-slate-600 flex gap-2">
                            <span className="text-green-500">✓</span> {s}
                          </li>
                        )) : <li className="text-sm text-slate-400 italic">None listed</li>}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 mb-3">Gaps</h3>
                      <ul className="space-y-2">
                        {result.gaps?.length > 0 ? result.gaps.map((g, i) => (
                          <li key={i} className="text-sm text-slate-600 flex gap-2">
                            <span className="text-red-500">✗</span> {g}
                          </li>
                        )) : <li className="text-sm text-slate-400 italic">None listed</li>}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">AI Summary</h3>
                    <p className="text-sm text-slate-600 bg-sky-50 p-4 rounded-xl border border-sky-100 leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p>Upload a resume and click analyze to see results</p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ResumeScreening;
