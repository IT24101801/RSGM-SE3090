import { useEffect, useState } from "react";

import {
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  assignUserCompany,
} from "../../services/adminUserService";

import {
  getAdminCompanies,
} from "../../services/adminCompanyService";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersData, companiesData] =
        await Promise.all([
          getAdminUsers(),
          getAdminCompanies(),
        ]);

      setUsers(usersData);
      setCompanies(companiesData);
    } catch (err) {
      setError(
        err.message || "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (
    userId,
    role
  ) => {
    try {
      await updateAdminUserRole(userId, role);
      await loadData();
    } catch (err) {
      setError(
        err.message || "Failed to update role."
      );
    }
  };

  const handleCompanyChange = async (
    userId,
    companyId
  ) => {
    try {
      await assignUserCompany(
        userId,
        companyId || null
      );

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Failed to assign company."
      );
    }
  };

  const handleStatusChange = async (
    userId,
    isActive
  ) => {
    try {
      await updateAdminUserStatus(
        userId,
        isActive
      );

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Failed to update user status."
      );
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-neutral-500">
        Loading users...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Users
        </h1>

        <p className="text-sm text-neutral-500 mt-1">
          Manage users, roles, status, and
          company assignments.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left px-4 py-3">
                Name
              </th>

              <th className="text-left px-4 py-3">
                Email
              </th>

              <th className="text-left px-4 py-3">
                Role
              </th>

              <th className="text-left px-4 py-3">
                Company
              </th>

              <th className="text-left px-4 py-3">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t border-neutral-100"
              >
                <td className="px-4 py-4">
                  {user.fullName}
                </td>

                <td className="px-4 py-4">
                  {user.email}
                </td>

                <td className="px-4 py-4">
                  <select
                    value={user.role ?? ""}
                    onChange={(e) =>
                      handleRoleChange(
                        user.id,
                        e.target.value
                      )
                    }
                    className="rounded-lg border border-neutral-200 px-3 py-2"
                  >
                    <option value="JobSeeker">
                      Job Seeker
                    </option>

                    <option value="Recruiter">
                      Recruiter
                    </option>

                    <option value="HRManager">
                      HR Manager
                    </option>

                    <option value="HiringPanelist">
                      Hiring Panelist
                    </option>

                    <option value="SystemAdmin">
                      System Admin
                    </option>
                  </select>
                </td>

                <td className="px-4 py-4">
                  <select
                    value={
                      user.companyId ?? ""
                    }
                    onChange={(e) =>
                      handleCompanyChange(
                        user.id,
                        e.target.value
                      )
                    }
                    disabled={
                      user.role === "JobSeeker"
                    }
                    className="rounded-lg border border-neutral-200 px-3 py-2 disabled:bg-neutral-100"
                  >
                    <option value="">
                      No company
                    </option>

                    {companies.map(
                      (company) => (
                        <option
                          key={company.id}
                          value={company.id}
                        >
                          {company.name}
                        </option>
                      )
                    )}
                  </select>
                </td>

                <td className="px-4 py-4">
                  <button
                    onClick={() =>
                      handleStatusChange(
                        user.id,
                        !user.isActive
                      )
                    }
                    className={`rounded-lg px-3 py-2 text-xs font-medium ${
                      user.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {user.isActive
                      ? "Active"
                      : "Inactive"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsersPage;