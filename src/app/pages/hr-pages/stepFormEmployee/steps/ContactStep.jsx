import React from "react";
import { useFormContext } from "react-hook-form";
import { Phone, ShieldAlert } from "lucide-react";
import { useFormMode } from "../context/FormModeContext";

export default function ContactStep() {
  const { register } = useFormContext();
  const { mode } = useFormMode();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        {mode === "create" && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Phone className="h-4.5 w-4.5" />
          </span>
        )}
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Contact Information</h2>
          <p className="text-xs text-base-content/50 sm:text-sm">
            How to reach the employee
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Primary Phone</span>
          </label>
          <input
            type="tel"
            {...register("contact.primaryPhone")}
            placeholder="+91 98765 43210"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Alternate Phone</span>
          </label>
          <input
            type="tel"
            {...register("contact.alternatePhone")}
            placeholder="+91 98765 43210"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control sm:col-span-2">
          <label className="label">
            <span className="label-text">Personal Email</span>
          </label>
          <input
            type="email"
            {...register("contact.personalEmail")}
            placeholder="you@example.com"
            className="input input-bordered w-full"
          />
        </div>
      </div>

      <div className="rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-base-content sm:text-base">
            Emergency Contact
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              {...register("contact.emergencyContact.name")}
              placeholder="Contact name"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Relation</span>
            </label>
            <input
              type="text"
              {...register("contact.emergencyContact.relation")}
              placeholder="e.g. Father, Spouse"
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Phone</span>
            </label>
            <input
              type="tel"
              {...register("contact.emergencyContact.phone")}
              placeholder="+91 98765 43210"
              className="input input-bordered w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
