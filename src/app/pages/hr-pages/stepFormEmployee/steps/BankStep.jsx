import React from "react";
import { useFormContext } from "react-hook-form";
import { Landmark } from "lucide-react";
import { useFormMode } from "../context/FormModeContext";

export default function BankStep() {
  const { register } = useFormContext();
  const { mode } = useFormMode();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        {mode === "create" && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Landmark className="h-4.5 w-4.5" />
          </span>
        )}
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Bank Details</h2>
          <p className="text-xs text-base-content/50 sm:text-sm">
            Account details used for salary disbursement
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-control sm:col-span-2">
          <label className="label">
            <span className="label-text">Account Holder Name</span>
          </label>
          <input
            type="text"
            {...register("bank.accountHolderName")}
            className="input input-bordered w-full"
            placeholder="Enter account holder name"
          />
        </div>

        <div className="form-control sm:col-span-2">
          <label className="label">
            <span className="label-text">Bank Name</span>
          </label>
          <input
            type="text"
            {...register("bank.bankName")}
            placeholder="e.g. State Bank of India"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Account Number</span>
          </label>
          <input
            type="text"
            {...register("bank.accountNumber")}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">IFSC Code</span>
          </label>
          <input
            type="text"
            {...register("bank.ifscCode")}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control sm:col-span-2">
          <label className="label">
            <span className="label-text">Branch</span>
          </label>
          <input
            type="text"
            {...register("bank.branch")}
            className="input input-bordered w-full"
          />
        </div>
      </div>
    </div>
  );
}
