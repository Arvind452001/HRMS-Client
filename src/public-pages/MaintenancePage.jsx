import { useEffect, useState } from "react";
import { Wrench, RefreshCw, Sparkles, Clock } from "lucide-react";
import { getSystemStatusApi } from "../api/adminPanelApi";

export default function MaintenancePage() {
  const [message, setMessage] = useState(
    "System is under maintenance. Please check back shortly.",
  );
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  const checkStatus = async () => {
    try {
      setChecking(true);
      const res = await getSystemStatusApi();
      const maintenance = res?.data?.maintenanceMode;

      if (maintenance?.message) setMessage(maintenance.message);
      setLastChecked(new Date());

      // Maintenance has been lifted — send the user back into the app.
      if (!maintenance?.enabled) {
        window.location.href = "/";
      }
    } catch {
      // If even the status check fails, just stay on this screen.
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 20000);
    return () => clearInterval(interval);
     
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center px-4">
      {/* Decorative floating blobs */}
      <div className="absolute -top-24 -left-24 h-72 w-72 bg-sky-200/50 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-24 -right-24 h-80 w-80 bg-indigo-200/50 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/3 right-10 h-40 w-40 bg-purple-200/40 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      {/* Floating sparkle accents */}
      <Sparkles
        className="absolute top-16 left-16 text-sky-300 animate-bounce"
        size={20}
      />
      <Sparkles
        className="absolute bottom-20 right-24 text-indigo-300 animate-bounce"
        size={16}
        style={{ animationDelay: "0.5s" }}
      />

      <div className="relative max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 text-center">
        {/* Animated icon with glow ring */}
        <div className="relative mx-auto mb-6 h-20 w-20">
          <div className="absolute inset-0 rounded-full bg-sky-400/30 blur-xl animate-pulse" />
          <div className="relative h-20 w-20 rounded-full bg-linear-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-300">
            <Wrench
              size={32}
              className="animate-[wiggle_2s_ease-in-out_infinite]"
            />
          </div>
        </div>

        <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 tracking-wide uppercase">
          Under Maintenance
        </span>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          We'll be right back ✨
        </h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>

        {/* Progress shimmer bar */}
        <div className="h-1.5 w-full bg-sky-100 rounded-full overflow-hidden mb-6">
          <div className="h-full w-1/3 bg-linear-to-r from-sky-400 via-indigo-500 to-sky-400 rounded-full animate-[shimmer_1.8s_ease-in-out_infinite]" />
        </div>

        <button
          onClick={checkStatus}
          disabled={checking}
          className="btn w-full bg-linear-to-r from-sky-600 to-indigo-600 border-0 text-white hover:brightness-110 rounded-xl shadow-md shadow-sky-200 transition-transform active:scale-95"
        >
          <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
          {checking ? "Checking..." : "Check again"}
        </button>

        <p className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          Last checked {lastChecked.toLocaleTimeString()} · auto-refreshing
          every 20s
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
      `}</style>
    </div>
  );
}
