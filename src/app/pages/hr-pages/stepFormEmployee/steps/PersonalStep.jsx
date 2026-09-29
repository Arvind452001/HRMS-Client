import React, { useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { User, ImagePlus, AlertCircle } from "lucide-react";
import { useFormMode } from "../context/FormModeContext";
import { MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES } from "../formConstants";

export default function PersonalStep() {
  const {
    register,
    control,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const { isView, mode } = useFormMode();
  const photoInputRef = useRef(null);

  const profilePhoto = useWatch({ name: "personal.profilePhoto", control });
  const existingPhotoUrl =
    typeof profilePhoto === "string" && profilePhoto ? profilePhoto : null;

  const photoError = errors?.personal?.profilePhoto;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const selectedSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const errorMsg = `Profile photo size (${selectedSizeMB} MB) exceeds ${MAX_FILE_SIZE_MB} MB limit. Please select a smaller image.`;

      setError("personal.profilePhoto", {
        type: "manual",
        message: errorMsg,
      });

      e.target.value = "";
      setValue("personal.profilePhoto", null, { shouldValidate: true });
      return;
    }

    clearErrors("personal.profilePhoto");
    setValue("personal.profilePhoto", e.target.files, { shouldValidate: true });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        {mode === "create" && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="h-4.5 w-4.5" />
          </span>
        )}
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">
            Personal Information
          </h2>
          <p className="text-xs text-base-content/50 sm:text-sm">
            Basic personal details of the employee
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Full Name*</span>
          </label>
          <input
            type="text"
            {...register("personal.fullName", {
              required: "Full name is required",
            })}
            placeholder="Enter full name"
            className="input input-bordered w-full"
          />
          {errors.personal?.fullName && (
            <span className="text-error text-sm mt-1">
              {errors.personal.fullName.message}
            </span>
          )}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Father's Name</span>
          </label>
          <input
            type="text"
            {...register("personal.fatherName")}
            placeholder="Enter father's name"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Mother's Name</span>
          </label>
          <input
            type="text"
            {...register("personal.motherName")}
            placeholder="Enter mother's name"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Gender</span>
          </label>
          <select
            {...register("personal.gender")}
            className="select select-bordered w-full"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Marital Status</span>
          </label>
          <select
            {...register("personal.maritalStatus")}
            className="select select-bordered w-full"
          >
            <option value="">Select</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Date of Birth</span>
          </label>
          <input
            type="date"
            {...register("personal.dob")}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Nationality</span>
          </label>
          <input
            type="text"
            {...register("personal.nationality")}
            placeholder="e.g. Indian"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Blood Group</span>
          </label>
          <input
            type="text"
            {...register("personal.bloodGroup")}
            placeholder="e.g. O+"
            className="input input-bordered w-full"
          />
        </div>
      </div>

      {/* File input for profile photo */}
      <div className="form-control w-full">
        <label className="label pb-1">
          <span className="label-text flex items-center gap-1.5 font-medium">
            <ImagePlus className="h-3.5 w-3.5" />
            Profile Photo
          </span>
          <span className="text-[11px] text-base-content/50">
            Max: {MAX_FILE_SIZE_MB} MB (JPG, PNG)
          </span>
        </label>

        {existingPhotoUrl && (
          <div className="mb-2 flex items-center gap-3">
            <div className="avatar">
              <div className="w-14 rounded-full ring ring-base-300 ring-offset-2">
                <img src={existingPhotoUrl} alt="Current profile" />
              </div>
            </div>
            <span className="text-xs text-base-content/50">
              Current photo
            </span>
          </div>
        )}

        {!isView && (
          <>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              name="personal[profilePhoto]"
              onChange={handlePhotoChange}
              className={`file-input file-input-bordered w-full ${
                photoError ? "file-input-error" : ""
              }`}
            />
            {photoError && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-error">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{photoError.message}</span>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

