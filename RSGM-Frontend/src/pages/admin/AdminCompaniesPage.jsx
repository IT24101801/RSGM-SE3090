import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Loader2,
  Pencil,
  Plus,
  Save,
  X,
} from "lucide-react";

import {
  createAdminCompany,
  getAdminCompanies,
  updateAdminCompany,
  updateAdminCompanyStatus,
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

  const [editingCompany, setEditingCompany] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminCompanies();

      setCompanies(
        Array.isArray(data)
          ? data
          : data.items ?? []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load companies."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadInitialCompanies() {
      try {
        const data = await getAdminCompanies();
        if (!cancelled) {
          setCompanies(Array.isArray(data) ? data : data.items ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load companies.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialCompanies();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingCompany(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Company name is required."
      );

      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),

        description:
          form.description.trim() || null,

        website:
          form.website.trim() || null,

        logoUrl:
          form.logoUrl.trim() || null,
      };

      if (editingCompany) {
        await updateAdminCompany(
          editingCompany.id,
          payload
        );

        setSuccess(
          "Company updated successfully."
        );
      } else {
        await createAdminCompany(
          payload
        );

        setSuccess(
          "Company created successfully."
        );
      }

      resetForm();

      await loadCompanies();
    } catch (err) {
      setError(
        err.message ||
          "Failed to save company."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);

    setForm({
      name:
        company.name ?? "",

      description:
        company.description ?? "",

      website:
        company.website ?? "",

      logoUrl:
        company.logoUrl ?? "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    resetForm();

    setError("");
    setSuccess("");
  };

  const handleStatusChange = async (
    company
  ) => {
    setError("");
    setSuccess("");

    try {
      await updateAdminCompanyStatus(
        company.id,
        !company.isActive
      );

      setSuccess(
        company.isActive
          ? "Company disabled successfully."
          : "Company enabled successfully."
      );

      await loadCompanies();
    } catch (err) {
      setError(
        err.message ||
          "Failed to update company status."
      );
    }
  };

  return (
    <div>
      {/* HEADER */}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-600">
            <Building2 size={12} />

            COMPANY MANAGEMENT
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Companies
          </h1>

          <p className="mt-2 text-neutral-500">
            Create and manage companies used by
            recruiters and job postings.
          </p>
        </div>
      </div>

      {/* MESSAGES */}

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle
            size={17}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* CREATE / EDIT FORM */}

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">
              {editingCompany
                ? "Edit Company"
                : "Create Company"}
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              {editingCompany
                ? "Update the selected company details."
                : "Add a company that recruiters can be assigned to."}
            </p>
          </div>

          {editingCompany && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
            >
              <X size={15} />

              Cancel
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <Field
            label="Company Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Millennium IT"
            required
          />

          <Field
            label="Website"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />

          <Field
            label="Logo URL"
            name="logoUrl"
            value={form.logoUrl}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
          />

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-neutral-700">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Short description about the company..."
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : editingCompany ? (
                <Save size={16} />
              ) : (
                <Plus size={16} />
              )}

              {saving
                ? "Saving..."
                : editingCompany
                  ? "Save Changes"
                  : "Create Company"}
            </button>
          </div>
        </form>
      </section>

      {/* COMPANY LIST */}

      <section className="mt-8">
        <div>
          <h2 className="text-lg font-semibold">
            Existing Companies
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Manage company details and status.
          </p>
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
            <Loader2
              size={18}
              className="animate-spin"
            />

            Loading companies...
          </div>
        ) : companies.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white py-12 text-center text-sm text-neutral-400">
            No companies have been created yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {companies.map(
              (company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onEdit={() =>
                    handleEdit(company)
                  }
                  onStatusChange={() =>
                    handleStatusChange(
                      company
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="text-sm font-medium text-neutral-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />
    </div>
  );
}

function CompanyCard({
  company,
  onEdit,
  onStatusChange,
}) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={`${company.name} logo`}
              className="h-14 w-14 rounded-xl border border-neutral-100 bg-white object-contain p-1"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-100">
              <Building2
                size={22}
                className="text-violet-600"
              />
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-neutral-900">
                {company.name}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  company.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {company.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            {company.description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                {company.description}
              </p>
            )}

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-medium text-violet-600 hover:text-violet-700"
              >
                {company.website}
              </a>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
          >
            <Pencil size={14} />

            Edit
          </button>

          <button
            type="button"
            onClick={onStatusChange}
            className={`h-10 rounded-xl px-4 text-sm font-semibold transition ${
              company.isActive
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {company.isActive
              ? "Disable"
              : "Enable"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default AdminCompaniesPage;