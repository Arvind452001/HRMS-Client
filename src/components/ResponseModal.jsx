import React, { useEffect } from "react";

export default function ResponseModal({
  isOpen,
  onClose,
  type = "success",
  message = "",
  duration = 1000,
}) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-3">
      <div
        className={`w-full max-w-sm rounded-xl p-6 text-center shadow-lg
        ${
          isSuccess
            ? "bg-green-50 border border-green-400"
            : "bg-red-50 border border-red-400"
        }`}
      >
        {/* Icon */}
        <div
          className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-white text-xl font-bold
          ${isSuccess ? "bg-green-500" : "bg-red-500"}`}
        >
          {isSuccess ? "✓" : "✕"}
        </div>

        {/* Title */}
        <h3
          className={`text-lg font-semibold
          ${isSuccess ? "text-green-700" : "text-red-700"}`}
        >
          {isSuccess ? "Success" : "Failed"}
        </h3>

        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}
