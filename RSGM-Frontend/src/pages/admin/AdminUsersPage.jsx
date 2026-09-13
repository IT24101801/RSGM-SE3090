import { useMemo, useState } from "react";
import {
  Ban, CircleCheck, Search, Shield, Sparkles, UserCog,
} from "lucide-react";

// TODO: replace with real API calls once backend has a Users controller
// e.g. GET /api/admin/users, PATCH /api/admin/users/{id}/status, PATCH /api/admin/users/{id}/role
const MOCK_USERS = [
  { id: "1", fullName: "Aisha Rahman", email: "aisha@example.com", role: "JobSeeker", isActive: true, createdAt: "2026-01-14" },
  { id: "2", fullName: "Marcus Tan", email: "marcus@example.com", role: "Recruiter", isActive: true, createdAt: "2026-02-02" },
  { id: "3", fullName: "Priya Nair", email: "priya@example.com", role: "HRManager", isActive: false, createdAt: "2026-02-20" },
  { id: "4", fullName: "Daniel Ong", email: "daniel@example.com", role: "HiringPanelist", isActive: true, createdAt: "2026-03-05" },
  { id: "5", fullName: "Grace Lim", email: "grace@example.com", role: "SystemAdmin", isActive: true, createdAt: "2026-01-01" },
];

const ROLES = ["JobSeeker", "Recruiter", "HRManager", "HiringPanelist", "SystemAdmin"];

function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery =
        u.fullName.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const toggleActive = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const changeRole = (id, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
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

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm w-full">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-11 rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-11 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
        >
          <option value="All">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
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
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xs font-semibold shrink-0">
                        {u.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">{u.fullName}</p>
                        <p className="text-xs text-neutral-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      className="h-9 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">{u.createdAt}</td>
                  <td className="px-6 py-4">
                    {u.isActive ? (
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
                        onClick={() => toggleActive(u.id)}
                        className={`h-9 px-3.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 ${
                          u.isActive
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {u.isActive ? <Ban size={13} /> : <CircleCheck size={13} />}
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
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

export default AdminUsersPage;