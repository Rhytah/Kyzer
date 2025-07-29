import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  Building2,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Plus,
  Mail,
} from "lucide-react";

// Corporate Pages
import CompanyDashboard from "@/pages/corporate/CompanyDashboard";
// import CreateOrganization from "@/pages/corporate/CreateOrganization";
import CompanySettings from "@/pages/corporate/CompanySettings";
import Reports from "@/pages/corporate/Reports";
import EmployeeManagement from "@/pages/corporate/EmployeeManagement";
// import CourseAssignment from "@/components/corporate/CourseAssignment";
import AcceptInvitation from "@/pages/corporate/AcceptInvitation";

// Layouts and Guards
import CorporateLayout from "@/components/layout/CorporateLayout";
import CorporateGuard from "@/components/auth/CorporateGuard";
// import AdminGuard from "@/components/auth/AdminGuard";

// Corporate navigation configuration
export const corporateNavItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Building2,
    path: "/corporate/dashboard",
    permission: null,
  },
  {
    id: "employees",
    label: "Employees",
    icon: Users,
    path: "/corporate/employees",
    permission: "invite_employees",
  },
  {
    id: "courses",
    label: "Course Assignment",
    icon: BookOpen,
    path: "/corporate/courses",
    permission: "assign_courses",
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    path: "/corporate/reports",
    permission: "view_reports",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/corporate/settings",
    permission: "manage_settings",
  },
];

// Corporate routes component
export const CorporateRoutes = () => {
  return (
    <Routes>
      {/* Public corporate routes */}
      {/* <Route path="/corporate/create" element={<CreateOrganization />} /> */}
      <Route path="/corporate/invite/:token" element={<AcceptInvitation />} />

      {/* Protected corporate routes */}
      <Route element={<CorporateGuard />}>
        <Route element={<CorporateLayout />}>
          <Route path="/corporate/dashboard" element={<CompanyDashboard />} />

          {/* Employee Management */}
          {/* <Route
            path="/corporate/employees"
            element={
              <AdminGuard requiredPermission="invite_employees">
                <EmployeeManagement />
              </AdminGuard>
            }
          /> */}

          {/* Course Assignment */}
          {/* <Route
            path="/corporate/courses"
            element={
              <AdminGuard requiredPermission="assign_courses">
                <CourseAssignment />
              </AdminGuard>
            }
          /> */}

          {/* Reports */}
          <Route
            path="/corporate/reports"
            element={
              <AdminGuard requiredPermission="view_reports">
                <Reports />
              </AdminGuard>
            }
          />

          {/* Settings */}
          <Route
            path="/corporate/settings"
            element={
              <AdminGuard requiredPermission="manage_settings">
                <CompanySettings />
              </AdminGuard>
            }
          />

          {/* Default redirects */}
          <Route
            path="/corporate"
            element={<Navigate to="/corporate/dashboard" replace />}
          />
          <Route
            path="/corporate/*"
            element={<Navigate to="/corporate/dashboard" replace />}
          />
        </Route>
      </Route>
    </Routes>
  );
};
