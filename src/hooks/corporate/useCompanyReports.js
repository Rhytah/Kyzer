// src/hooks/corporate/useCompanyReports.js
import { useState, useEffect } from 'react';
import { useCorporateStore } from '@/store/corporateStore';
import { supabase } from '@/lib/supabase';

/**
 * Hook to fetch and generate company reports from real database data
 * Replaces all mock/random data generation with actual Supabase queries
 */
export function useCompanyReports() {
  const {
    currentCompany,
    employees,
    fetchCompanyStats,
    fetchEmployees,
  } = useCorporateStore();

  const [dateRange, setDateRange] = useState('30days');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    employeeProgress: [],
    courseAnalytics: [],
    overviewMetrics: null,
    engagementMetrics: null,
  });

  useEffect(() => {
    if (currentCompany?.id) {
      refreshData();
    }
  }, [dateRange, currentCompany?.id]);

  const refreshData = async () => {
    if (!currentCompany?.id) return;

    setLoading(true);
    try {
      await Promise.all([
        fetchCompanyStats(),
        fetchEmployees(),
        fetchEmployeeProgressData(),
        fetchCourseAnalyticsData(),
        fetchEngagementData(),
      ]);
    } catch (error) {
      console.error('Error refreshing report data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch real employee progress data from database
   * Queries: course_enrollments, quiz_attempts, lesson_progress
   */
  const fetchEmployeeProgressData = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          users:profiles!inner (
            id,
            email,
            first_name,
            last_name
          ),
          enrollments:course_enrollments (
            id,
            course_id,
            status,
            progress_percentage,
            completed_at,
            courses (
              title
            )
          )
        `)
        .eq('organization_id', currentCompany.id)
        .eq('status', 'active');

      if (error) throw error;

      // Calculate real statistics per employee
      const employeeProgress = (data || []).map(member => {
        const user = member.users;
        const enrollments = member.enrollments || [];

        const coursesAssigned = enrollments.length;
        const coursesCompleted = enrollments.filter(e => e.status === 'completed').length;
        const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0);
        const averageScore = coursesAssigned > 0 ? Math.round(totalProgress / coursesAssigned) : 0;
        const completionRate = coursesAssigned > 0 ? Math.round((coursesCompleted / coursesAssigned) * 100) : 0;

        // Get most recent activity
        const activities = enrollments.map(e => e.completed_at).filter(Boolean);
        const lastActivity = activities.length > 0
          ? new Date(Math.max(...activities.map(d => new Date(d))))
          : null;

        return {
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
          email: user.email,
          coursesAssigned,
          coursesCompleted,
          coursesInProgress: coursesAssigned - coursesCompleted,
          averageScore,
          completionRate,
          lastActivity,
        };
      });

      setReportData(prev => ({ ...prev, employeeProgress }));
      return employeeProgress;
    } catch (error) {
      console.error('Error fetching employee progress:', error);
      return [];
    }
  };

  /**
   * Fetch real course analytics from database
   * Queries: courses, course_enrollments
   */
  const fetchCourseAnalyticsData = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          duration_minutes,
          enrollments:course_enrollments (
            id,
            status,
            progress_percentage,
            completed_at,
            created_at
          )
        `)
        .eq('enrollments.organization_id', currentCompany.id);

      if (error) throw error;

      const courseAnalytics = (data || []).map(course => {
        const enrollments = course.enrollments || [];
        const completions = enrollments.filter(e => e.status === 'completed').length;
        const totalEnrollments = enrollments.length;
        const completionRate = totalEnrollments > 0
          ? Math.round((completions / totalEnrollments) * 100)
          : 0;

        // Calculate average time from enrollment to completion
        const completedCourses = enrollments.filter(e => e.completed_at);
        const averageTime = completedCourses.length > 0
          ? Math.round(
              completedCourses.reduce((sum, e) => {
                const start = new Date(e.created_at);
                const end = new Date(e.completed_at);
                return sum + (end - start) / (1000 * 60); // minutes
              }, 0) / completedCourses.length
            )
          : 0;

        // Calculate average score from progress
        const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0);
        const averageScore = totalEnrollments > 0 ? Math.round(totalProgress / totalEnrollments) : 0;

        return {
          id: course.id,
          title: course.title,
          duration: course.duration_minutes,
          enrollments: totalEnrollments,
          completions,
          completionRate,
          averageScore,
          averageTime,
        };
      });

      setReportData(prev => ({ ...prev, courseAnalytics }));
      return courseAnalytics;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      return [];
    }
  };

  /**
   * Fetch real engagement metrics from database
   * Queries: lesson_progress, course_enrollments, certificates
   */
  const fetchEngagementData = async () => {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

      // Get unique active users by time period
      const { data: dailyActive, error: dailyError } = await supabase
        .from('lesson_progress')
        .select('user_id', { count: 'exact', head: false })
        .gte('last_activity_at', oneDayAgo.toISOString())
        .in('user_id', employees.map(e => e.user_id));

      const { data: weeklyActive, error: weeklyError } = await supabase
        .from('lesson_progress')
        .select('user_id', { count: 'exact', head: false })
        .gte('last_activity_at', oneWeekAgo.toISOString())
        .in('user_id', employees.map(e => e.user_id));

      const { data: monthlyActive, error: monthlyError } = await supabase
        .from('lesson_progress')
        .select('user_id', { count: 'exact', head: false })
        .gte('last_activity_at', oneMonthAgo.toISOString())
        .in('user_id', employees.map(e => e.user_id));

      // Get courses started this week
      const { data: coursesStarted, error: coursesStartedError } = await supabase
        .from('course_enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', currentCompany.id)
        .gte('created_at', oneWeekAgo.toISOString());

      // Get certificates earned this week
      const { data: certificatesEarned, error: certificatesError } = await supabase
        .from('certificates')
        .select('id', { count: 'exact', head: true })
        .gte('issued_at', oneWeekAgo.toISOString())
        .in('user_id', employees.map(e => e.user_id));

      // Calculate average session time from time_spent_seconds
      const { data: sessionData, error: sessionError } = await supabase
        .from('lesson_progress')
        .select('time_spent_seconds')
        .gte('last_activity_at', oneWeekAgo.toISOString())
        .in('user_id', employees.map(e => e.user_id));

      const avgSessionTime = sessionData && sessionData.length > 0
        ? Math.round(
            sessionData.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) /
            sessionData.length / 60
          ) // Convert to minutes
        : 0;

      const engagementMetrics = {
        dailyActiveUsers: dailyActive ? new Set(dailyActive.map(d => d.user_id)).size : 0,
        weeklyActiveUsers: weeklyActive ? new Set(weeklyActive.map(d => d.user_id)).size : 0,
        monthlyActiveUsers: monthlyActive ? new Set(monthlyActive.map(d => d.user_id)).size : 0,
        averageSessionTime: avgSessionTime,
        coursesStartedThisWeek: coursesStarted || 0,
        certificatesEarnedThisWeek: certificatesEarned || 0,
      };

      setReportData(prev => ({ ...prev, engagementMetrics }));
      return engagementMetrics;
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      return {
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        averageSessionTime: 0,
        coursesStartedThisWeek: 0,
        certificatesEarnedThisWeek: 0,
      };
    }
  };

  /**
   * Get overview metrics calculated from real data
   */
  const getOverviewMetrics = () => {
    const { employeeProgress, courseAnalytics } = reportData;

    const totalEmployees = employees.length;
    const coursesCompleted = employeeProgress.reduce((sum, emp) => sum + emp.coursesCompleted, 0);
    const coursesInProgress = employeeProgress.reduce((sum, emp) => sum + emp.coursesInProgress, 0);

    const averageCompletionRate = courseAnalytics.length > 0
      ? Math.round(
          courseAnalytics.reduce((sum, course) => sum + course.completionRate, 0) /
          courseAnalytics.length
        )
      : 0;

    const topPerformers = [...employeeProgress]
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);

    const strugglingEmployees = employeeProgress
      .filter(emp => emp.completionRate < 50)
      .sort((a, b) => a.completionRate - b.completionRate);

    return {
      totalEmployees,
      coursesCompleted,
      coursesInProgress,
      averageCompletionRate,
      topPerformers,
      strugglingEmployees,
    };
  };

  /**
   * Get engagement metrics from fetched data
   */
  const getEngagementMetrics = () => {
    return reportData.engagementMetrics || {
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
      averageSessionTime: 0,
      coursesStartedThisWeek: 0,
      certificatesEarnedThisWeek: 0,
    };
  };

  /**
   * Get employee progress data
   */
  const generateEmployeeProgressData = () => {
    return reportData.employeeProgress || [];
  };

  /**
   * Get course analytics data
   */
  const generateCourseAnalytics = () => {
    return reportData.courseAnalytics || [];
  };

  /**
   * Export data to CSV
   */
  const exportData = async (reportType) => {
    const data = {
      overview: getOverviewMetrics(),
      employees: generateEmployeeProgressData(),
      courses: generateCourseAnalytics(),
      engagement: getEngagementMetrics(),
    };

    const exportData = data[reportType] || data.overview;

    // Convert to CSV
    const csvContent = convertToCSV(exportData);

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Convert data to CSV format
   */
  const convertToCSV = (data) => {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';

      const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'function' && key !== 'id');
      const csv = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
            if (value instanceof Date) return value.toISOString().split('T')[0];
            return value;
          }).join(',')
        )
      ].join('\n');

      return csv;
    } else if (typeof data === 'object') {
      // Convert object to array of key-value pairs
      const rows = Object.entries(data).map(([key, value]) => ({ metric: key, value }));
      return convertToCSV(rows);
    }

    return '';
  };

  return {
    loading,
    dateRange,
    setDateRange,
    getOverviewMetrics,
    getEngagementMetrics,
    generateEmployeeProgressData,
    generateCourseAnalytics,
    exportData,
    refreshData,
  };
}
