import React, { useEffect, useState } from "react";
import { showWarning, showSuccess, showError } from "../../../utils/alert";
import { submitInterviewReviewApi } from "../../../api/interviewApi";
import BaseModal from "../../../components/BaseModal";

const InterviewReviewModal = ({
  interview = {},
  mode = "edit",
  onClose,
  onSuccess,
}) => {
  const isViewMode = mode === "view";

  const [rating, setRating] = useState(0);
  const [recommendation, setRecommendation] =
    useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] =
    useState(false);

  // SET INITIAL VALUES
  useEffect(() => {
    if (interview) {
      setRating(interview?.rating || 0);
      setRecommendation(
        interview?.recommendation || ""
      );
      setFeedback(interview?.feedback || "");
    }
  }, [interview]);

  // SUBMIT HANDLER
  const handleSubmit = async () => {
    if (isViewMode) return;

    if (
      !rating ||
      !recommendation ||
      !feedback.trim()
    ) {
      return showWarning("Missing Fields", "Please fill all fields");
    }

    try {
      setLoading(true);

      const payload = {
        rating,
        recommendation,
        feedback,
      };

      const response =
        await submitInterviewReviewApi(
          interview?._id,
          payload
        );

      await showSuccess(
        "Success",
        response?.message || "Review submitted successfully"
      );

      if (onSuccess) {
        onSuccess();
      }

      if (onClose) {
        onClose();
      }

    } catch (error) {

      showError(
        "Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  };

  // RECOMMENDATION OPTIONS
  const recommendationOptions = [
    {
      value: "strong_hire",
      label: "Strong Hire",
      activeClass:
        "border-green-500 bg-green-100 text-green-700",
    },
    {
      value: "hire",
      label: "Hire",
      activeClass:
        "border-sky-500 bg-sky-100 text-sky-700",
    },
    {
      value: "on_hold",
      label: "On Hold",
      activeClass:
        "border-yellow-500 bg-yellow-100 text-yellow-700",
    },
    {
      value: "reject",
      label: "Reject",
      activeClass:
        "border-red-500 bg-red-100 text-red-700",
    },
  ];

  return (
    <BaseModal
      title={isViewMode ? "Interview Review" : "Submit Review"}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm sm:btn-md"
          >
            Close
          </button>

          {!isViewMode && (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="btn btn-primary btn-sm sm:btn-md"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          )}
        </>
      }
    >
        <div className="space-y-4">

          {/* CANDIDATE INFO */}
          <div className="flex items-center gap-3 border border-slate-200 rounded-xl p-3 bg-slate-50">

            {/* AVATAR */}
            <div className="h-11 w-11 rounded-full bg-sky-600 flex items-center justify-center text-white font-semibold">
              {interview?.candidate?.fullName
                ?.charAt(0)
                ?.toUpperCase() || "C"}
            </div>

            {/* INFO */}
            <div className="flex-1 min-w-0">

              <h3 className="text-sm font-semibold text-slate-900 truncate">
                {interview?.candidate?.fullName ||
                  "Candidate"}
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                {interview?.roundType ||
                  "Technical"}{" "}
                •{" "}
                {interview?.scheduledDate
                  ? new Date(
                      interview?.scheduledDate
                    ).toLocaleDateString(
                      "en-IN"
                    )
                  : "N/A"}
              </p>

              <p
                className={`text-xs font-medium mt-1 ${
                  interview?.status ===
                  "completed"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {interview?.status ||
                  "Scheduled"}
              </p>

            </div>

          </div>

          {/* RATING */}
          <div>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rating
            </label>

            <div className="flex gap-1">

              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isViewMode}
                  onClick={() =>
                    setRating(star)
                  }
                  className={`text-3xl transition-all duration-200 ${
                    star <= rating
                      ? "text-yellow-400"
                      : "text-slate-300"
                  } ${
                    !isViewMode
                      ? "hover:scale-110 cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  ★
                </button>
              ))}

            </div>

            <p className="text-xs text-slate-500 mt-1">
              Selected Rating: {rating}/5
            </p>

          </div>

          {/* RECOMMENDATION */}
          <div>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Recommendation
            </label>

            <div className="flex flex-wrap gap-2">

              {recommendationOptions.map(
                (item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={isViewMode}
                    onClick={() =>
                      setRecommendation(
                        item.value
                      )
                    }
                    className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-200 ${
                      recommendation ===
                      item.value
                        ? item.activeClass
                        : "border-slate-300 bg-white text-slate-700"
                    } ${
                      !isViewMode
                        ? "hover:shadow-sm cursor-pointer"
                        : "cursor-default"
                    }`}
                  >
                    {item.label}
                  </button>
                )
              )}

            </div>

          </div>

          {/* FEEDBACK */}
          <div>

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Feedback
            </label>

            <textarea
              rows={4}
              disabled={isViewMode}
              value={feedback}
              onChange={(e) =>
                setFeedback(
                  e.target.value
                )
              }
              placeholder="Write interview feedback..."
              className={`w-full rounded-xl border p-3 text-sm resize-none outline-none transition ${
                isViewMode
                  ? "bg-slate-100 border-slate-200 cursor-not-allowed"
                  : "border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              }`}
            />

          </div>

        </div>
    </BaseModal>
  );
};

export default InterviewReviewModal;