// src/utils/certificateUtils.js
// Certificate utility functions for better code organization

/**
 * Validates certificate template data
 * @param {Object} templateData - The template data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateCertificateTemplate = (templateData) => {
  const errors = [];

  if (!templateData.name?.trim()) {
    errors.push('Template name is required');
  }

  if (!templateData.template_url?.trim()) {
    errors.push('Template image is required');
  }

  if (templateData.name && templateData.name.length > 255) {
    errors.push('Template name must be less than 255 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generates a unique certificate ID
 * @returns {string} - Unique certificate ID
 */
export const generateCertificateId = () => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `CERT-${timestamp}-${randomString}`;
};

/**
 * Formats certificate data for display
 * @param {Object} certificateData - Raw certificate data
 * @returns {Object} - Formatted certificate data
 */
export const formatCertificateData = (certificateData) => {
  if (!certificateData?.certificate_data) return null;

  const data = certificateData.certificate_data;

  return {
    recipient: data.user_name || 'Unknown',
    course: data.course_title || 'Unknown Course',
    completionDate: data.completion_date || new Date().toLocaleDateString(),
    issueDate: data.issue_date || new Date().toLocaleDateString(),
    certificateId: data.certificate_id || 'Unknown',
    instructor: data.instructor_name || 'Kyzer LMS',
    organization: data.organization_name || 'Kyzer LMS'
  };
};

/**
 * Gets default placeholder positions for certificate generation
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {Object} - Placeholder positions
 */
export const getDefaultPlaceholderPositions = (width, height) => {
  const centerX = width / 2;

  return {
    '{{user_name}}': { x: centerX, y: height * 0.45 },
    '{{course_title}}': { x: centerX, y: height * 0.55 },
    '{{completion_date}}': { x: centerX * 1.5, y: height * 0.75 },
    '{{certificate_id}}': { x: centerX * 0.5, y: height * 0.75 },
    '{{instructor_name}}': { x: centerX, y: height * 0.65 },
    '{{organization_name}}': { x: centerX, y: height * 0.25 },
    '{{issue_date}}': { x: centerX, y: height * 0.85 }
  };
};

/**
 * Gets default font styles for certificate text
 * @returns {Object} - Font styles
 */
export const getDefaultFontStyles = () => ({
  fillStyle: '#000000',
  textAlign: 'center',
  font: 'bold 24px Arial'
});

/**
 * Validates file for certificate template upload
 * @param {File} file - File to validate
 * @returns {Object} - Validation result
 */
export const validateTemplateFile = (file) => {
  const errors = [];
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];

  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push('File must be an image (JPEG, PNG, or SVG)');
  }

  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Creates a download link for a blob
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename for download
 */
export const downloadBlob = (blob, filename) => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Safely revokes an object URL
 * @param {string} url - The URL to revoke
 */
export const revokeObjectURL = (url) => {
  try {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error revoking object URL:', error);
  }
};

/**
 * Default certificate template placeholders
 */
export const DEFAULT_PLACEHOLDERS = [
  { key: '{{user_name}}', description: 'Full name of the certificate recipient' },
  { key: '{{course_title}}', description: 'Title of the completed course' },
  { key: '{{completion_date}}', description: 'Date when the course was completed' },
  { key: '{{issue_date}}', description: 'Date when the certificate was issued' },
  { key: '{{instructor_name}}', description: 'Name of the course instructor' },
  { key: '{{certificate_id}}', description: 'Unique certificate identifier' },
  { key: '{{organization_name}}', description: 'Name of the organization (if applicable)' }
];

/**
 * Error messages for common certificate operations
 */
export const CERTIFICATE_ERRORS = {
  TEMPLATE_NOT_FOUND: 'Certificate template not found',
  GENERATION_FAILED: 'Failed to generate certificate',
  UPLOAD_FAILED: 'Failed to upload certificate template',
  INVALID_DATA: 'Invalid certificate data provided',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  NETWORK_ERROR: 'Network error occurred. Please try again.',
  TIMEOUT: 'Operation timed out. Please try again.'
};

