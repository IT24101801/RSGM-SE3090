import { useState } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";

function SkillFormModal({ skill, onClose, onSubmit }) {
  const isEditing = Boolean(skill);

  const [name, setName] = useState(() => skill?.name ?? "");
  const [description, setDescription] = useState(
    () => skill?.description ?? ""
  );

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter a skill name.");
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl sm:p-8">
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-neutral-400 transition hover:text-neutral-700"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* TITLE */}
        <h2 className="text-2xl font-semibold tracking-tight">
          {isEditing ? "Edit skill" : "Add new skill"}
        </h2>

        <p className="mt-1.5 text-sm text-neutral-500">
          {isEditing
            ? "Update the details for this skill."
            : "Create a skill that can be matched against job requirements."}
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* SKILL NAME */}
          <div>
            <label
              htmlFor="skill-name"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Skill name
            </label>

            <input
              id="skill-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="e.g. React.js"
              required
              maxLength={100}
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label
              htmlFor="skill-description"
              className="mb-2 block text-sm font-medium text-neutral-700"
            >
              Description{" "}
              <span className="font-normal text-neutral-400">
                (optional)
              </span>
            </label>

            <textarea
              id="skill-description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setError("");
              }}
              placeholder="Briefly describe this skill..."
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="h-12 flex-1 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {isEditing
                ? "Save changes"
                : "Create skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SkillFormModal;