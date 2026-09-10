import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import Loader from "../components/Loader";
import { showWarning, showSuccess, showError } from "../utils/alert";

export default function ResetPassword() {
  const { token } = useParams();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
const [loading, setLoading] = useState(false);

const navigate= useNavigate()

const handleSubmit = async () => {
  if (form.password !== form.confirmPassword) {
    return showWarning("Passwords do not match", "Please make sure both passwords are the same.");
  }

  try {
    setLoading(true);

    await axiosInstance.post(`/auth/reset-password/${token}`, {
      newPassword: form.password,
    });

    await showSuccess("Password Updated", "Your password has been updated successfully.");
    navigate("/login");

  } catch (err) {
    const message =
      err.response?.data?.message || "Failed to reset password. Please try again.";

    showError("Reset Failed", message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200 px-4">
      <div className="card bg-base-100 shadow-xl border border-base-300 p-8 w-full max-w-sm rounded-2xl">
        <h2 className="text-xl font-bold mb-1 text-center text-base-content">
          Reset Password 🔐
        </h2>
        <p className="text-xs text-center text-base-content/60 mb-6">
          Choose a new password for your account
        </p>

        <label className="text-xs font-medium text-base-content/70 mb-1 block">
          New Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className="input input-bordered w-full mb-3 bg-base-100"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <label className="text-xs font-medium text-base-content/70 mb-1 block">
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          className="input input-bordered w-full mb-5 bg-base-100"
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        <button
          className="btn btn-primary w-full flex justify-center items-center"
          onClick={handleSubmit}
          disabled={loading}
        >
          Submit
        </button>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex justify-center items-center z-50">
          <Loader />
        </div>
      )}
    </div>
  );
}
