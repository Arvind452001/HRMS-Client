import React from "react";
import { useFormContext } from "react-hook-form";
import { Briefcase } from "lucide-react";
import { useFormMode } from "../context/FormModeContext";

export default function ProfessionalStep() {
  const { register } = useFormContext();
  const { mode } = useFormMode();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        {mode === "create" && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Briefcase className="h-4.5 w-4.5" />
          </span>
        )}
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">
            Professional Details
          </h2>
          <p className="text-xs text-base-content/50 sm:text-sm">
            Role, department, and employment information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Department</span>
          </label>
          <input
            type="text"
            {...register("professional.department")}
            placeholder="e.g. Engineering"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Designation</span>
          </label>
          <input
            type="text"
            {...register("professional.designation")}
            placeholder="e.g. Software Engineer"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Employment Type</span>
          </label>
          <select
            {...register("professional.employmentType")}
            className="select select-bordered w-full"
          >
            <option value="">Select</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Contract">Contract</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Status</span>
          </label>
          <select
            {...register("professional.status")}
            className="select select-bordered w-full"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Resigned">Resigned</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Date of Joining</span>
          </label>
          <input
            type="date"
            {...register("professional.dateOfJoining")}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Week Off</span>
          </label>
          <select
            {...register("professional.weekOffPolicy")}
            className="select select-bordered w-full"
          >
            <option value="FIRST_THIRD">FIRST_THIRD</option>
            <option value="SECOND_FOURTH">SECOND_FOURTH</option>
          </select>
        </div>
      </div>
    </div>
  );
}
