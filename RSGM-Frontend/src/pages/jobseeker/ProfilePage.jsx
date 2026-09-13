import { useRef, useState } from "react";
import {
  CircleCheck, FileText, Loader2, Plus, Sparkles, Upload, X,
} from "lucide-react";

// TODO: replace with GET/PUT /api/jobseeker/profile
const INITIAL_PROFILE = {
  fullName: "Aisha Rahman",
  headline: "Frontend Engineer",
  location: "Singapore",
  bio: "Frontend engineer with 4 years of experience building React applications.",
};

// TODO: replace with GET/POST/DELETE /api/jobseeker/skills
const INITIAL_SKILLS = ["React", "TypeScript", "Tailwind CSS", "JavaScript"];

// TODO: replace with GET/POST /api/jobseeker/cv
const INITIAL_CV = { fileName: "Aisha_Rahman_CV.pdf", uploadedAt: "2026-08-28" };

function ProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [saved, setSaved] = useState(false);

  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [newSkill, setNewSkill] = useState("");

  const [cv, setCv] = useState(INITIAL_CV);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const updateField = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSaveProfile = () => {
    // TODO: PUT /api/jobseeker/profile
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    // TODO: POST /api/jobseeker/skills
    setSkills((prev) => [...prev, trimmed]);
    setNewSkill("");
  };

  const removeSkill = (skill) => {
    // TODO: DELETE /api/jobseeker/skills/{skill}
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // TODO: POST /api/jobseeker/cv (multipart/form-data)
    setTimeout(() => {
      setCv({ fileName: file.name, uploadedAt: new Date().toISOString().slice(0, 10) });
      setIsUploading(false);
    }, 900);
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        YOUR PROFILE
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Profile</h1>
      <p className="mt-2 text-neutral-500">
        Keep your details, CV, and skills up to date for the best job matches.
      </p>

      {/* ================= PERSONAL DETAILS ================= */}

      <div className="mt-8 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">Personal details</h2>

        <div className="mt-5 space-y-4">
          <Field label="Full name">
            <input
              value={profile.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
            />
          </Field>

          <Field label="Headline">
            <input
              value={profile.headline}
              onChange={(e) => updateField("headline", e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
            />
          </Field>

          <Field label="Location">
            <input
              value={profile.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
            />
          </Field>

          <Field label="About you">
            <textarea
              value={profile.bio}
              onChange={(e) => updateField("bio", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition resize-none"
            />
          </Field>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSaveProfile}
            className="h-11 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 active:scale-[0.99] transition"
          >
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

      {/* ================= CV UPLOAD ================= */}

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">CV / Resume</h2>

        {cv ? (
          <div className="mt-4 flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 bg-neutral-50/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <FileText size={17} className="text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{cv.fileName}</p>
                <p className="text-xs text-neutral-400">Uploaded {cv.uploadedAt}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-400">No CV uploaded yet.</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-4 h-11 px-5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition flex items-center gap-2 disabled:opacity-60"
        >
          {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {isUploading ? "Uploading..." : cv ? "Replace CV" : "Upload CV"}
        </button>
      </div>

      {/* ================= SKILLS ================= */}

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">Skills</h2>
        <p className="mt-1 text-sm text-neutral-500">
          These are matched against job requirements to calculate your match score.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-violet-50 text-violet-700 text-sm font-medium"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-violet-100 transition"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {skills.length === 0 && (
            <p className="text-sm text-neutral-400">No skills added yet.</p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="e.g. Node.js"
            className="h-11 w-56 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
          />
          <button
            onClick={addSkill}
            className="h-11 px-4 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-neutral-800 active:scale-[0.99] transition"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

export default ProfilePage;