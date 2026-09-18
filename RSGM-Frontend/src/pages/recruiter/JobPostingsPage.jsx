import { useEffect, useState } from "react";
import {
  AlertCircle, Ban, CircleCheck, Eye, Loader2, Pencil,
  Plus, Save, Sparkles, Trash2, X,
} from "lucide-react";

import { getSkills } from "../../services/skillService";
import {
  createRecruiterJobPosting,
  deleteRecruiterJobPosting,
  getRecruiterJobPostings,
  updateRecruiterJobPosting,
  updateRecruiterJobStatus,
} from "../../services/recruiterJobPostingService";

const EMPTY_FORM = { title: "", location: "", description: "", skillIds: [] };

const STATUS_STYLES = {
  Published: "bg-emerald-50 text-emerald-600",
  Draft: "bg-neutral-100 text-neutral-500",
  Closed: "bg-red-50 text-red-600",
};

function JobPostingsPage() {
  const [postings, setPostings] = useState([]);
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    Promise.all([getRecruiterJobPostings(), getSkills()])
      .then(([jobData, skillData]) => {
        if (!ignore) {
          setPostings(jobData);
          setSkills(skillData.filter((skill) => skill.isActive));
        }
      })
      .catch((requestError) => {
        if (!ignore) setError(requestError.message || "Unable to load job postings.");
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

  const openEdit = (posting) => {
    setEditingId(posting.id);
    setForm({
      title: posting.title,
      location: posting.location,
      description: posting.description ?? "",
      skillIds: posting.requiredSkills.map((skill) => skill.id),
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
        ? await updateRecruiterJobPosting(editingId, form)
        : await createRecruiterJobPosting(form);
      setPostings((current) => current.some((item) => item.id === saved.id)
        ? current.map((item) => item.id === saved.id ? saved : item)
        : [saved, ...current]);
      setShowForm(false);
    } catch (requestError) {
      setError(requestError.message || "Unable to save job posting.");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (posting, status) => {
    setBusyId(posting.id);
    setError("");
    try {
      const updated = await updateRecruiterJobStatus(posting.id, status);
      setPostings((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(requestError.message || "Unable to change job status.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (posting) => {
    if (!window.confirm(`Delete ${posting.title}?`)) return;
    setBusyId(posting.id);
    setError("");
    try {
      await deleteRecruiterJobPosting(posting.id);
      setPostings((current) => current.filter((item) => item.id !== posting.id));
    } catch (requestError) {
      setError(requestError.message || "Unable to delete job posting.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleSkill = (skillId) => {
    setForm((current) => ({
      ...current,
      skillIds: current.skillIds.includes(skillId)
        ? current.skillIds.filter((id) => id !== skillId)
        : [...current.skillIds, skillId],
    }));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
            <Sparkles size={12} /> JOB POSTINGS
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">My Job Postings</h1>
          <p className="mt-2 text-neutral-500">You can only view and manage jobs created by your account.</p>
        </div>
        <button type="button" onClick={openCreate}
          className="h-12 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2">
          <Plus size={16} /> New posting
        </button>
      </div>

      {error && (
        <div className="mt-5 flex gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
          <AlertCircle size={17} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? "Edit job posting" : "Create job posting"}</h2>
            <button type="button" onClick={() => setShowForm(false)}><X size={18} /></button>
          </div>
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            <Field label="Job title *">
              <input required maxLength={150} value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className={inputClass} />
            </Field>
            <Field label="Location *">
              <input required maxLength={150} value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                placeholder="Remote or city" className={inputClass} />
            </Field>
          </div>
          <Field label="Description">
            <textarea maxLength={2000} rows={4} value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className={`${inputClass} mt-2 h-auto py-3`} />
          </Field>
          <div className="mt-4">
            <p className="text-sm font-medium text-neutral-600">Required skills</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map((skill) => {
                const selected = form.skillIds.includes(skill.id);
                return (
                  <button key={skill.id} type="button" onClick={() => toggleSkill(skill.id)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium ${selected
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-neutral-200 text-neutral-500"}`}>
                    {skill.name}
                  </button>
                );
              })}
            </div>
          </div>
          <button disabled={saving}
            className="mt-6 h-11 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save as draft
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-20 text-center text-neutral-400">
          <Loader2 size={20} className="inline animate-spin mr-2" /> Loading job postings...
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 gap-5">
          {postings.map((posting) => (
            <article key={posting.id}
              className="rounded-2xl border border-white/70 bg-white/80 shadow-xl shadow-neutral-200/30 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-neutral-900">{posting.title}</p>
                  <p className="mt-1 text-sm text-neutral-500">{posting.company} · {posting.location}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[posting.status]}`}>
                  {posting.status}
                </span>
              </div>
              {posting.description && <p className="mt-4 text-sm text-neutral-500 line-clamp-2">{posting.description}</p>}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {posting.requiredSkills.map((skill) => (
                  <span key={skill.id} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
                    {skill.name}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
                <Eye size={14} /> {posting.applicantCount} applicant{posting.applicantCount !== 1 ? "s" : ""}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {posting.status !== "Closed" && <ActionButton onClick={() => openEdit(posting)} icon={Pencil} text="Edit" />}
                {posting.status === "Draft" && (
                  <ActionButton onClick={() => changeStatus(posting, "Published")}
                    icon={CircleCheck} text="Publish" disabled={busyId === posting.id} />
                )}
                {posting.status === "Published" && (
                  <ActionButton onClick={() => changeStatus(posting, "Closed")}
                    icon={Ban} text="Close" disabled={busyId === posting.id} />
                )}
                <ActionButton onClick={() => remove(posting)} icon={Trash2} text="Delete"
                  danger disabled={busyId === posting.id} />
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && postings.length === 0 && (
        <div className="mt-8 py-16 text-center rounded-2xl border border-dashed border-neutral-300 text-neutral-400">
          You have not created any job postings yet.
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full h-11 rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

function Field({ label, children }) {
  return <label className="mt-4 block text-sm font-medium text-neutral-600"><span>{label}</span>{children}</label>;
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

export default JobPostingsPage;
