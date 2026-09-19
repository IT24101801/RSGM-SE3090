import { useEffect, useState } from "react";

import {
  AlertCircle,
  Building2,
  Loader2,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react";

import {
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../../services/adminUserService";

import {
  assignCompanyMember,
  getAdminCompanies,
  removeCompanyMember,
} from "../../services/adminCompanyService";

const ROLE_OPTIONS = [
  {
    value: "JobSeeker",
    label: "Job Seeker",
  },
  {
    value: "Recruiter",
    label: "Recruiter",
  },
  {
    value: "HRManager",
    label: "HR Manager",
  },
  {
    value: "HiringPanelist",
    label: "Hiring Panelist",
  },
  {
    value: "SystemAdmin",
    label: "System Admin",
  },
];

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // LOAD USERS + COMPANIES
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        usersResponse,
        companiesResponse,
      ] = await Promise.all([
        getAdminUsers(),
        getAdminCompanies(),
      ]);

      const userItems = Array.isArray(
        usersResponse
      )
        ? usersResponse
        : usersResponse.items ?? [];

      const companyItems = Array.isArray(
        companiesResponse
      )
        ? companiesResponse
        : companiesResponse.items ?? [];

      setUsers(userItems);
      setCompanies(companyItems);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REPLACE ONE USER LOCALLY
  // =========================================================

  const replaceUser = (updatedUser) => {
    setUsers((previous) =>
      previous.map((user) =>
        user.id === updatedUser.id
          ? updatedUser
          : user
      )
    );
  };

  // =========================================================
  // CHANGE ROLE
  // =========================================================

  const handleRoleChange = async (
    user,
    newRole
  ) => {
    if (user.role === newRole) {
      return;
    }

    setError("");
    setSuccess("");
    setUpdatingId(user.id);

    try {
      await updateAdminUserRole(
        user.id,
        newRole
      );

      replaceUser({
        ...user,
        role: newRole,
      });

      setSuccess(
        `${user.fullName || user.email}'s role was updated successfully.`
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to update user role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================================
  // CHANGE COMPANY
  // =========================================================

  const handleCompanyChange = async (
    user,
    newCompanyId
  ) => {
    const currentCompanyId =
      user.companyId ?? "";

    if (currentCompanyId === newCompanyId) {
      return;
    }

    setError("");
    setSuccess("");
    setUpdatingId(user.id);

    try {
      // ---------------------------------------------
      // REMOVE COMPANY
      // ---------------------------------------------

      if (!newCompanyId) {
        if (user.companyId) {
          await removeCompanyMember(
            user.companyId,
            user.id
          );
        }

        replaceUser({
          ...user,
          companyId: null,
          companyName: null,
        });

        setSuccess(
          `${user.fullName || user.email} was removed from the company.`
        );

        return;
      }

      // ---------------------------------------------
      // USER ALREADY HAS A COMPANY
      // Remove old membership before assigning new one.
      // ---------------------------------------------

      if (
        user.companyId &&
        user.companyId !== newCompanyId
      ) {
        await removeCompanyMember(
          user.companyId,
          user.id
        );
      }

      // ---------------------------------------------
      // ASSIGN NEW COMPANY
      // ---------------------------------------------

      await assignCompanyMember(
        newCompanyId,
        user.id
      );

      const selectedCompany =
        companies.find(
          (company) =>
            company.id === newCompanyId
        );

      replaceUser({
        ...user,
        companyId: newCompanyId,
        companyName:
          selectedCompany?.name ?? null,
      });

      setSuccess(
        `${user.fullName || user.email} was assigned to ${
          selectedCompany?.name ?? "the company"
        }.`
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to update company assignment."
      );

      // Reload because removing the old company may have
      // succeeded before assigning the new company failed.
      await loadData();
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================================
  // ENABLE / DISABLE USER
  // =========================================================

  const handleStatusChange = async (
    user
  ) => {
    setError("");
    setSuccess("");
    setUpdatingId(user.id);

    try {
      const newStatus = !user.isActive;

      await updateAdminUserStatus(
        user.id,
        newStatus
      );

      replaceUser({
        ...user,
        isActive: newStatus,
      });

      setSuccess(
        `${user.fullName || user.email} was ${
          newStatus
            ? "enabled"
            : "disabled"
        } successfully.`
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to update user status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================================
  // COMPANY ASSIGNMENT RULE
  // =========================================================

  const canHaveCompany = (role) => {
    return [
      "Recruiter",
      "HRManager",
      "HiringPanelist",
    ].includes(role);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Loader2
          size={18}
          className="animate-spin"
        />

        Loading users...
      </div>
    );
  }

  return (
    <div>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-600">
          <Users size={12} />
          USER MANAGEMENT
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Users
        </h1>

        <p className="mt-2 text-neutral-500">
          Manage user roles, company assignments,
          and account status.
        </p>
      </div>

      {/* =====================================================
          MESSAGES
      ====================================================== */}

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

      {/* =====================================================
          USER TABLE
      ====================================================== */}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-5 py-4 text-left font-semibold text-neutral-600">
                User
              </th>

              <th className="px-5 py-4 text-left font-semibold text-neutral-600">
                Role
              </th>

              <th className="px-5 py-4 text-left font-semibold text-neutral-600">
                Company
              </th>

              <th className="px-5 py-4 text-left font-semibold text-neutral-600">
                Status
              </th>

              <th className="px-5 py-4 text-left font-semibold text-neutral-600">
                Created
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const updating =
                updatingId === user.id;

              const allowCompany =
                canHaveCompany(user.role);

              return (
                <tr
                  key={user.id}
                  className="border-t border-neutral-100"
                >
                  {/* USER */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                        <UserRoundCog
                          size={18}
                          className="text-violet-600"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900">
                          {user.fullName ||
                            "Unnamed user"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-neutral-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ROLE */}

                  <td className="px-5 py-4">
                    <select
                      value={user.role ?? ""}
                      disabled={updating}
                      onChange={(event) =>
                        handleRoleChange(
                          user,
                          event.target.value
                        )
                      }
                      className="h-10 min-w-[150px] rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        Select role
                      </option>

                      {ROLE_OPTIONS.map(
                        (role) => (
                          <option
                            key={role.value}
                            value={role.value}
                          >
                            {role.label}
                          </option>
                        )
                      )}
                    </select>
                  </td>

                  {/* COMPANY */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Building2
                        size={15}
                        className="shrink-0 text-neutral-400"
                      />

                      <select
                        value={
                          user.companyId ?? ""
                        }
                        disabled={
                          updating ||
                          !allowCompany
                        }
                        onChange={(event) =>
                          handleCompanyChange(
                            user,
                            event.target.value
                          )
                        }
                        className="h-10 min-w-[180px] rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
                      >
                        <option value="">
                          No company
                        </option>

                        {companies
                          .filter(
                            (company) =>
                              company.isActive !==
                              false
                          )
                          .map((company) => (
                            <option
                              key={
                                company.id
                              }
                              value={
                                company.id
                              }
                            >
                              {company.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {!allowCompany && (
                      <p className="mt-1 text-[11px] text-neutral-400">
                        Company assignment is not
                        required for this role.
                      </p>
                    )}
                  </td>

                  {/* STATUS */}

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        handleStatusChange(
                          user
                        )
                      }
                      className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        user.isActive
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {updating ? (
                        <Loader2
                          size={13}
                          className="animate-spin"
                        />
                      ) : (
                        <ShieldCheck
                          size={13}
                        />
                      )}

                      {user.isActive
                        ? "Active"
                        : "Inactive"}
                    </button>
                  </td>

                  {/* CREATED */}

                  <td className="px-5 py-4 text-neutral-500">
                    {formatDate(
                      user.createdAt
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* EMPTY STATE */}

        {users.length === 0 && (
          <div className="py-16 text-center text-sm text-neutral-400">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================
// DATE FORMATTER
// =========================================================

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleDateString();
}

export default AdminUsersPage;