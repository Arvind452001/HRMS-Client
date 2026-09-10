import React from "react";
import { useFormContext } from "react-hook-form";
import { IdCard } from "lucide-react";
import { useFormMode } from "../context/FormModeContext";

export default function IdentificationStep() {
  const { register } = useFormContext();
  const { mode } = useFormMode();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        {mode === "create" && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IdCard className="h-4.5 w-4.5" />
          </span>
        )}
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">
            Employee Identification
          </h2>
          <p className="text-xs text-base-content/50 sm:text-sm">
            Government and statutory identification numbers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Aadhaar No.</span>
          </label>
          <input
            type="text"
            {...register("identification.aadhaarNo")}
            className="input input-bordered w-full"
            placeholder="XXXX XXXX XXXX"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">PAN</span>
          </label>
          <input
            type="text"
            {...register("identification.pan")}
            className="input input-bordered w-full"
            placeholder="ABCDE1234F"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">ESIC</span>
          </label>
          <input
            type="text"
            {...register("identification.esic")}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">UAN</span>
          </label>
          <input
            type="text"
            {...register("identification.uan")}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control sm:col-span-2">
          <label className="label">
            <span className="label-text">ID No.</span>
          </label>
          <input
            type="text"
            {...register("identification.idNo")}
            className="input input-bordered w-full"
          />
        </div>
      </div>
    </div>
  );
}
