import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  FileText,
  Users,
} from "lucide-react";

import {
  getAdminDashboardStats,
} from "../../services/adminDashboardService";

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCompanies: 0,
    totalJobPostings: 0,
    totalApplications: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminDashboardStats();

      setStats({
        totalUsers: data.totalUsers ?? 0,
        activeUsers: data.activeUsers ?? 0,
        totalCompanies: data.totalCompanies ?? 0,
        totalJobPostings: data.totalJobPostings ?? 0,
        totalApplications: data.totalApplications ?? 0,
      });
    } catch (err) {
      setError(
        err.message ||
          "Failed to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      label: "Companies",
      value: stats.totalCompanies,
      icon: Building2,
    },
    {
      label: "Job Postings",
      value: stats.totalJobPostings,
      icon: BriefcaseBusiness,
    },
    {
      label: "Applications",
      value: stats.totalApplications,
      icon: FileText,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Overview of users, companies, jobs,
          and applications.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">
          Loading dashboard...
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-neutral-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-500">
                        {card.label}
                      </p>

                      <p className="mt-2 text-3xl font-semibold">
                        {card.value}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100">
                      <Icon
                        size={20}
                        className="text-neutral-700"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5">
            <h2 className="font-semibold">
              User Activity
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">
                  Active Users
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {stats.activeUsers}
                </p>
              </div>

              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">
                  Inactive Users
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  {Math.max(
                    stats.totalUsers -
                      stats.activeUsers,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboardPage;