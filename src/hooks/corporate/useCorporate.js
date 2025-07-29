// src/hooks/corporate/useCorporate.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCorporateStore from '@/store/corporateStore';
import { CORPORATE_PERMISSIONS, isFeatureAvailable } from '@/config/corporateRoutes';

/**
 * Main hook for corporate functionality
 * Provides organization data, permissions, and common actions
 */
export const useCorporate = () => {
  const navigate = useNavigate();
  const {
    currentOrganization,
    userRole,
    isOrgAdmin,
    isOrgManager,
    loading,
    error,
    loadCurrentOrganization,
    hasPermission: storeHasPermission,
    reset
  } = useCorporateStore();

  useEffect(() => {
    loadCurrentOrganization();
  }, [loadCurrentOrganization]);

  // Enhanced permission checking
  const hasPermission = (permission) => {
    return storeHasPermission(permission);
  };

  // Check if feature is available for current subscription
  const isFeatureEnabled = (feature) => {
    if (!currentOrganization) return false;
    return isFeatureAvailable(currentOrganization.subscription_type, feature);
  };

  // Navigation helpers
  const navigateTo = (path) => {
    navigate(path);
  };

  const redirectToCreate = () => {
    navigate('/corporate/create');
  };

  // Organization status checks
  const isTrialExpired = () => {
    if (!currentOrganization || currentOrganization.subscription_type !== 'trial') {
      return false;
    }
    return new Date() > new Date(currentOrganization.subscription_end_date);
  };

  const isSubscriptionActive = () => {
    if (!currentOrganization) return false;
    if (currentOrganization.subscription_type === 'trial') {
      return !isTrialExpired();
    }
    return currentOrganization.is_active;
  };

  const canAddMoreEmployees = () => {
    if (!currentOrganization) return false;
    return currentOrganization.current_employee_count < currentOrganization.max_employees;
  };

  const getRemainingEmployeeSlots = () => {
    if (!currentOrganization) return 0;
    return Math.max(0, currentOrganization.max_employees - currentOrganization.current_employee_count);
  };

  return {
    // Organization data
    organization: currentOrganization,
    userRole,
    isAdmin: isOrgAdmin,
    isManager: isOrgManager,
    loading,
    error,

    // Permission checks
    hasPermission,
    isFeatureEnabled,

    // Status checks
    isTrialExpired: isTrialExpired(),
    isSubscriptionActive: isSubscriptionActive(),
    canAddMoreEmployees: canAddMoreEmployees(),
    remainingEmployeeSlots: getRemainingEmployeeSlots(),

    // Actions
    navigateTo,
    redirectToCreate,
    refresh: loadCurrentOrganization,
    reset
  };
};
export default useCorporate;
// src/hooks/corporate/useEmployeeManagement.js
// import { useState, useEffect, useCallback } from 'react';
// import useOrganizationStore from '@/store/organizationStore';

// /**
//  * Hook for employee management functionality
//  */
// export const useEmployeeManagement = (initialFilters = {}) => {
//   const [localFilters, setLocalFilters] = useState({
//     search: '',
//     department: '',
//     status: 'active',
//     role: '',
//     ...initialFilters
//   });

//   const {
//     employees,
//     invitations,
//     employeesLoading,
//     invitationsLoading,
//     loadEmployees,
//     loadInvitations,
//     updateEmployee,
//     removeEmployee,
//     sendInvitation,
//     resendInvitation,
//     cancelInvitation,
//     getDepartments,
//     hasPermission
//   } = useOrganizationStore();

//   // Load employees when filters change
//   useEffect(() => {
//     loadEmployees(localFilters);
//   }, [localFilters, loadEmployees]);

//   // Load invitations on mount
//   useEffect(() => {
//     loadInvitations();
//   }, [loadInvitations]);

//   // Filter update function
//   const updateFilters = useCallback((newFilters) => {
//     setLocalFilters(prev => ({ ...prev, ...newFilters }));
//   }, []);

//   // Clear all filters
//   const clearFilters = useCallback(() => {
//     setLocalFilters({
//       search: '',
//       department: '',
//       status: 'active',
//       role: ''
//     });
//   }, []);

