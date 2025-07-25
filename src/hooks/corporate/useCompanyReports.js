// src/hooks/corporate/useCompanyReports.js
import { useState, useEffect } from 'react'
import { useCorporateStore } from '@/store/corporateStore'

export function useCompanyReports() {
  const {
    employees,
    courseAssignments,
    companyStats,
    fetchCompanyStats,
    fetchEmployees,
    fetchCourseAssignments
  } = useCorporateStore()

  const [dateRange, setDateRange] = useState('30days')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    refreshData()
  }, [dateRange])

  const refreshData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchCompanyStats(),
        fetchEmployees(),
        fetchCourseAssignments()
      ])
    } finally {
      setLoading(false)
    }
  }

  const generateEmployeeProgressData = () => {
    // Mock data for employee progress - in real app, this would come from enrollments
    return employees.map(employee => ({
      ...employee,
      coursesAssigned: Math.floor(Math.random() * 10) + 1,
      coursesCompleted: Math.floor(Math.random() * 8),
      averageScore: Math.floor(Math.random() * 30) + 70,
      lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      completionRate: function() {
        return Math.round((this.coursesCompleted / this.coursesAssigned) * 100)
      }
    }))
  }

  const generateCourseAnalytics = () => {
    return courseAssignments.map(assignment => ({
      ...assignment,
      enrollments: Math.floor(Math.random() * 50) + 10,
      completions: Math.floor(Math.random() * 40) + 5,
      averageScore: Math.floor(Math.random() * 30) + 70,
      averageTime: Math.floor(Math.random() * 120) + 30, // minutes
      completionRate: function() { 
        return Math.round((this.completions / this.enrollments) * 100)
      }
    }))
  }

  const getOverviewMetrics = () => {
    const employeeProgress = generateEmployeeProgressData()
    const courseAnalytics = generateCourseAnalytics()
    
    return {
      totalEmployees: employees.length,
      coursesCompleted: companyStats?.coursesCompleted || 0,
      coursesInProgress: companyStats?.coursesInProgress || 0,
      averageCompletionRate: courseAnalytics.length > 0 
        ? Math.round(courseAnalytics.reduce((acc, course) => acc + course.completionRate(), 0) / courseAnalytics.length)
        : 0,
      topPerformers: employeeProgress
        .sort((a, b) => b.completionRate() - a.completionRate())
        .slice(0, 5),
      strugglingEmployees: employeeProgress
        .filter(emp => emp.completionRate() < 50)
        .sort((a, b) => a.completionRate() - b.completionRate())
    }
  }

  const getEngagementMetrics = () => {
    // Mock engagement data
    return {
      dailyActiveUsers: Math.floor(Math.random() * employees.length * 0.8),
      weeklyActiveUsers: Math.floor(employees.length * 0.9),
      monthlyActiveUsers: employees.length,
      averageSessionTime: Math.floor(Math.random() * 30) + 15, // minutes
      coursesStartedThisWeek: Math.floor(Math.random() * 20) + 5,
      certificatesEarnedThisWeek: Math.floor(Math.random() * 15) + 2
    }
  }

  const exportData = async (reportType) => {
    // Implementation for exporting different types of reports
    const data = {
      overview: getOverviewMetrics(),
      employees: generateEmployeeProgressData(),
      courses: generateCourseAnalytics(),
      engagement: getEngagementMetrics()
    }

    const exportData = data[reportType] || data.overview
    
    // Convert to CSV or Excel format
    const csvContent = convertToCSV(exportData)
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const convertToCSV = (data) => {
    if (!Array.isArray(data)) return ''
    
    const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'function')
    const csv = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' ? `"${value}"` : value
        }).join(',')
      )
    ].join('\n')
    
    return csv
  }

  return {
    loading,
    dateRange,
    setDateRange,
    companyStats,
    getOverviewMetrics,
    getEngagementMetrics,
    generateEmployeeProgressData,
    generateCourseAnalytics,
    exportData,
    refreshData
  }
}

