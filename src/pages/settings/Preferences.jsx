import { useEffect, useState } from "react";
import { Bell, Globe, Palette, Moon, Sun, Save } from "lucide-react";
import Card from "../../components/ui/Card";
import { PrimaryButton } from "../../components/ui/Button";

const STORAGE_KEY = "enablingev_preferences";

const DEFAULT_PREFS = {
  emailNotifications: true,
  pushNotifications: false,
  weeklyReports: true,
  darkMode: false,
  language: "English (India)",
  timezone: "IST (UTC +05:30)",
};

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return DEFAULT_PREFS;
  }
};

const Toggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative w-11 h-6 rounded-full transition-colors ${
      enabled ? "bg-blue-600" : "bg-slate-300"
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
        enabled ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

const Preferences = () => {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [prefs]);

  const toggle = (key) => (value) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  const handleSelectChange = (field) => (e) => {
    setPrefs((p) => ({ ...p, [field]: e.target.value }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // storage disabled — silent fail
    }
  };

  return (
    <section className="w-full max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          Settings
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Preferences
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Customize your dashboard experience.
        </p>
      </div>

      <Card className="p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <Bell size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Notifications</h3>
            <p className="text-xs text-slate-500">
              Choose what updates you want to receive.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Email Notifications
              </p>
              <p className="text-xs text-slate-500">
                Receive updates about new dealers and orders via email.
              </p>
            </div>
            <Toggle
              enabled={prefs.emailNotifications}
              onChange={toggle("emailNotifications")}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Push Notifications
              </p>
              <p className="text-xs text-slate-500">
                Real-time browser notifications for urgent actions.
              </p>
            </div>
            <Toggle
              enabled={prefs.pushNotifications}
              onChange={toggle("pushNotifications")}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Weekly Reports
              </p>
              <p className="text-xs text-slate-500">
                Get a weekly summary of business performance.
              </p>
            </div>
            <Toggle
              enabled={prefs.weeklyReports}
              onChange={toggle("weeklyReports")}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
            <Palette size={16} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Appearance</h3>
            <p className="text-xs text-slate-500">
              Customize how the dashboard looks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPrefs((p) => ({ ...p, darkMode: false }))}
            className={`p-4 rounded-xl border-2 transition-all ${
              !prefs.darkMode
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <Sun
              size={20}
              className={`mb-2 mx-auto ${
                !prefs.darkMode ? "text-blue-600" : "text-slate-400"
              }`}
            />
            <p className="text-xs font-semibold text-slate-800">Light Mode</p>
          </button>
          <button
            type="button"
            onClick={() => setPrefs((p) => ({ ...p, darkMode: true }))}
            className={`p-4 rounded-xl border-2 transition-all ${
              prefs.darkMode
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <Moon
              size={20}
              className={`mb-2 mx-auto ${
                prefs.darkMode ? "text-blue-600" : "text-slate-400"
              }`}
            />
            <p className="text-xs font-semibold text-slate-800">Dark Mode</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Coming soon</p>
          </button>
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <Globe size={16} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Language & Region</h3>
            <p className="text-xs text-slate-500">
              Set your preferred language and timezone.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Language
            </label>
            <select
              value={prefs.language}
              onChange={handleSelectChange("language")}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option>English (India)</option>
              <option>हिन्दी (Hindi)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Timezone
            </label>
            <select
              value={prefs.timezone}
              onChange={handleSelectChange("timezone")}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option>IST (UTC +05:30)</option>
            </select>
          </div>
        </div>
      </Card>

      {saved && (
        <p className="text-green-600 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
          ✓ Preferences saved successfully.
        </p>
      )}

      <div className="flex justify-end">
        <PrimaryButton onClick={handleSave} className="gap-2">
          <Save size={16} />
          Save Preferences
        </PrimaryButton>
      </div>
    </section>
  );
};

export default Preferences;
