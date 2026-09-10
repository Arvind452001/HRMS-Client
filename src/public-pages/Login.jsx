import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  ShieldCheck,
  CalendarCheck2,
  ArrowRight,
} from "lucide-react";
import { loginApi } from "../api/auth-Api";
import { getSystemStatusApi } from "../api/adminPanelApi";
import axiosInstance from "../utils/axiosInstance";
import { getLandingRoute } from "../utils/roleAccess";
import { showToast, showWarning, showError, showSuccess } from "../utils/alert";
import Loader from "../components/Loader";
import logo from "../assets/logo-2.png";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const isLoading = loading || forgotLoading;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: "" });
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  // 🔹 LOGIN

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous validation errors
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await loginApi(formData);
      // Store user data
      localStorage.setItem("technoToken", res.accessToken);
      localStorage.setItem("technoUser", JSON.stringify(res.user));

      // Success Alert
      await showToast(
        "success",
        `Welcome ${res.user?.name?.split(" ")[0] || "back"}!`,
      );

      // If maintenance mode is on, only Admin should actually land in the
      // app — everyone else goes straight to the maintenance screen instead
      // of briefly seeing their dashboard before getting bounced out of it.
      const isAdmin = res.user?.roles?.includes("admin");
      if (!isAdmin) {
        try {
          const status = await getSystemStatusApi();
          if (status?.data?.maintenanceMode?.enabled) {
            navigate("/maintenance");
            return;
          }
        } catch {
          // If the status check itself fails, fall through to the normal
          // landing route rather than blocking login entirely.
        }
      }

      // Redirect based on roles
      navigate(getLandingRoute(res.user?.roles));
    } catch (err) {
      const status = err?.message;
      const message = err?.message || "Something went wrong. Please try again.";

      if (status === 401) {
        showWarning("Invalid Credentials", message);
      } else {
        showError("Login Failed", message);
      }
    } finally {
      setLoading(false);
    }
  };
  // 🔹 FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: "Enter your email first to reset password" });
      return;
    }

    try {
      setForgotLoading(true);

      await axiosInstance.post("/auth/forgot-password", {
        email: formData.email,
      });

      setErrors({ form: "" });
      showSuccess(
        "Check Your Email",
        "A password reset link has been sent to your email.",
      );
    } catch (err) {
      setErrors({
        form: err.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-200 px-4 py-8">
      {isLoading && (
        <div className="fixed inset-0 flex justify-center items-center bg-white/60 backdrop-blur-sm z-50">
          <Loader />
        </div>
      )}

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-base-100 rounded-3xl shadow-2xl shadow-sky-900/10 overflow-hidden border border-base-300">
        {/* LEFT — BRAND PANEL */}
        <div className="relative hidden md:flex flex-col justify-between bg-sky-50 text-sky-900 p-10 border-r border-sky-100">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-sky-100/70" />
          <div className="absolute bottom-16 -left-10 h-32 w-32 rounded-full bg-sky-100/60" />

          <div className="relative z-10">
            <img
              src={logo}
              alt="TechnoAarv HRMS"
              className="h-22 w-auto object-contain rounded-lg px-2.5 py-1 "
            />
          </div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-bold leading-tight text-sky-900">
              Manage your entire workforce, <br /> in one clean workspace.
            </h2>
            <p className="text-sky-700 text-sm max-w-sm">
              Attendance, leave, payroll and recruitment — a single HRMS built
              for HR teams and employees alike.
            </p>

            <div className="space-y-4 pt-2">
              <FeatureRow
                icon={Users}
                text="Unified employee & HR dashboards"
              />
              <FeatureRow
                icon={CalendarCheck2}
                text="Leave, attendance & payroll tracking"
              />
              <FeatureRow
                icon={ShieldCheck}
                text="Secure, role-based access control"
              />
            </div>
          </div>

          <p className="relative z-10 text-xs text-sky-600">
            © {new Date().getFullYear()} Technorizen · All rights are reserved.
          </p>
        </div>

        {/* RIGHT — FORM PANEL */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <div className="md:hidden mb-6 flex justify-center">
            <img
              src={logo}
              alt="TechnoAarv HRMS"
              className="h-16 w-auto object-contain rounded-lg  px-2.5 py-1 "
            />
          </div>

          <h1 className="text-2xl font-bold text-base-content">
            Welcome back 👋
          </h1>
          <p className="text-sm text-base-content/60 mt-1 mb-8">
            Sign in to continue to your HRMS dashboard
          </p>

          {errors.form && (
            <div className="mb-4 text-sm rounded-lg bg-red-50 text-red-600 border border-red-100 px-3 py-2">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-base-content/70 mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input input-bordered w-full pl-10 bg-base-100 ${
                    errors.email ? "input-error" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-base-content/70 mb-1 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input input-bordered w-full pl-10 pr-10 bg-base-100 ${
                    errors.password ? "input-error" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-error mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-medium text-primary hover:text-[#075985] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full mt-2 group"
            >
              Log In
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </form>

          <p className="text-xs text-center text-base-content/50 mt-8">
            Having trouble signing in? Contact your HR administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

function FeatureRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <span className="text-sm text-sky-800">{text}</span>
    </div>
  );
}

export default Login;
