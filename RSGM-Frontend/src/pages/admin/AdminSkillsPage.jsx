import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, CircleCheck, CircleX, Loader2, Pencil, Plus, Search, Sparkles, Trash2,
} from "lucide-react";

import { createSkill, deactivateSkill, getSkills, updateSkill } from "../../services/skillService";
import SkillFormModal from "../../components/admin/SkillFormModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

function AdminSkillsPage() {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [editingSkill, setEditingSkill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [skillToDeactivate, setSkillToDeactivate] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const loadSkills = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getSkills();
      setSkills(data);
    } catch (err) {
      setError(err.message || "Unable to load skills.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSkills(); }, []);

  const filteredSkills = useMemo(() => {
    if (!query.trim()) return skills;
    const q = query.trim().toLowerCase();
    return skills.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.description ?? "").toLowerCase().includes(q)
    );
  }, [skills, query]);

  const openCreateModal = () => {
    setEditingSkill(null);
    setIsModalOpen(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    if (editingSkill) {
      await updateSkill(editingSkill.id, formData);
    } else {
      await createSkill(formData);
    }
    setIsModalOpen(false);
    setEditingSkill(null);
    await loadSkills();
  };

  const handleDeactivate = async () => {
    if (!skillToDeactivate) return;
    setIsDeactivating(true);
    try {
      await deactivateSkill(skillToDeactivate.id);
      setSkillToDeactivate(null);
      await loadSkills();
    } catch (err) {
      setError(err.message || "Unable to deactivate skill.");
      setSkillToDeactivate(null);
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
            <Sparkles size={12} />
            SKILL CATALOG
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Skills</h1>
          <p className="mt-2 text-neutral-500">
            Create and manage the skills used across job postings and candidate profiles.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="h-12 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition shrink-0"
        >
          <Plus size={16} />
          Add skill
        </button>
      </div>

      <div className="relative mt-8 max-w-sm">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills..."
          className="w-full h-11 rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        />
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600 max-w-lg">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-neutral-400 text-sm">
            <Loader2 size={18} className="animate-spin" />
            Loading skills...
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-400">
            {skills.length === 0 ? "No skills yet. Add your first one to get started." : "No skills match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200/70 text-left text-xs text-neutral-400 uppercase tracking-wide">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.map((skill) => (
                  <tr key={skill.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/70 transition">
                    <td className="px-6 py-4 font-medium text-neutral-900">{skill.name}</td>
                    <td className="px-6 py-4 text-neutral-500 max-w-xs truncate">{skill.description || "—"}</td>
                    <td className="px-6 py-4">
                      {skill.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                          <CircleCheck size={13} />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 text-xs font-medium">
                          <CircleX size={13} />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(skill)}
                          className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition"
                          title="Edit skill"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setSkillToDeactivate(skill)}
                          disabled={!skill.isActive}
                          className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-500"
                          title={skill.isActive ? "Deactivate skill" : "Already inactive"}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <SkillFormModal
          skill={editingSkill}
          onClose={() => { setIsModalOpen(false); setEditingSkill(null); }}
          onSubmit={handleSubmit}
        />
      )}

      {skillToDeactivate && (
        <ConfirmDialog
          title="Deactivate this skill?"
          message={`"${skillToDeactivate.name}" will no longer be available for new matches. This can be reversed later by an admin.`}
          confirmLabel="Deactivate"
          isLoading={isDeactivating}
          onConfirm={handleDeactivate}
          onClose={() => setSkillToDeactivate(null)}
        />
      )}
    </div>
  );
}

export default AdminSkillsPage;