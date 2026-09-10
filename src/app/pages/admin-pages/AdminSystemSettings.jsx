import { useEffect, useState } from "react";
import {
  Building2,
  Clock,
  CalendarDays,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import Loader from "../../../components/Loader";
import {
  getSystemSettingsApi,
  updateSystemSettingsApi,
} from "../../../api/adminPanelApi";
import { showSuccess, showError, showConfirm } from "../../../utils/alert";

const Section = ({
  icon: Icon,
  title,
  tint = "bg-sky-100 text-sky-600",
  children,
}) => (
  <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
    <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2.5">
      <span
        className={`h-9 w-9 rounded-xl flex items-center justify-center ${tint}`}
      >
        <Icon size={17} />
      </span>
      {title}
    </h2>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="text-sm font-medium text-gray-600 mb-1 block">
      {label}
    </label>
    {children}
  </div>
);

// Toggle switch — used only for Maintenance Mode, since flipping it has a
// real, immediate, system-wide effect and deserves more than a checkbox.
const Toggle = ({ checked, onChange, danger = false, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-7 w-13 shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-50
      ${checked ? (danger ? "bg-red-500" : "bg-sky-600") : "bg-gray-300"}`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300
        ${checked ? "translate-x-7" : "translate-x-1"}`}
    />
  </button>
);

export default function AdminSystemSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSystemSettingsApi();
      setSettings(res?.data || null);
    } catch (err) {
      showError("Error", err?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const update = (path, value) => {
    setSettings((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let cursor = next;
      for (let i = 0; i < keys.length - 1; i++) cursor = cursor[keys[i]];
      cursor[keys[keys.length - 1]] = value;
      return next;
    });
  };

  // Confirm, then save THIS ONE FIELD to the server immediately — the
  // toggle is not "pending until you hit Save Changes" like the rest of
  // the form. Flipping it has a real, system-wide effect the moment you
  // confirm, so it has to actually reach the backend right then.
  const handleMaintenanceToggle = async (nextValue) => {
    const confirmed = await showConfirm({
      title: nextValue
        ? "Enable maintenance mode?"
        : "Disable maintenance mode?",
      text: nextValue
        ? "This will immediately block every non-admin user from using the system until you turn it back off."
        : "Employees and HR will regain access to the system immediately.",
      confirmButtonText: nextValue ? "Yes, enable it" : "Yes, disable it",
      danger: nextValue,
    });

    if (!confirmed) return;

    try {
      setTogglingMaintenance(true);
      const res = await updateSystemSettingsApi({
        maintenanceMode: {
          enabled: nextValue,
          message: settings.maintenanceMode?.message || "",
        },
      });
      setSettings(res?.data);
      showSuccess(
        "Done",
        nextValue
          ? "Maintenance mode is now ON"
          : "Maintenance mode is now OFF",
      );
    } catch (err) {
      showError("Error", err?.message || "Failed to update maintenance mode");
    } finally {
      setTogglingMaintenance(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateSystemSettingsApi(settings);
      showSuccess("Saved", res?.message || "Settings updated successfully");
      setSettings(res?.data);
    } catch (err) {
      showError("Error", err?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="p-16 flex justify-center">
        <Loader />
      </div>
    );
  }

  const maintenanceOn = !!settings.maintenanceMode?.enabled;

  return (
    <form onSubmit={handleSave} className="w-full min-h-screen space-y-5">
      <div className="bg-white/80 backdrop-blur-xl border border-sky-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-sky-600 text-2xl font-bold">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Company-wide configuration. Changes here affect the entire
            organization.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn bg-sky-600 border-0 text-white hover:bg-sky-700 rounded-xl"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Section
          icon={Building2}
          title="Company Information"
          tint="bg-sky-100 text-sky-600"
        >
          <Field label="Company Name">
            <input
              className="input input-bordered w-full rounded-xl"
              value={settings.companyName || ""}
              onChange={(e) => update("companyName", e.target.value)}
            />
          </Field>
          <Field label="Company Email">
            <input
              type="email"
              className="input input-bordered w-full rounded-xl"
              value={settings.companyEmail || ""}
              onChange={(e) => update("companyEmail", e.target.value)}
            />
          </Field>
          <Field label="Company Phone">
            <input
              className="input input-bordered w-full rounded-xl"
              value={settings.companyPhone || ""}
              onChange={(e) => update("companyPhone", e.target.value)}
            />
          </Field>
          <Field label="Company Address">
            <textarea
              className="textarea textarea-bordered w-full rounded-xl"
              value={settings.companyAddress || ""}
              onChange={(e) => update("companyAddress", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Timezone">
              <input
                className="input input-bordered w-full rounded-xl"
                value="Asia/Kolkata (IST)"
                disabled
              />
            </Field>
            <Field label="Currency">
              <input
                className="input input-bordered w-full rounded-xl"
                value={settings.currency || ""}
                onChange={(e) => update("currency", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section
          icon={Clock}
          title="Working Hours"
          tint="bg-indigo-100 text-indigo-600"
        >
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Time">
              <input
                type="time"
                className="input input-bordered w-full rounded-xl"
                value={settings.workingHours?.startTime || ""}
                onChange={(e) =>
                  update("workingHours.startTime", e.target.value)
                }
              />
            </Field>
            <Field label="End Time">
              <input
                type="time"
                className="input input-bordered w-full rounded-xl"
                value={settings.workingHours?.endTime || ""}
                onChange={(e) => update("workingHours.endTime", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Grace Period (minutes)">
            <input
              type="number"
              min={0}
              className="input input-bordered w-full rounded-xl"
              value={settings.workingHours?.graceMinutes ?? 0}
              onChange={(e) =>
                update("workingHours.graceMinutes", Number(e.target.value))
              }
            />
          </Field>
        </Section>

        <Section
          icon={CalendarDays}
          title="Leave Policy Defaults"
          tint="bg-emerald-100 text-emerald-600"
        >
          <div className="grid grid-cols-3 gap-3">
            <Field label="Annual">
              <input
                type="number"
                min={0}
                className="input input-bordered w-full rounded-xl"
                value={settings.leavePolicy?.annualLeaveDays ?? 0}
                onChange={(e) =>
                  update("leavePolicy.annualLeaveDays", Number(e.target.value))
                }
              />
            </Field>
            <Field label="Sick">
              <input
                type="number"
                min={0}
                className="input input-bordered w-full rounded-xl"
                value={settings.leavePolicy?.sickLeaveDays ?? 0}
                onChange={(e) =>
                  update("leavePolicy.sickLeaveDays", Number(e.target.value))
                }
              />
            </Field>
            <Field label="Casual">
              <input
                type="number"
                min={0}
                className="input input-bordered w-full rounded-xl"
                value={settings.leavePolicy?.casualLeaveDays ?? 0}
                onChange={(e) =>
                  update("leavePolicy.casualLeaveDays", Number(e.target.value))
                }
              />
            </Field>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-gray-600">
              Allow leave carry-forward to next year
            </span>
            <Toggle
              checked={!!settings.leavePolicy?.carryForwardAllowed}
              onChange={(val) => update("leavePolicy.carryForwardAllowed", val)}
            />
          </div>
        </Section>

        <Section
          icon={ShieldAlert}
          title="Security"
          tint="bg-purple-100 text-purple-600"
        >
          <Field label="Minimum Password Length">
            <input
              type="number"
              min={4}
              className="input input-bordered w-full rounded-xl"
              value={settings.security?.passwordMinLength ?? 6}
              onChange={(e) =>
                update("security.passwordMinLength", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Max Login Attempts">
            <input
              type="number"
              min={1}
              className="input input-bordered w-full rounded-xl"
              value={settings.security?.maxLoginAttempts ?? 5}
              onChange={(e) =>
                update("security.maxLoginAttempts", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Session Expiry (days)">
            <input
              type="number"
              min={1}
              className="input input-bordered w-full rounded-xl"
              value={settings.security?.sessionExpiryDays ?? 7}
              onChange={(e) =>
                update("security.sessionExpiryDays", Number(e.target.value))
              }
            />
          </Field>
        </Section>
      </div>

      <div
        className={`rounded-2xl p-5 shadow-sm border transition-colors ${
          maintenanceOn
            ? "bg-red-50 border-red-200"
            : "bg-white border-amber-100"
        }`}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2.5">
            <span
              className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                maintenanceOn
                  ? "bg-red-100 text-red-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              <AlertTriangle size={17} />
            </span>
            Maintenance Mode
          </h2>
          <Toggle
            checked={maintenanceOn}
            onChange={handleMaintenanceToggle}
            danger
            disabled={togglingMaintenance}
          />
        </div>

        <p className="text-sm text-gray-500 mb-3">
          Put the system into maintenance mode — takes effect immediately on
          confirm.
          {maintenanceOn && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              ● Currently locking out non-admin users
            </span>
          )}
        </p>

        <textarea
          placeholder="Message shown to users while under maintenance"
          className="textarea textarea-bordered w-full rounded-xl"
          value={settings.maintenanceMode?.message || ""}
          onChange={(e) => update("maintenanceMode.message", e.target.value)}
          onBlur={() =>
            updateSystemSettingsApi({
              maintenanceMode: settings.maintenanceMode,
            }).catch(() => {})
          }
        />
      </div>
    </form>
  );
}
