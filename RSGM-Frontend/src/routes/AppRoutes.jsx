import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

import AdminLayout from "../layouts/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminSkillsPage from "../pages/admin/AdminSkillsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminAuditLogsPage from "../pages/admin/AdminAuditLogsPage";
import AdminWorkflowsPage from "../pages/admin/AdminWorkflowsPage";
import AdminStatsPage from "../pages/admin/AdminStatsPage";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage";

import RecruiterLayout from "../layouts/RecruiterLayout";
import RecruiterDashboardPage from "../pages/recruiter/RecruiterDashboardPage";
import RequisitionsPage from "../pages/recruiter/RequisitionsPage";
import JobPostingsPage from "../pages/recruiter/JobPostingsPage";
import ApplicationsPage from "../pages/recruiter/ApplicationsPage";
import CandidateMatchingPage from "../pages/recruiter/CandidateMatchingPage";
import ShortlistsPage from "../pages/recruiter/ShortlistsPage";
import InterviewsPage from "../pages/recruiter/InterviewsPage";

import HRLayout from "../layouts/HRLayout";
import HRDashboardPage from "../pages/hr/HRDashboardPage";
import RequisitionApprovalsPage from "../pages/hr/RequisitionApprovalsPage";
import OfferApprovalsPage from "../pages/hr/OfferApprovalsPage";
import WorkflowMonitoringPage from "../pages/hr/WorkflowMonitoringPage";
import AnalyticsPage from "../pages/hr/AnalyticsPage";

import JobSeekerLayout from "../layouts/JobSeekerLayout";
import JobSeekerDashboardPage from "../pages/jobseeker/JobSeekerDashboardPage";
import ProfilePage from "../pages/jobseeker/ProfilePage";
import BrowseJobsPage from "../pages/jobseeker/BrowseJobsPage";
import MyApplicationsPage from "../pages/jobseeker/MyApplicationsPage";

import PanelistLayout from "../layouts/PanelistLayout";
import PanelistDashboardPage from "../pages/panelist/PanelistDashboardPage";
import MyInterviewsPage from "../pages/panelist/MyInterviewsPage";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ================= ADMIN (SystemAdmin only) ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["SystemAdmin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="skills" element={<AdminSkillsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="workflows" element={<AdminWorkflowsPage />} />
        <Route path="stats" element={<AdminStatsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* ================= RECRUITER ================= */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={["Recruiter"]}>
            <RecruiterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RecruiterDashboardPage />} />
        <Route path="requisitions" element={<RequisitionsPage />} />
        <Route path="postings" element={<JobPostingsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="matching" element={<CandidateMatchingPage />} />
        <Route path="shortlists" element={<ShortlistsPage />} />
        <Route path="interviews" element={<InterviewsPage />} />
      </Route>

      {/* ================= HR MANAGER ================= */}
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={["HRManager"]}>
            <HRLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HRDashboardPage />} />
        <Route path="requisitions" element={<RequisitionApprovalsPage />} />
        <Route path="offers" element={<OfferApprovalsPage />} />
        <Route path="workflows" element={<WorkflowMonitoringPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      {/* ================= JOB SEEKER ================= */}
      {/* ================= JOB SEEKER ================= */}
      <Route
        path="/jobs"
        element={
          <ProtectedRoute allowedRoles={["JobSeeker"]}>
            <JobSeekerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<JobSeekerDashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="browse" element={<BrowseJobsPage />} />
        <Route path="applications" element={<MyApplicationsPage />} />
      </Route>

      {/* ================= HIRING PANELIST ================= */}
      <Route
        path="/panelist"
        element={
          <ProtectedRoute allowedRoles={["HiringPanelist"]}>
            <PanelistLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PanelistDashboardPage />} />
        <Route path="interviews" element={<MyInterviewsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;