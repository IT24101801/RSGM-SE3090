import { useEffect, useRef, useState } from "react";
import {
  AlertCircle, CircleCheck, FileText, KeyRound, Loader2, Plus, Sparkles, Upload, X,
} from "lucide-react";

import { changePassword, getProfile, updateProfile } from "../../services/jobSeekerProfileService";
import { addMySkill, getMySkills, removeMySkill } from "../../services/jobSeekerSkillService";
import { getSkills } from "../../services/skillService";
import { deleteCv, getCv, uploadCv } from "../../services/jobSeekerCvService";

function ProfilePage() {
  const [profile, setProfile] = useState({ fullName: "", headline: "", location: "", bio: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [skills, setSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillsError, setSkillsError] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  const [cv, setCv] = useState(null);
  const [cvLoading, setCvLoading] = useState(true);
  const [cvError, setCvError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    let ignore = false;

    Promise.all([getMySkills(), getSkills()])
      .then(([mySkills, allSkills]) => {
        if (ignore) return;
        setSkills(mySkills);
        setCatalog(allSkills.filter((s) => s.isActive));
      })
      .catch((err) => {
        if (!ignore) setSkillsError(err.message || "Unable to load skills.");
      })
      .finally(() => {
        if (!ignore) setSkillsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    getProfile()
      .then((data) => {
        if (ignore) return;
        setProfile({
          fullName: data.fullName ?? "",
          headline: data.headline ?? "",
          location: data.location ?? "",
          bio: data.bio ?? "",
        });
      })
      .catch((err) => {
        if (!ignore) setLoadError(err.message || "Unable to load profile.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    getCv()
      .then((data) => {
        if (!ignore) setCv(data);
      })
      .catch((err) => {
        if (!ignore) setCvError(err.message || "Unable to load CV.");
      })
      .finally(() => {
        if (!ignore) setCvLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const updateField = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSaveProfile = async () => {
    setSaveError("");
    setIsSaving(true);

    try {
      const updated = await updateProfile({
        fullName: profile.fullName,
        headline: profile.headline,
        location: profile.location,
        bio: profile.bio,
      });
      setProfile({
        fullName: updated.fullName ?? "",
        headline: updated.headline ?? "",
        location: updated.location ?? "",
        bio: updated.bio ?? "",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err.message || "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const addedSkillIds = new Set(skills.map((s) => s.skillId));
  const availableCatalog = catalog.filter((s) => !addedSkillIds.has(s.id));

  const addSkill = async () => {
    if (!selectedSkillId) return;

    setSkillsError("");
    setIsAddingSkill(true);

    try {
      const added = await addMySkill(selectedSkillId);
      setSkills((prev) => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedSkillId("");
    } catch (err) {
      setSkillsError(err.message || "Unable to add skill.");
    } finally {
      setIsAddingSkill(false);
    }
  };

  const removeSkill = async (skillId) => {
    setSkillsError("");

    try {
      await removeMySkill(skillId);
      setSkills((prev) => prev.filter((s) => s.skillId !== skillId));
    } catch (err) {
      setSkillsError(err.message || "Unable to remove skill.");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvError("");
    setIsUploading(true);

    try {
      const uploaded = await uploadCv(file);
      setCv(uploaded);
    } catch (err) {
      setCvError(err.message || "Unable to upload CV.");
    } finally {
      setIsUploading(false);
      // reset so selecting the same file again still fires onChange
      e.target.value = "";
    }
  };

  const handleRemoveCv = async () => {
    setCvError("");

    try {
      await deleteCv();
      setCv(null);
    } catch (err) {
      setCvError(err.message || "Unable to remove CV.");
    }
  };

  const updatePasswordField = (key, value) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
    setPasswordChanged(false);
  };

  const handleChangePassword = async () => {
    setPasswordError("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordChanged(true);
      setTimeout(() => setPasswordChanged(false), 2500);
    } catch (err) {
      setPasswordError(err.message || "Unable to update password.");
    } finally {
      setIsChangingPassword(false);
    }
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

        {isLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 size={16} className="animate-spin" />
            Loading profile...
          </div>
        ) : loadError ? (
          <div className="mt-5 flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{loadError}</span>
          </div>
        ) : (
          <>
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

            {saveError && (
              <div className="mt-4 flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="h-11 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60"
              >
                {isSaving && <Loader2 size={15} className="animate-spin" />}
                Save changes
              </button>

              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                  <CircleCheck size={15} />
                  Saved
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* ================= CV UPLOAD ================= */}

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">CV / Resume</h2>

        {cvLoading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 size={16} className="animate-spin" />
            Loading CV...
          </div>
        ) : cv ? (
          <div className="mt-4 flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 bg-neutral-50/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <FileText size={17} className="text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{cv.fileName}</p>
                <p className="text-xs text-neutral-400">
                  Uploaded {new Date(cv.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={handleRemoveCv}
              className="text-xs font-semibold text-red-600 hover:text-red-700 transition shrink-0"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-400">No CV uploaded yet.</p>
        )}

        {cvError && (
          <div className="mt-3 flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{cvError}</span>
          </div>
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

        <p className="mt-2 text-xs text-neutral-400">PDF, DOC, or DOCX. Max 5 MB.</p>
      </div>

      {/* ================= SKILLS ================= */}

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">Skills</h2>
        <p className="mt-1 text-sm text-neutral-500">
          These are matched against job requirements to calculate your match score.
        </p>

        {skillsLoading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 size={16} className="animate-spin" />
            Loading skills...
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.skillId}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-violet-50 text-violet-700 text-sm font-medium"
                >
                  {skill.name}
                  <button
                    onClick={() => removeSkill(skill.skillId)}
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

            {skillsError && (
              <div className="mt-3 flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{skillsError}</span>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="h-11 w-56 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
              >
                <option value="">Select a skill...</option>
                {availableCatalog.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button
                onClick={addSkill}
                disabled={isAddingSkill || !selectedSkillId}
                className="h-11 px-4 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60"
              >
                {isAddingSkill ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add
              </button>
            </div>

            {availableCatalog.length === 0 && !skillsLoading && (
              <p className="mt-2 text-xs text-neutral-400">
                You've added every skill currently in the catalog.
              </p>
            )}
          </>
        )}
      </div>

      {/* ================= PASSWORD ================= */}

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">Password</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Update the password you use to sign in.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Current password">
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => updatePasswordField("currentPassword", e.target.value)}
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
            />
          </Field>

          <Field label="New password">
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => updatePasswordField("newPassword", e.target.value)}
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
            />
          </Field>

          <Field label="Confirm new password">
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => updatePasswordField("confirmPassword", e.target.value)}
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
            />
          </Field>
        </div>

        {passwordError && (
          <div className="mt-4 flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="h-11 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60"
          >
            {isChangingPassword ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
            Update password
          </button>

          {passwordChanged && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CircleCheck size={15} />
              Updated
            </span>
          )}
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