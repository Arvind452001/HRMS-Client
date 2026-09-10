import { Users } from "lucide-react";

export default function JobHeader({
  title = "Job Post",
  subtitle = "Manage all job openings",
  onCreate,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Icon + Text */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Icon */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-white">
          <Users className="h-5 w-5 text-sky-600" />
        </div>

        {/* Text */}
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-gray-900 sm:text-lg md:text-xl">
            {title}
          </h1>
          <p className="truncate text-xs text-gray-500 sm:text-sm">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Create Button */}
        <button
          onClick={onCreate}
          className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 transition"
        >
          + Create New Job
        </button>
      </div>
    </div>
  );
}