//   // Employee actions with error handling
//   const handleEmployeeAction = useCallback(async (action, employeeId, data = {}) => {
//     try {
//       switch (action) {
//         case 'update_role':
//           return await updateEmployee(employeeId, { role: data.role });
//         case 'update_department':
//           return await updateEmployee(employeeId, { 
//             department: data.department,
//             job_title: data.jobTitle 
//           });
//         case 'suspend':
//           return await updateEmployee(employeeId, { status: 'suspended' });
//         case 'activate':
//           return await updateEmployee(employeeId, { status: 'active' });
//         case 'remove':
//           return await removeEmployee(employeeId);
//         default:
//           throw new Error(`Unknown action: ${action}`);
//       }
//     } catch (error) {
//       console.error(`Error performing ${action}:`, error);
//       throw error;
//     }
//   }, [updateEmployee, removeEmployee]);

//   // Invitation actions
//   const handleInvitationAction = useCallback(async (action, invitationId, data = {}) => {
//     try {
//       switch (action) {
//         case 'send':
//           return await sendInvitation(data);
//         case 'resend':
//           return await resendInvitation(invitationId);
//         case 'cancel':
//           return await cancelInvitation(invitationId);
//         default:
//           throw new Error(`Unknown invitation action: ${action}`);
//       }
//     } catch (error) {
//       console.error(`Error performing ${action} on invitation:`, error);
//       throw error;
//     }
//   }, [sendInvitation, resendInvitation, cancelInvitation]);

//   // Get filtered employees
//   const filteredEmployees = employees;
//   const pendingInvitations = invitations.filter(inv => !inv.accepted_at);
//   const departments = getDepartments();

//   // Statistics
//   const stats = {
//     total: employees.length,
//     active: employees.filter(emp => emp.status === 'active').length,
//     pending: pendingInvitations.length,
//     suspended: employees.filter(emp => emp.status === 'suspended').length
//   };

//   return {
//     // Data
//     employees: filteredEmployees,
//     invitations,
//     pendingInvitations,
//     departments,
//     stats,

//     // Loading states
//     loading: employeesLoading || invitationsLoading,
//     employeesLoading,
//     invitationsLoading,

//     // Filters
//     filters: localFilters,
//     updateFilters,
//     clearFilters,

//     // Actions
//     handleEmployeeAction,
//     handleInvitationAction,
//     refresh: () => {
//       loadEmployees(localFilters);
//       loadInvitations();
//     },

//     // Permissions
//     canManageEmployees: hasPermission('invite_employees') || hasPermission('admin')
//   };
// };

// // src/hooks/corporate/useCourseAssignment.js
// import { useState, useEffect, useCallback } from 'react';
// import useOrganizationStore from '@/store/organizationStore';
// import useCourseStore from '@/store/courseStore';

// /**
//  * Hook for course assignment functionality
//  */
// export const useCourseAssignment = () => {
//   const [filters, setFilters] = useState({
//     search: '',
//     category: '',
//     difficulty: ''
//   });

//   const {
//     currentOrganization,
//     employees,
//     courseAssignments,
//     assignCourse,
//     loadCourseAssignments,
//     loadEmployees,
//     getDepartments,
//     hasPermission
//   } = useOrganizationStore();

//   const {
//     courses,
//     loadCourses,
//     coursesLoading
//   } = useCourseStore();

//   // Load data on mount
//   useEffect(() => {
//     if (currentOrganization) {
//       loadCourses();
//       loadEmployees();
//       loadCourseAssignments();
//     }
//   }, [currentOrganization]);

//   // Filter courses
//   const filteredCourses = courses.filter(course => {
//     const matchesSearch = course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
//                          course.description?.toLowerCase().includes(filters.search.toLowerCase());
//     const matchesCategory = !filters.category || course.category === filters.category;
//     const matchesDifficulty = !filters.difficulty || course.difficulty_level === filters.difficulty;
    
//     return matchesSearch && matchesCategory && matchesDifficulty;
//   });

//   // Get assigned course IDs
//   const assignedCourseIds = new Set(courseAssignments.map(a => a.course_id));

//   // Course assignment handler
//   const handleCourseAssignment = useCallback(async (courseId, assignmentData) => {
//     try {
//       const result = await assignCourse(courseId, assignmentData);
//       // Reload assignments after successful assignment
//       await loadCourseAssignments();
//       return result;
//     } catch (error) {
//       console.error('Error assigning course:', error);
//       throw error;
//     }
//   }, [assignCourse, loadCourseAssignments]);

//   // Get assignment summary
//   const getAssignmentSummary = useCallback((assignmentType, department, selectedEmployees) => {
//     const activeEmployees = employees.filter(emp => emp.status === 'active');
    
