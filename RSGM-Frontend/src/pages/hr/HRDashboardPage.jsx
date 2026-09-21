import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckSquare,
  FileText,
  Loader2,
  MapPin,
  Pencil,
  Save,
  Users,
} from "lucide-react";
import { getHrCompanyProfile, saveHrCompanyProfile } from "../../services/hrCompanyProfileService";
import { getHrDashboardSummary } from "../../services/hiringWorkflowService";

const empty = {
  currentEmployeeCount: 0,
  workingLocationCount: 1,
  organizationType: "Local",
  mainDepartments: "",
  majorSkillRequirements: "",
};

export default function HRDashboardPage() {
  const [profile, setProfile]   = useState(null);
  const [form, setForm]         = useState(empty);
  const [editing, setEditing]   = useState(false);
  const [busy, setBusy]         = useState(true);
  const [error, setError]       = useState("");
  const [saved, setSaved]       = useState("");

  // Quick-action KPI counters
  const [summary, setSummary]   = useState(null);
  const [summaryErr, setSummaryErr] = useState("");

  useEffect(() => {
    // Load company profile
    getHrCompanyProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          currentEmployeeCount:  data.currentEmployeeCount,
          workingLocationCount:  data.workingLocationCount || 1,
          organizationType:      data.organizationType || "Local",
          mainDepartments:       data.mainDepartments || "",
          majorSkillRequirements: data.majorSkillRequirements || "",
        });
        setEditing(!data.isConfigured);
      })
      .catch((e) => setError(e.message))
      .finally(() => setBusy(false));

    // Load quick-action summary independently
    getHrDashboardSummary()
      .then(setSummary)
      .catch((e) => setSummaryErr(e.message));
  }, []);

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const result = await saveHrCompanyProfile({
        ...form,
        currentEmployeeCount: Number(form.currentEmployeeCount),
        workingLocationCount:  Number(form.workingLocationCount),
      });
      setProfile(result);
      setEditing(false);
      setSaved("Company information saved.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (busy && !profile)
    return <p className="text-sm text-neutral-500">Loading company dashboard…</p>;

  const companyStats = profile
    ? [
        { label: "Current employees",  value: profile.currentEmployeeCount, icon: Users },
        { label: "Working locations",   value: profile.workingLocationCount, icon: MapPin },
        { label: "Organization type",   value: profile.organizationType || "Not set", icon: Building2 },
      ]
    : [];

  // Quick-action cards definition
  const quickActions = [
    {
      label:       "Pending Requisitions",
      count:       summary?.pendingRequisitions ?? null,
      icon:        FileText,
      iconStyle:   "bg-amber-100 text-amber-600",
      borderStyle: "border-amber-200",
      link:        "/hr/requisitions",
      linkLabel:   "Review",
    },
    {
      label:       "Pending Offers",
      count:       summary?.pendingOffers ?? null,
      icon:        CheckSquare,
      iconStyle:   "bg-blue-100 text-blue-600",
      borderStyle: "border-blue-200",
      link:        "/hr/offers",
      linkLabel:   "Review",
    },
    {
      label:       "Active Pipelines",
      count:       summary?.activePipelines ?? null,
      icon:        Briefcase,
      iconStyle:   "bg-emerald-100 text-emerald-600",
      borderStyle: "border-emerald-200",
      link:        "/hr/workflows",
      linkLabel:   "Monitor",
    },
  ];

  return (
    <div className="space-y-7">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            HR manager workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            {profile?.name || "Company dashboard"}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Maintain the company's workforce information and recruitment needs.
          </p>
        </div>
        {profile?.isConfigured && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold"
          >
            <Pencil size={15} />
            Edit profile
          </button>
        )}
      </div>

      {/* ── Quick-action KPI cards ─────────────────────────────── */}
      {summaryErr && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {summaryErr}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map((a) => (
          <div
            key={a.label}
            className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm ${a.borderStyle}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.iconStyle}`}>
              <a.icon size={18} />
            </div>
            <div>
              <p className="text-xs text-neutral-500">{a.label}</p>
              {a.count === null ? (
                <Loader2 size={16} className="mt-1.5 animate-spin text-neutral-400" />
              ) : (
                <p className="mt-1 text-3xl font-semibold tracking-tight">{a.count}</p>
              )}
            </div>
            <Link
              to={a.link}
              className="mt-auto text-xs font-semibold text-emerald-600 hover:underline"
            >
              {a.linkLabel} →
            </Link>
          </div>
        ))}
      </div>

      {/* ── Alerts ────────────────────────────────────────────── */}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          {saved}
        </p>
      )}

      {/* ── Company profile – view mode ───────────────────────── */}
      {!editing && profile && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {companyStats.map((item) => (
              <article
                key={item.label}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <item.icon size={20} className="text-emerald-600" />
                <p className="mt-4 text-xs text-neutral-500">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h2 className="font-semibold">Main departments</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-600">
                {profile.mainDepartments}
              </p>
            </article>
            <article className="rounded-2xl border border-neutral-200 bg-white p-5">
              <h2 className="font-semibold">Major skill requirements</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-600">
                {profile.majorSkillRequirements}
              </p>
            </article>
          </div>

          <p className="text-xs text-neutral-400">
            The employee count increases automatically when a jobseeker accepts an approved offer.
          </p>
        </>
      )}

      {/* ── Company profile – edit form ───────────────────────── */}
      {editing && (
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <h2 className="text-lg font-semibold">
              {profile?.isConfigured
                ? "Edit company information"
                : "Complete company information"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              This information powers your HR dashboard.
            </p>
          </div>

          <label className="text-sm font-medium">
            Current number of employees
            <input
              required min="0" max="10000000" type="number"
              value={form.currentEmployeeCount}
              onChange={update("currentEmployeeCount")}
              className="mt-2 block w-full rounded-xl border border-neutral-200 px-3 py-2.5"
            />
          </label>

          <label className="text-sm font-medium">
            Number of working locations
            <input
              required min="1" max="100000" type="number"
              value={form.workingLocationCount}
              onChange={update("workingLocationCount")}
              className="mt-2 block w-full rounded-xl border border-neutral-200 px-3 py-2.5"
            />
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            Organization type
            <select
              value={form.organizationType}
              onChange={update("organizationType")}
              className="mt-2 block w-full rounded-xl border border-neutral-200 px-3 py-2.5"
            >
              <option>Local</option>
              <option>International</option>
            </select>
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            Main departments
            <textarea
              required maxLength={2000} rows={4}
              value={form.mainDepartments}
              onChange={update("mainDepartments")}
              placeholder="Engineering, Finance, Sales, Human Resources…"
              className="mt-2 block w-full rounded-xl border border-neutral-200 px-3 py-2.5"
            />
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            Major skills required by the company
            <textarea
              required maxLength={2000} rows={4}
              value={form.majorSkillRequirements}
              onChange={update("majorSkillRequirements")}
              placeholder="Software engineering, project management, financial analysis…"
              className="mt-2 block w-full rounded-xl border border-neutral-200 px-3 py-2.5"
            />
          </label>

          <div className="flex gap-3 sm:col-span-2">
            <button
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Save size={16} />
              Save company information
            </button>
            {profile?.isConfigured && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
