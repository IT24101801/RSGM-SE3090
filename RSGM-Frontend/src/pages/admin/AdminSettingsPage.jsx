import { useState } from "react";
import { CircleCheck, Save, Settings, Sparkles } from "lucide-react";

// TODO: replace with GET/PUT /api/admin/config
function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    allowNewRegistrations: true,
    maintenanceMode: false,
    maxResumeSizeMb: 10,
    aiMatchThreshold: 70,
    sessionTimeoutMinutes: 30,
  });
  const [saved, setSaved] = useState(false);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: PUT /api/admin/config with `settings`
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        SYSTEM CONFIGURATION
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-2 text-neutral-500">
        Control platform-wide behavior and limits.
      </p>

      <div className="mt-8 max-w-2xl rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 divide-y divide-neutral-100">
        <ToggleRow
          title="Allow new registrations"
          description="Let new users sign up for an account."
          checked={settings.allowNewRegistrations}
          onChange={(v) => update("allowNewRegistrations", v)}
        />

        <ToggleRow
          title="Maintenance mode"
          description="Temporarily block non-admin access to the platform."
          checked={settings.maintenanceMode}
          onChange={(v) => update("maintenanceMode", v)}
        />

        <NumberRow
          title="Max resume upload size (MB)"
          value={settings.maxResumeSizeMb}
          onChange={(v) => update("maxResumeSizeMb", v)}
          min={1}
          max={50}
        />

        <NumberRow
          title="AI match confidence threshold (%)"
          value={settings.aiMatchThreshold}
          onChange={(v) => update("aiMatchThreshold", v)}
          min={0}
          max={100}
        />

        <NumberRow
          title="Session timeout (minutes)"
          value={settings.sessionTimeoutMinutes}
          onChange={(v) => update("sessionTimeoutMinutes", v)}
          min={5}
          max={240}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          className="h-12 px-6 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition"
        >
          <Save size={15} />
          Save changes
        </button>

        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <CircleCheck size={15} />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 p-6">
      <div>
        <p className="text-sm font-medium text-neutral-900">{title}</p>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>

      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-full flex items-center px-1 transition shrink-0 ${
          checked ? "bg-neutral-900 justify-end" : "bg-neutral-200 justify-start"
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}

function NumberRow({ title, value, onChange, min, max }) {
  return (
    <div className="flex items-center justify-between gap-4 p-6">
      <p className="text-sm font-medium text-neutral-900">{title}</p>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-24 h-10 rounded-lg border border-neutral-200 bg-neutral-50/70 px-3 text-sm text-right outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
      />
    </div>
  );
}

export default AdminSettingsPage;