//     switch (assignmentType) {
//       case 'all_employees':
//         return `All employees (${activeEmployees.length})`;
//       case 'department':
//         const deptEmployees = activeEmployees.filter(emp => emp.department === department);
//         return `${department} Department (${deptEmployees.length} employees)`;
//       case 'specific_employees':
//         return `${selectedEmployees?.length || 0} selected employees`;
//       default:
//         return '';
//     }
//   }, [employees]);

//   // Get available categories and difficulties
//   const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];
//   const difficulties = [...new Set(courses.map(course => course.difficulty_level).filter(Boolean))];
//   const departments = getDepartments();
//   const activeEmployees = employees.filter(emp => emp.status === 'active');

//   return {
//     // Data
//     courses: filteredCourses,
//     allCourses: courses,
//     assignments: courseAssignments,
//     employees: activeEmployees,
//     departments,
//     categories,
//     difficulties,

//     // Loading
//     loading: coursesLoading,

//     // Filters
//     filters,
//     setFilters,

//     // Assignment status
//     isAssigned: (courseId) => assignedCourseIds.has(courseId),
//     assignedCourseIds,

//     // Actions
//     assignCourse: handleCourseAssignment,
//     getAssignmentSummary,
//     refresh: () => {
//       loadCourses();
//       loadCourseAssignments();
//     },

//     // Permissions
//     canAssignCourses: hasPermission('assign_courses')
//   };
// };

// // src/hooks/corporate/useReporting.js
// import { useState, useEffect, useCallback } from 'react';
// import useOrganizationStore from '@/store/organizationStore';
// import { supabase, TABLES } from '@/lib/supabase';

