import { useEffect, useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";

function SkillFormModal({ skill, onClose, onSubmit }) {
  const isEditing = Boolean(skill);
  const [name, setName] = useState(skill?.name ?? "");
  const [description, setDescription] = useState(skill?.description ?? "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(skill?.name ?? "");
    setDescription(skill?.description ?? "");
  }, [skill]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a skill name.");
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || null });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white shadow-2xl p-6 sm:p-8">
        <button onClick={onClose} className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-700 transition">
          <X size={18} />
        </button>

        <h2 className="text-2xl font-semibold tracking-tight">
          {isEditing ? "Edit skill" : "Add new skill"}
        </h2>

        <p className="mt-1.5 text-sm text-neutral-500">
          {isEditing ? "Update the details for this skill." : "Create a skill that can be matched against job requirements."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="skill-name" className="block text-sm font-medium text-neutral-700 mb-2">
              Skill name
            </label>
            <input
              id="skill-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React.js"
              required
              maxLength={100}
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label htmlFor="skill-description" className="block text-sm font-medium text-neutral-700 mb-2">
              Description <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="skill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this skill..."
              maxLength={500}
              rows={3}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-12 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isEditing ? "Save changes" : "Create skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SkillFormModal;