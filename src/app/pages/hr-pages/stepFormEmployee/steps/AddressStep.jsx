import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { MapPin, Home, MapPinned } from "lucide-react";
import { useFormMode } from "../context/FormModeContext";

export default function AddressStep() {
  const { register, setValue, control } = useFormContext();
  const { mode } = useFormMode();

  // Watch the "same as current" checkbox and current address fields
  const sameAsCurrent = useWatch({ name: "address.sameAsCurrent", control });
  const currentAddress = useWatch({ name: "address.current", control });

  useEffect(() => {
    if (sameAsCurrent) {
      // Copy all current address fields to permanent
      setValue("address.permanent.address", currentAddress.address || "");
      setValue("address.permanent.city", currentAddress.city || "");
      setValue("address.permanent.state", currentAddress.state || "");
      setValue("address.permanent.country", currentAddress.country || "");
      setValue("address.permanent.pincode", currentAddress.pincode || "");
    }
  }, [sameAsCurrent, currentAddress, setValue]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        {mode === "create" && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="h-4.5 w-4.5" />
          </span>
        )}
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Address Information</h2>
          <p className="text-xs text-base-content/50 sm:text-sm">
            Current and permanent residential address
          </p>
        </div>
      </div>

      {/* Current Address */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Home className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-base-content sm:text-base">
            Current Address
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-control sm:col-span-2">
            <label className="label">
              <span className="label-text">Address</span>
            </label>
            <input
              type="text"
              {...register("address.current.address")}
              placeholder="House no., street, area"
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">City</span>
            </label>
            <input
              type="text"
              {...register("address.current.city")}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">State</span>
            </label>
            <input
              type="text"
              {...register("address.current.state")}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Country</span>
            </label>
            <input
              type="text"
              {...register("address.current.country")}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Pincode</span>
            </label>
            <input
              type="text"
              {...register("address.current.pincode")}
              className="input input-bordered w-full"
            />
          </div>
        </div>
      </div>

      {/* Same as current checkbox */}
      <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded-lg border border-base-300 bg-base-100 px-4 py-2.5">
        <input
          type="checkbox"
          {...register("address.sameAsCurrent")}
          className="checkbox checkbox-primary checkbox-sm"
        />
        <span className="text-sm text-base-content">
          Permanent address same as current address
        </span>
      </label>

      {/* Permanent Address */}
      <div className="rounded-xl border border-base-300 bg-base-100 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPinned className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-base-content sm:text-base">
            Permanent Address
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-control sm:col-span-2">
            <label className="label">
              <span className="label-text">Address</span>
            </label>
            <input
              type="text"
              {...register("address.permanent.address")}
              placeholder="House no., street, area"
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">City</span>
            </label>
            <input
              type="text"
              {...register("address.permanent.city")}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">State</span>
            </label>
            <input
              type="text"
              {...register("address.permanent.state")}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Country</span>
            </label>
            <input
              type="text"
              {...register("address.permanent.country")}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Pincode</span>
            </label>
            <input
              type="text"
              {...register("address.permanent.pincode")}
              className="input input-bordered w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