// /**
//  * Hook for corporate reporting functionality
//  */
// export const useReporting = (initialDateRange = 'last_30_days') => {
//   const [dateRange, setDateRange] = useState(initialDateRange);
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const {
//     currentOrganization,
//     employees,
//     courseAssignments,
//     loadEmployees,
//     getDepartments,
//     hasPermission
//   } = useOrganizationStore();

//   // Calculate date range
//   const getDateRange = useCallback(() => {
//     const endDate = new Date();
//     const startDate = new Date();
    
//     switch (dateRange) {
//       case 'last_7_days':
//         startDate.setDate(endDate.getDate() - 7);
//         break;
//       case 'last_30_days':
//         startDate.setDate(endDate.getDate() - 30);
//         break;
//       case 'last_90_days':
//         startDate.setDate(endDate.getDate() - 90);
//         break;
//       case 'last_year':
//         startDate.setFullYear(endDate.getFullYear() - 1);
//         break;
//       default:
//         startDate.setDate(endDate.getDate() - 30);
//     }
    
//     return { startDate, endDate };
//   }, [dateRange]);

//   // Load report data
//   const loadReportData = useCallback(async () => {
//     if (!currentOrganization || !hasPermission('view_reports')) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const { startDate, endDate } = getDateRange();

//       // Fetch progress data
//       let query = supabase
//         .from(TABLES.EMPLOYEE_COURSE_PROGRESS)
//         .select(`
//           *,
//           user:auth.users(email, raw_user_meta_data),
//           course:courses(title, category),
//           membership:organization_memberships!user_id(department, role)
//         `)
//         .eq('organization_id', currentOrganization.id)
//         .gte('created_at', startDate.toISOString())
//         .lte('created_at', endDate.toISOString());

//       if (selectedDepartment) {
//         query = query.eq('membership.department', selectedDepartment);
//       }

//       const { data: progressData, error: progressError } = await query;

//       if (progressError) throw progressError;

//       // Process data
//       const processedData = processReportData(progressData);
//       setReportData(processedData);

//     } catch (err) {
//       console.error('Error loading report data:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentOrganization, dateRange, selectedDepartment, hasPermission, getDateRange]);

//   // Process raw data into report format
//   const processReportData = useCallback((progressData) => {
//     const activeEmployees = employees.filter(emp => emp.status === 'active');
//     const totalEmployees = activeEmployees.length;
    
//     // Calculate completion rates
//     const completedCourses = progressData.filter(p => p.status === 'completed');
//     const inProgressCourses = progressData.filter(p => p.status === 'in_progress');
//     const notStartedCourses = progressData.filter(p => p.status === 'not_started');
    
//     const completionRate = progressData.length > 0 
//       ? Math.round((completedCourses.length / progressData.length) * 100)
//       : 0;

//     // Calculate average progress
//     const totalProgress = progressData.reduce((sum, p) => sum + (p.progress_percentage || 0), 0);
//     const averageProgress = progressData.length > 0 
//       ? Math.round(totalProgress / progressData.length)
//       : 0;

//     // Group by department
//     const departmentStats = {};
//     activeEmployees.forEach(emp => {
//       const dept = emp.department || 'No Department';
//       if (!departmentStats[dept]) {
//         departmentStats[dept] = {
//           employees: 0,
//           completed: 0,
//           inProgress: 0,
//           notStarted: 0
//         };
//       }
//       departmentStats[dept].employees++;
      
//       const empProgress = progressData.filter(p => p.user_id === emp.user_id);
//       empProgress.forEach(p => {
//         if (p.status === 'completed') departmentStats[dept].completed++;
//         else if (p.status === 'in_progress') departmentStats[dept].inProgress++;
//         else departmentStats[dept].notStarted++;
//       });
//     });

//     // Course statistics
//     const courseStats = {};
//     progressData.forEach(p => {
//       const courseTitle = p.course?.title || 'Unknown Course';
//       if (!courseStats[courseTitle]) {
//         courseStats[courseTitle] = {
//           enrolled: 0,
//           completed: 0,
//           inProgress: 0,
//           averageTimeSpent: 0
//         };
//       }
//       courseStats[courseTitle].enrolled++;
//       if (p.status === 'completed') courseStats[courseTitle].completed++;
//       if (p.status === 'in_progress') courseStats[courseTitle].inProgress++;
//       courseStats[courseTitle].averageTimeSpent += p.time_spent_minutes || 0;
//     });

//     // Calculate average time spent per course
//     Object.keys(courseStats).forEach(course => {
//       courseStats[course].averageTimeSpent = Math.round(
//         courseStats[course].averageTimeSpent / (courseStats[course].enrolled || 1)
//       );
//     });

//     // Recent activity
//     const recentActivity = progressData
//       .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
//       .slice(0, 10)
//       .map(p => ({
//         ...p,
//         userName: p.user?.raw_user_meta_data?.full_name || p.user?.email || 'Unknown User',
//         courseTitle: p.course?.title || 'Unknown Course'
//       }));

//     return {
//       overview: {
//         totalEmployees,
//         totalEnrollments: progressData.length,
//         completionRate,
//         averageProgress,
//         completedCourses: completedCourses.length,
//         inProgressCourses: inProgressCourses.length,
//         notStartedCourses: notStartedCourses.length
//       },
//       departmentStats,
//       courseStats,
//       recentActivity,
//       dateRange: getDateRange()
//     };
//   }, [employees, getDateRange]);

//   // Export report
//   const exportReport = useCallback(async (format = 'csv') => {
//     if (!reportData) return;

//     try {
//       let content = '';
//       let filename = `organization-report-${dateRange}-${new Date().toISOString().split('T')[0]}`;

//       if (format === 'csv') {
//         const headers = ['Employee', 'Department', 'Course', 'Status', 'Progress', 'Completed Date', 'Time Spent (min)'];
//         const rows = reportData.recentActivity.map(activity => [
//           activity.userName,
//           activity.membership?.department || 'No Department',
//           activity.courseTitle,
//           activity.status,
//           `${activity.progress_percentage}%`,
//           activity.completed_at ? new Date(activity.completed_at).toLocaleDateString() : '',
//           activity.time_spent_minutes || 0
//         ]);
        
//         content = [headers, ...rows].map(row => row.join(',')).join('\n');
//         filename += '.csv';
//       } else {
//         content = JSON.stringify(reportData, null, 2);
//         filename += '.json';
//       }

//       // Create and download file
//       const blob = new Blob([content], { 
//         type: format === 'csv' ? 'text/csv' : 'application/json' 
//       });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = filename;
//       a.click();
//       window.URL.revokeObjectURL(url);

//     } catch (error) {
//       console.error('Error exporting report:', error);
//       throw error;
//     }
//   }, [reportData, dateRange]);

//   // Load data when dependencies change
//   useEffect(() => {
//     if (currentOrganization) {
//       loadEmployees();
//       loadReportData();
//     }
//   }, [currentOrganization, dateRange, selectedDepartment, loadEmployees, loadReportData]);

//   const departments = getDepartments();

//   return {
//     // Data
//     reportData,
//     dateRange,
//     selectedDepartment,
//     departments,

//     // Loading and error states
//     loading,
//     error,

//     // Actions
//     setDateRange,
//     setSelectedDepartment,
//     refresh: loadReportData,
//     exportReport,

//     // Permissions
//     canViewReports: hasPermission('view_reports')
//   };
// };

// export default {
//   useCorporate,
//   useEmployeeManagement,
//   useCourseAssignment,
//   useReporting
// };