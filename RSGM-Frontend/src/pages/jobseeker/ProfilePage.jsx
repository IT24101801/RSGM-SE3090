import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CircleCheck,
  FileText,
  KeyRound,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { logout } from "../../services/authService";
import {
  changePassword,
  deleteAccount,
  getProfile,
  updateProfile,
} from "../../services/jobSeekerProfileService";
import {
  addMySkill,
  getMySkills,
  removeMySkill,
} from "../../services/jobSeekerSkillService";
import { getSkills } from "../../services/skillService";
import {
  deleteCv,
  getCv,
  uploadCv,
} from "../../services/jobSeekerCvService";

function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: "",
    headline: "",
    location: "",
    bio: "",
  });

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
  const [isChangingPassword, setIsChangingPassword] =
    useState(false);
  const [passwordChanged, setPasswordChanged] =
    useState(false);

  const [showDeleteDialog, setShowDeleteDialog] =
    useState(false);
  const [deletePassword, setDeletePassword] =
    useState("");
  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Load skills.
  useEffect(() => {
    let ignore = false;

    Promise.all([
      getMySkills(),
      getSkills(),
    ])
      .then(([mySkills, allSkills]) => {
        if (ignore) {
          return;
        }

        setSkills(mySkills);
        setCatalog(
          allSkills.filter((skill) => skill.isActive)
        );
      })
      .catch((error) => {
        if (!ignore) {
          setSkillsError(
            error.message ||
              "Unable to load skills."
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setSkillsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Load profile.
  useEffect(() => {
    let ignore = false;

    getProfile()
      .then((data) => {
        if (ignore) {
          return;
        }

        setProfile({
          fullName: data.fullName ?? "",
          headline: data.headline ?? "",
          location: data.location ?? "",
          bio: data.bio ?? "",
        });
      })
      .catch((error) => {
        if (!ignore) {
          setLoadError(
            error.message ||
              "Unable to load profile."
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Load CV.
  useEffect(() => {
    let ignore = false;

    getCv()
      .then((data) => {
        if (!ignore) {
          setCv(data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          setCvError(
            error.message ||
              "Unable to load CV."
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setCvLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const updateField = (key, value) => {
    setProfile((previous) => ({
      ...previous,
      [key]: value,
    }));

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

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      setSaveError(
        error.message ||
          "Unable to save profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const addedSkillIds = new Set(
    skills.map((skill) => skill.skillId)
  );

  const availableCatalog = catalog.filter(
    (skill) => !addedSkillIds.has(skill.id)
  );

  const addSkill = async () => {
    if (!selectedSkillId) {
      return;
    }

    setSkillsError("");
    setIsAddingSkill(true);

    try {
      const addedSkill =
        await addMySkill(selectedSkillId);

      setSkills((previous) =>
        [...previous, addedSkill].sort(
          (first, second) =>
            first.name.localeCompare(second.name)
        )
      );

      setSelectedSkillId("");
    } catch (error) {
      setSkillsError(
        error.message ||
          "Unable to add skill."
      );
    } finally {
      setIsAddingSkill(false);
    }
  };

  const removeSkill = async (skillId) => {
    setSkillsError("");

    try {
      await removeMySkill(skillId);

      setSkills((previous) =>
        previous.filter(
          (skill) => skill.skillId !== skillId
        )
      );
    } catch (error) {
      setSkillsError(
        error.message ||
          "Unable to remove skill."
      );
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setCvError("");
    setIsUploading(true);

    try {
      const uploaded = await uploadCv(file);
      setCv(uploaded);
    } catch (error) {
      setCvError(
        error.message ||
          "Unable to upload CV."
      );
    } finally {
      setIsUploading(false);

      // Selecting the same file again will trigger onChange.
      event.target.value = "";
    }
  };

  const handleRemoveCv = async () => {
    setCvError("");

    try {
      await deleteCv();
      setCv(null);
    } catch (error) {
      setCvError(
        error.message ||
          "Unable to remove CV."
      );
    }
  };

  const updatePasswordField = (key, value) => {
    setPasswordForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setPasswordChanged(false);
  };

  const handleChangePassword = async () => {
    setPasswordError("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New password and confirmation do not match."
      );
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordChanged(true);

      setTimeout(() => {
        setPasswordChanged(false);
      }, 2500);
    } catch (error) {
      setPasswordError(
        error.message ||
          "Unable to update password."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const openDeleteDialog = () => {
    setDeletePassword("");
    setDeleteConfirmation("");
    setDeleteError("");
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    if (isDeleting) {
      return;
    }

    setShowDeleteDialog(false);
    setDeletePassword("");
    setDeleteConfirmation("");
    setDeleteError("");
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");

    if (!deletePassword) {
      setDeleteError(
        "Enter your current password."
      );
      return;
    }

    if (deleteConfirmation !== "DELETE") {
      setDeleteError(
        'Type "DELETE" exactly to confirm.'
      );
      return;
    }

    setIsDeleting(true);

    try {
      await deleteAccount(deletePassword);

      // Remove the JWT and other login information.
      logout();

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Your account was deleted successfully.",
        },
      });
    } catch (error) {
      setDeleteError(
        error.message ||
          "Unable to delete account."
      );

      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        YOUR PROFILE
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
        Profile
      </h1>

      <p className="mt-2 text-neutral-500">
        Keep your details, CV, and skills up to
        date for the best job matches.
      </p>

      {/* PERSONAL DETAILS */}

      <div className="mt-8 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">
          Personal details
        </h2>

        {isLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-neutral-400">
            <Loader2
              size={16}
              className="animate-spin"
            />
            Loading profile...
          </div>
        ) : loadError ? (
          <ErrorMessage message={loadError} />
        ) : (
          <>
            <div className="mt-5 space-y-4">
              <Field label="Full name">
                <input
                  value={profile.fullName}
                  onChange={(event) =>
                    updateField(
                      "fullName",
                      event.target.value
                    )
                  }
                  className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
                />
              </Field>

              <Field label="Headline">
                <input
                  value={profile.headline}
                  onChange={(event) =>
                    updateField(
                      "headline",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Frontend Engineer"
                  className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
                />
              </Field>

              <Field label="Location">
                <input
                  value={profile.location}
                  onChange={(event) =>
                    updateField(
                      "location",
                      event.target.value
                    )
                  }
                  className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
                />
              </Field>

              <Field label="About you">
                <textarea
                  value={profile.bio}
                  onChange={(event) =>
                    updateField(
                      "bio",
                      event.target.value
                    )
                  }
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition resize-none"
                />
              </Field>
            </div>

            {saveError && (
              <ErrorMessage message={saveError} />
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="h-11 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60"
              >
                {isSaving && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                )}

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

      {/* CV UPLOAD */}

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">
          CV / Resume
        </h2>

        {cvLoading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
            <Loader2
              size={16}
              className="animate-spin"
            />
            Loading CV...
          </div>
        ) : cv ? (
          <div className="mt-4 flex items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 bg-neutral-50/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <FileText
                  size={17}
                  className="text-violet-600"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {cv.fileName}
                </p>

                <p className="text-xs text-neutral-400">
                  Uploaded{" "}
                  {new Date(
                    cv.uploadedAt
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveCv}
              className="text-xs font-semibold text-red-600 hover:text-red-700 transition shrink-0"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-neutral-400">
            No CV uploaded yet.
          </p>
        )}

        {cvError && (
          <ErrorMessage message={cvError} />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={isUploading}
          className="mt-4 h-11 px-5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition flex items-center gap-2 disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2
              size={15}
              className="animate-spin"
            />
          ) : (
            <Upload size={15} />
          )}

          {isUploading
            ? "Uploading..."
            : cv
              ? "Replace CV"
              : "Upload CV"}
        </button>

        <p className="mt-2 text-xs text-neutral-400">
          PDF, DOC, or DOCX. Max 5 MB.
        </p>
      </div>

      {/* SKILLS */}

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">
          Skills
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          These are matched against job
          requirements to calculate your match
          score.
        </p>

        {skillsLoading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-400">
            <Loader2
              size={16}
              className="animate-spin"
            />
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
                    type="button"
                    onClick={() =>
                      removeSkill(skill.skillId)
                    }
                    aria-label={`Remove ${skill.name}`}
                    className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-violet-100 transition"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {skills.length === 0 && (
                <p className="text-sm text-neutral-400">
                  No skills added yet.
                </p>
              )}
            </div>

            {skillsError && (
              <ErrorMessage
                message={skillsError}
              />
            )}

            <div className="mt-4 flex items-center gap-2">
              <select
                value={selectedSkillId}
                onChange={(event) =>
                  setSelectedSkillId(
                    event.target.value
                  )
                }
                className="h-11 w-56 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
              >
                <option value="">
                  Select a skill...
                </option>

                {availableCatalog.map((skill) => (
                  <option
                    key={skill.id}
                    value={skill.id}
                  >
                    {skill.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={addSkill}
                disabled={
                  isAddingSkill ||
                  !selectedSkillId
                }
                className="h-11 px-4 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center gap-1.5 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60"
              >
                {isAddingSkill ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={14} />
                )}

                Add
              </button>
            </div>

            {availableCatalog.length === 0 && (
              <p className="mt-2 text-xs text-neutral-400">
                You&apos;ve added every skill
                currently in the catalog.
              </p>
            )}
          </>
        )}
      </div>

      {/* PASSWORD */}

      <div className="mt-6 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight">
          Password
        </h2>

        <p className="mt-1 text-sm text-neutral-500">
          Update the password you use to sign in.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Current password">
            <input
              type="password"
              value={
                passwordForm.currentPassword
              }
              onChange={(event) =>
                updatePasswordField(
                  "currentPassword",
                  event.target.value
                )
              }
              autoComplete="current-password"
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
            />
          </Field>

          <Field label="New password">
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                updatePasswordField(
                  "newPassword",
                  event.target.value
                )
              }
              autoComplete="new-password"
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
            />
          </Field>

          <Field label="Confirm new password">
            <input
              type="password"
              value={
                passwordForm.confirmPassword
              }
              onChange={(event) =>
                updatePasswordField(
                  "confirmPassword",
                  event.target.value
                )
              }
              autoComplete="new-password"
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
            />
          </Field>
        </div>

        {passwordError && (
          <ErrorMessage
            message={passwordError}
          />
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="h-11 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60"
          >
            {isChangingPassword ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <KeyRound size={15} />
            )}

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

      {/* DANGER ZONE */}

      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/70 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight text-red-700">
          Danger zone
        </h2>

        <p className="mt-1 text-sm text-red-600/80">
          Permanently delete your account,
          profile, skills, CV, and job
          applications. This action cannot be
          undone.
        </p>

        <button
          type="button"
          onClick={openDeleteDialog}
          className="mt-5 h-11 px-5 rounded-xl bg-red-600 text-white text-sm font-semibold flex items-center gap-2 hover:bg-red-700 active:scale-[0.99] transition"
        >
          <Trash2 size={15} />
          Delete account
        </button>
      </div>

      {/* DELETE CONFIRMATION DIALOG */}

      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDeleteDialog();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="delete-account-title"
                  className="text-xl font-semibold text-neutral-900"
                >
                  Delete your account?
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  All of your Job Seeker data
                  will be permanently removed.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={isDeleting}
                aria-label="Close delete account dialog"
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <Field label="Current password">
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) =>
                    setDeletePassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-100 transition"
                />
              </Field>

              <Field label='Type "DELETE" to confirm'>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(event) =>
                    setDeleteConfirmation(
                      event.target.value
                    )
                  }
                  placeholder="DELETE"
                  className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-100 transition"
                />
              </Field>
            </div>

            {deleteError && (
              <ErrorMessage
                message={deleteError}
              />
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={isDeleting}
                className="h-11 px-5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={
                  isDeleting ||
                  !deletePassword ||
                  deleteConfirmation !== "DELETE"
                }
                className="h-11 px-5 rounded-xl bg-red-600 text-white text-sm font-semibold flex items-center gap-2 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={15} />
                )}

                {isDeleting
                  ? "Deleting..."
                  : "Permanently delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        {label}
      </label>

      {children}
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="mt-4 flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
      <AlertCircle
        size={17}
        className="mt-0.5 shrink-0"
      />

      <span>{message}</span>
    </div>
  );
}

export default ProfilePage;