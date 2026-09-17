import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CircleCheck,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

import {
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../../services/adminUserService";

const ROLES = ["JobSeeker", "Recruiter", "HRManager", "HiringPanelist", "SystemAdmin"];

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    getAdminUsers()
      .then((data) => {
        if (!ignore) setUsers(data);
      })
      .catch((requestError) => {
        if (!ignore) setError(requestError.message || "Unable to load users.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => { ignore = true; };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        user.fullName.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const replaceUser = (updatedUser) => {
    setUsers((previous) => previous.map((user) =>
      user.id === updatedUser.id ? updatedUser : user));
  };

  const toggleActive = async (user) => {
    setError("");
    setUpdatingId(user.id);
    try {
      replaceUser(await updateAdminUserStatus(user.id, !user.isActive));
    } catch (requestError) {
      setError(requestError.message || "Unable to update user status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const changeRole = async (user, newRole) => {
    if (user.role === newRole) return;
    setError("");
    setUpdatingId(user.id);
    try {
      replaceUser(await updateAdminUserRole(user.id, newRole));
    } catch (requestError) {
      setError(requestError.message || "Unable to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        USER MANAGEMENT
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Users</h1>
      <p className="mt-2 text-neutral-500">
        Manage accounts, assign roles, and activate or deactivate users.
      </p>

      {error && (
        <div className="mt-5 flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600 max-w-2xl">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm w-full">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-11 rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="h-11 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
        >
          <option value="All">All roles</option>
          {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200/70 text-left text-xs text-neutral-400 uppercase tracking-wide">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <span className="inline-flex items-center gap-2 text-neutral-400">
                      <Loader2 size={17} className="animate-spin" />
                      Loading users...
                    </span>
                  </td>
                </tr>
              ) : filteredUsers.map((user) => {
                const isUpdating = updatingId === user.id;
                return (
                  <tr key={user.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-semibold shrink-0">
                          {getInitials(user.fullName)}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{user.fullName}</p>
                          <p className="text-xs text-neutral-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(event) => changeRole(user, event.target.value)}
                        disabled={isUpdating}
                        className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition disabled:opacity-50"
                      >
                        {user.role === "Unassigned" && <option value="Unassigned" disabled>Unassigned</option>}
                        {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </td>

                    <td className="px-6 py-4 text-neutral-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                          <CircleCheck size={13} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 text-xs font-medium">
                          <Ban size={13} /> Deactivated
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => toggleActive(user)}
                          disabled={isUpdating}
                          className={`h-9 px-3.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 ${
                            user.isActive
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {isUpdating ? <Loader2 size={13} className="animate-spin" />
                            : user.isActive ? <Ban size={13} /> : <CircleCheck size={13} />}
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-neutral-400">
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getInitials(fullName) {
  return fullName.split(" ").filter(Boolean).map((part) => part[0])
    .join("").slice(0, 2).toUpperCase();
}

export default AdminUsersPage;
