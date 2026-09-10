import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { useFormMode } from "../context/FormModeContext";

function PasswordInput({ register, name, placeholder }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        {...register(name)}
        placeholder={placeholder}
        className="input input-bordered w-full pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-base-content/40 hover:text-base-content/70"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default function AccountStep() {
  const { register } = useFormContext();
  const { mode } = useFormMode();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        {mode === "create" && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-4.5 w-4.5" />
          </span>
        )}
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Login Details</h2>
          <p className="text-xs text-base-content/50 sm:text-sm">
            Official email, Teams and dashboard login credentials
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Row 1 - Official Company Email & Password */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Official Email</span>
          </label>
          <input
            type="email"
            {...register("account.officialEmail")}
            placeholder="name@company.com"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Official Password</span>
          </label>
          <PasswordInput
            register={register}
            name="account.officialPassword"
            placeholder="Enter official email password"
          />
        </div>

        {/* Row 2 - Teams ID & Password */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Teams ID</span>
          </label>
          <input
            type="text"
            {...register("account.teamsId")}
            placeholder="name@company.com"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Teams Password</span>
          </label>
          <PasswordInput
            register={register}
            name="account.teamsPassword"
            placeholder="Enter Teams password"
          />
        </div>

        {/* Row 3 - Login Password (for Employee Dashboard) */}
        <div className="form-control sm:col-span-2">
          <label className="label">
            <span className="label-text">Login Password</span>
            <span className="label-text-alt text-base-content/40 pl-2">
              Used to log in to the Employee Dashboard
            </span>
          </label>
          <PasswordInput
            register={register}
            name="account.loginPassword"
            placeholder="Enter login password"
          />
        </div>
      </div>
    </div>
  );
}