/**
 * Handles certificate-related errors with user-friendly messages
 * @param {Error} error - The error object
 * @param {string} operation - The operation that failed
 * @returns {string} - User-friendly error message
 */
export const handleCertificateError = (error, operation = 'operation') => {
  console.error(`Certificate ${operation} error:`, error);

  if (error.message?.includes('new row violates row-level security policy')) {
    return 'Permission denied. Please ensure you have the necessary permissions.';
  } else if (error.message?.includes('does not exist')) {
    return 'Database setup incomplete. Please contact your administrator.';
  } else if (error.message?.includes('Unauthorized')) {
    return 'Storage access denied. Please ensure proper configuration.';
  } else if (error.message?.includes('network') || error.name === 'NetworkError') {
    return CERTIFICATE_ERRORS.NETWORK_ERROR;
  } else if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
    return CERTIFICATE_ERRORS.TIMEOUT;
  } else if (error.message) {
    return `Failed to ${operation}: ${error.message}`;
  }

  return `Failed to ${operation}. Please try again.`;
};

/**
 * Validates if a user has permission to manage certificates
 * @param {Object} user - User object with role information
 * @returns {boolean} - Whether user can manage certificates
 */
export const canManageCertificates = (user) => {
  if (!user) return false;

  const allowedRoles = ['system_admin', 'instructor', 'admin'];
  return allowedRoles.includes(user.role) || user.permissions?.includes('manage_certificates');
};

/**
 * Creates a safe filename for certificate downloads
 * @param {string} courseName - Name of the course
 * @param {string} userName - Name of the user
 * @returns {string} - Safe filename
 */
export const createCertificateFilename = (courseName, userName) => {
  const safeCourse = courseName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Course';
  const safeUser = userName?.replace(/[^a-zA-Z0-9]/g, '_') || 'User';
  const timestamp = new Date().toISOString().split('T')[0];

  return `Certificate_${safeCourse}_${safeUser}_${timestamp}.png`;
};

/**
 * Default certificate template as a self-contained SVG data URL
 * This prevents DNS resolution issues with external placeholder services
 */
export const DEFAULT_CERTIFICATE_SVG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIiBzdHJva2U9IiNkZWUyZTYiIHN0cm9rZS13aWR0aD0iMiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iMzAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMzc0MTUxIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DZXJ0aWZpY2F0ZSBvZiBDb21wbGV0aW9uPC90ZXh0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNDUlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2Yjc0ODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPnt7dXNlcl9uYW1lfX08L3RleHQ+CiAgPHRleHQgeD0iNTAlIiB5PSI1NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzZiNzQ4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+e3tjb3Vyc2VfdGl0bGV9fTwvdGV4dD4KICA8dGV4dCB4PSI4MCUiIHk9Ijc1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj57e2NvbXBsZXRpb25fZGF0ZX19PC90ZXh0PgogIDx0ZXh0IHg9IjIwJSIgeT0iNzUlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPnt7Y2VydGlmaWNhdGVfaWR9fTwvdGV4dD4KPC9zdmc+';

/**
 * Checks if a URL is a problematic external placeholder and provides fallback
 * @param {string} url - The URL to check
 * @returns {string} - Original URL or fallback SVG
 */
export const sanitizeTemplateUrl = (url) => {
  if (!url) return DEFAULT_CERTIFICATE_SVG;

  // Check for problematic placeholder services
  const problematicDomains = [
    'via.placeholder.com',
    'placeholder.com',
    'placehold.it'
  ];

  const isDomainProblematic = problematicDomains.some(domain =>
    url.includes(domain)
  );

  if (isDomainProblematic) {
    console.warn('Replacing problematic placeholder URL with default SVG:', url);
    return DEFAULT_CERTIFICATE_SVG;
  }

  return url;
};