import { useEffect, useState } from "react";
import {
  AlertCircle,
  Ban,
  Building2,
  CircleCheck,
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  createCompany,
  deleteCompany,
  getAdminCompanies,
  updateCompany,
  updateCompanyStatus,
} from "../../services/adminCompanyService";

const EMPTY_FORM = {
  name: "",
  description: "",
  website: "",
  logoUrl: "",
};

function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    getAdminCompanies()
      .then((data) => {
        if (!ignore) setCompanies(data);
      })
      .catch((requestError) => {
        if (!ignore) setError(requestError.message || "Unable to load companies.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError("");
  };

  const openEdit = (company) => {
    setEditingId(company.id);
    setForm({
      name: company.name,
      description: company.description ?? "",
      website: company.website ?? "",
      logoUrl: company.logoUrl ?? "",
    });
    setShowForm(true);
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const saved = editingId
        ? await updateCompany(editingId, form)
        : await createCompany(form);

      setCompanies((current) => {
        const exists = current.some((item) => item.id === saved.id);
        const next = exists
          ? current.map((item) => item.id === saved.id ? saved : item)
          : [...current, saved];
        return next.sort((a, b) => a.name.localeCompare(b.name));
      });
      setShowForm(false);
    } catch (requestError) {
      setError(requestError.message || "Unable to save company.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (company) => {
    setBusyId(company.id);
    setError("");
    try {
      const updated = await updateCompanyStatus(company.id, !company.isActive);
      setCompanies((current) => current.map((item) =>
        item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError.message || "Unable to update company status.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (company) => {
    if (!window.confirm(`Delete ${company.name}?`)) return;
    setBusyId(company.id);
    setError("");
    try {
      await deleteCompany(company.id);
      setCompanies((current) => current.filter((item) => item.id !== company.id));
    } catch (requestError) {
      setError(requestError.message || "Unable to delete company.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
            <Sparkles size={12} /> COMPANY MANAGEMENT
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Companies</h1>
          <p className="mt-2 text-neutral-500">
            Register employers before assigning recruiters, HR managers, or panelists.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="h-11 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add company
        </button>
      </div>

      {error && (
        <div className="mt-5 flex gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
          <AlertCircle size={17} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="mt-6 p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? "Edit company" : "Register company"}</h2>
            <button type="button" onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <Field label="Company name *">
              <input required maxLength={150} value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className={inputClass} />
            </Field>
            <Field label="Website">
              <input type="url" value={form.website}
                onChange={(event) => setForm({ ...form, website: event.target.value })}
                placeholder="https://example.com" className={inputClass} />
            </Field>
            <Field label="Logo URL">
              <input type="url" value={form.logoUrl}
                onChange={(event) => setForm({ ...form, logoUrl: event.target.value })}
                className={inputClass} />
            </Field>
            <Field label="Description">
              <textarea value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={3} className={`${inputClass} h-auto py-3`} />
            </Field>
          </div>
          <button disabled={saving}
            className="mt-5 h-11 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save company
          </button>
        </form>
      )}

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-neutral-400">
            <Loader2 size={20} className="inline animate-spin mr-2" /> Loading companies...
          </div>
        ) : companies.map((company) => (
          <article key={company.id} className="rounded-2xl border border-white/70 bg-white/80 shadow-lg shadow-neutral-200/30 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Building2 size={20} className="text-violet-600" />
                </div>
                <div>
                  <h2 className="font-semibold">{company.name}</h2>
                  <p className="mt-1 text-xs text-neutral-400">
                    {company.memberCount} members · {company.jobPostingCount} jobs
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${company.isActive
                ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-500"}`}>
                {company.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {company.description && <p className="mt-4 text-sm text-neutral-500">{company.description}</p>}
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer"
                className="mt-3 block text-sm text-violet-600 hover:underline">{company.website}</a>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <ActionButton onClick={() => openEdit(company)} icon={Pencil} text="Edit" />
              <ActionButton onClick={() => toggleStatus(company)}
                disabled={busyId === company.id}
                icon={company.isActive ? Ban : CircleCheck}
                text={company.isActive ? "Deactivate" : "Activate"} />
              <ActionButton onClick={() => remove(company)} disabled={busyId === company.id}
                icon={Trash2} text="Delete" danger />
            </div>
          </article>
        ))}
      </div>

      {!loading && companies.length === 0 && (
        <div className="mt-8 py-16 text-center rounded-2xl border border-dashed border-neutral-300 text-neutral-400">
          No companies registered yet.
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full h-11 rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

function Field({ label, children }) {
  return <label className="block text-sm font-medium text-neutral-600"><span className="block mb-2">{label}</span>{children}</label>;
}

function ActionButton({ onClick, icon: Icon, text, danger = false, disabled = false }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 ${danger
        ? "border-red-200 text-red-600 hover:bg-red-50"
        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}>
      <Icon size={13} /> {text}
    </button>
  );
}

export default AdminCompaniesPage;
