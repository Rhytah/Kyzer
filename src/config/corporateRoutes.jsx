// src/routes/CorporateRoutes.jsx - Fixed to match router paths
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  Building2,
  Users,
  BookOpen,
  BarChart3,
  Settings,
} from "lucide-react";

// Corporate Pages
import CompanyDashboard from "@/pages/corporate/CompanyDashboard";
import CompanySettings from "@/pages/corporate/CompanySettings";
import Reports from "@/pages/corporate/Reports";
import EmployeeManagement from "@/pages/corporate/EmployeeManagement";
import AcceptInvitation from "@/pages/corporate/AcceptInvitation";

// Layouts and Guards
import CorporateLayout from "@/components/layout/CorporateLayout";
import CorporateGuard from "@/components/auth/CorporateGuard";
import AdminGuard from "@/components/auth/AdminGuard";

// FIXED: Corporate navigation configuration - using /company paths to match router
export const corporateNavItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Building2,
    path: "/company/dashboard", // Changed from /corporate to /company
    permission: null,
  },
  {
    id: "employees",
    label: "Employees",
    icon: Users,
    path: "/company/employees", // Changed from /corporate to /company
    permission: "invite_employees",
  },
  {
    id: "courses",
    label: "Course Assignment",
    icon: BookOpen,
    path: "/company/courses", // Changed from /corporate to /company
    permission: "assign_courses",
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    path: "/company/reports", // Changed from /corporate to /company
    permission: "view_reports",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/company/settings", // Changed from /corporate to /company
    permission: "manage_settings",
  },
];

// FIXED: Corporate routes component - using /company paths
export const CorporateRoutes = () => {
  return (
    <Routes>
      {/* Public corporate routes */}
      <Route path="/company/invite/:token" element={<AcceptInvitation />} />

      {/* Protected corporate routes */}
      <Route element={<CorporateGuard />}>
        <Route element={<CorporateLayout />}>
          <Route path="/company/dashboard" element={<CompanyDashboard />} />

          {/* Employee Management */}
          <Route
            path="/company/employees"
            element={
              <AdminGuard requiredPermission="invite_employees">
                <EmployeeManagement />
              </AdminGuard>
            }
          />

          {/* Reports */}
          <Route
            path="/company/reports"
            element={
              <AdminGuard requiredPermission="view_reports">
                <Reports />
              </AdminGuard>
            }
          />

          {/* Settings */}
          <Route
            path="/company/settings"
            element={
              <AdminGuard requiredPermission="manage_settings">
                <CompanySettings />
              </AdminGuard>
            }
          />

          {/* Default redirects */}
          <Route
            path="/company"
            element={<Navigate to="/company/dashboard" replace />}
          />
          <Route
            path="/company/*"
            element={<Navigate to="/company/dashboard" replace />}
          />
        </Route>
      </Route>
    </Routes>
  );
};