import React from "react";

import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Users } from "lucide-react";

export default function EmployeeHeader({
  title = "Employee",
  subtitle = "Welcome back to HRMS",
}) {

  const navigate = useNavigate();

  return (
    <div className="w-full mb-4">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-3 min-w-0">

          {/* Icon */}
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-base-200 shadow-sm">
            <Users className="w-6 h-6 text-primary" />
          </div>

          {/* Text */}
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold truncate">
              {title}
            </h1>

            <p className="text-sm opacity-60 truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">

          {/* Filter Button */}
          <button className="btn btn-outline btn-sm btn-square">
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {/* Add Employee Button */}
          <button
  className="btn btn-primary btn-sm"
  onClick={() => navigate("/hr/employees/add")}
>
  Add Employee
</button>

        </div>
      </div>

    </div>
  );
}