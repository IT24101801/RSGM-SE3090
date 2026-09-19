import { useEffect, useState } from "react";
import {
  createRequisition,
  getMyRequisitions,
  submitRequisition,
  updateRequisition,
} from "../../services/recruiterRequisitionService";

const initialForm = {
  positionTitle: "",
  department: "",
  headcount: 1,
  employmentType: 0,
  workMode: 0,
  location: "",
  experienceLevel: 0,
  minExperienceYears: 0,
  minSalary: "",
  maxSalary: "",
  currency: "LKR",
  description: "",
  responsibilities: "",
  requirements: "",
  justification: "",
};

export default function RequisitionsPage() {
  const [items, setItems] =
    useState([]);

  const [form, setForm] =
    useState(initialForm);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setItems(
        await getMyRequisitions()
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateField(
    name,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function startEdit(item) {
    setEditingId(item.id);

    setForm({
      positionTitle:
        item.positionTitle,
      department:
        item.department,
      headcount:
        item.headcount,
      employmentType:
        item.employmentType,
      workMode:
        item.workMode,
      location:
        item.location,
      experienceLevel:
        item.experienceLevel,
      minExperienceYears:
        item.minExperienceYears ?? 0,
      minSalary:
        item.minSalary ?? "",
      maxSalary:
        item.maxSalary ?? "",
      currency:
        item.currency || "LKR",
      description:
        item.description || "",
      responsibilities:
        item.responsibilities || "",
      requirements:
        item.requirements || "",
      justification:
        item.justification || "",
    });
  }

  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,

        headcount:
          Number(form.headcount),

        minExperienceYears:
          form.minExperienceYears === ""
            ? null
            : Number(
                form.minExperienceYears
              ),

        minSalary:
          form.minSalary === ""
            ? null
            : Number(form.minSalary),

        maxSalary:
          form.maxSalary === ""
            ? null
            : Number(form.maxSalary),

        employmentType:
          Number(
            form.employmentType
          ),

        workMode:
          Number(form.workMode),

        experienceLevel:
          Number(
            form.experienceLevel
          ),
      };

      if (editingId) {
        await updateRequisition(
          editingId,
          payload
        );
      } else {
        await createRequisition(
          payload
        );
      }

      setEditingId(null);
      setForm(initialForm);

      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(id) {
    if (
      !window.confirm(
        "Submit this requisition to HR?"
      )
    ) {
      return;
    }

    try {
      await submitRequisition(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Job Requisitions
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Create job requests and
          submit them to HR for
          approval.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="rounded-xl border bg-white p-6 shadow-sm"
      >
        <h2 className="mb-5 text-lg font-semibold">
          {editingId
            ? "Edit Requisition"
            : "Create Requisition"}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            required
            placeholder="Position title"
            className="rounded-lg border p-3"
            value={form.positionTitle}
            onChange={(e) =>
              updateField(
                "positionTitle",
                e.target.value
              )
            }
          />

          <input
            required
            placeholder="Department"
            className="rounded-lg border p-3"
            value={form.department}
            onChange={(e) =>
              updateField(
                "department",
                e.target.value
              )
            }
          />

          <input
            required
            type="number"
            min="1"
            placeholder="Headcount"
            className="rounded-lg border p-3"
            value={form.headcount}
            onChange={(e) =>
              updateField(
                "headcount",
                e.target.value
              )
            }
          />

          <input
            required
            placeholder="Location"
            className="rounded-lg border p-3"
            value={form.location}
            onChange={(e) =>
              updateField(
                "location",
                e.target.value
              )
            }
          />

          <select
            className="rounded-lg border p-3"
            value={form.employmentType}
            onChange={(e) =>
              updateField(
                "employmentType",
                e.target.value
              )
            }
          >
            <option value={0}>
              Full Time
            </option>
            <option value={1}>
              Part Time
            </option>
            <option value={2}>
              Contract
            </option>
            <option value={3}>
              Internship
            </option>
          </select>

          <select
            className="rounded-lg border p-3"
            value={form.workMode}
            onChange={(e) =>
              updateField(
                "workMode",
                e.target.value
              )
            }
          >
            <option value={0}>
              On Site
            </option>
            <option value={1}>
              Remote
            </option>
            <option value={2}>
              Hybrid
            </option>
          </select>

          <input
            type="number"
            min="0"
            placeholder="Minimum experience"
            className="rounded-lg border p-3"
            value={
              form.minExperienceYears
            }
            onChange={(e) =>
              updateField(
                "minExperienceYears",
                e.target.value
              )
            }
          />

          <select
            className="rounded-lg border p-3"
            value={
              form.experienceLevel
            }
            onChange={(e) =>
              updateField(
                "experienceLevel",
                e.target.value
              )
            }
          >
            <option value={0}>
              Entry
            </option>
            <option value={1}>
              Junior
            </option>
            <option value={2}>
              Mid
            </option>
            <option value={3}>
              Senior
            </option>
            <option value={4}>
              Lead
            </option>
          </select>

          <input
            type="number"
            min="0"
            placeholder="Minimum salary"
            className="rounded-lg border p-3"
            value={form.minSalary}
            onChange={(e) =>
              updateField(
                "minSalary",
                e.target.value
              )
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Maximum salary"
            className="rounded-lg border p-3"
            value={form.maxSalary}
            onChange={(e) =>
              updateField(
                "maxSalary",
                e.target.value
              )
            }
          />
        </div>

        <textarea
          placeholder="Description"
          className="mt-4 w-full rounded-lg border p-3"
          value={form.description}
          onChange={(e) =>
            updateField(
              "description",
              e.target.value
            )
          }
        />

        <textarea
          placeholder="Responsibilities"
          className="mt-4 w-full rounded-lg border p-3"
          value={
            form.responsibilities
          }
          onChange={(e) =>
            updateField(
              "responsibilities",
              e.target.value
            )
          }
        />

        <textarea
          placeholder="Requirements"
          className="mt-4 w-full rounded-lg border p-3"
          value={form.requirements}
          onChange={(e) =>
            updateField(
              "requirements",
              e.target.value
            )
          }
        />

        <textarea
          placeholder="Why is this position needed?"
          className="mt-4 w-full rounded-lg border p-3"
          value={form.justification}
          onChange={(e) =>
            updateField(
              "justification",
              e.target.value
            )
          }
        />

        <div className="mt-5 flex gap-3">
          <button
            disabled={saving}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-white"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update"
                : "Save Draft"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
              }}
              className="rounded-lg border px-5 py-2.5"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {
                      item.positionTitle
                    }
                  </h3>

                  <p className="text-sm text-slate-500">
                    {item.department} •{" "}
                    {item.location}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                  {item.status}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
                <p>
                  Headcount:{" "}
                  {item.headcount}
                </p>

                <p>
                  Salary:{" "}
                  {item.minSalary ??
                    "-"}{" "}
                  -{" "}
                  {item.maxSalary ??
                    "-"}{" "}
                  {item.currency}
                </p>

                <p>
                  Company:{" "}
                  {item.companyName}
                </p>
              </div>

              {item.hrFeedback && (
                <div className="mt-4 rounded-lg bg-red-50 p-4">
                  <p className="font-medium text-red-800">
                    HR Feedback
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {
                      item.hrFeedback
                    }
                  </p>
                </div>
              )}

              {(item.status ===
                "Draft" ||
                item.status ===
                  "Rejected" ||
                item.status === 0 ||
                item.status === 2) && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() =>
                      startEdit(item)
                    }
                    className="rounded-lg border px-4 py-2"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleSubmit(
                        item.id
                      )
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                  >
                    {item.status ===
                      "Rejected" ||
                    item.status === 2
                      ? "Resubmit"
                      : "Submit to HR"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}