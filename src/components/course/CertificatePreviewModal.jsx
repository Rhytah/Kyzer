// src/components/course/CertificatePreviewModal.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Download, Share2, Eye, Award } from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useCourseStore } from '@/store/courseStore';
import {
  formatCertificateData,
  downloadBlob,
  revokeObjectURL,
  handleCertificateError
} from '@/utils/certificateUtils';

export default function CertificatePreviewModal({
  courseId,
  courseName,
  userId,
  isOpen,
  onClose
}) {
  const actions = useCourseStore(state => state.actions);
  const [certificateData, setCertificateData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (isOpen && userId && courseId && mounted) {
        await loadCertificate();
      }
    };

    loadData();

    return () => {
      mounted = false;
      revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    };
  }, [isOpen, userId, courseId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const loadCertificate = useCallback(async () => {
    if (!userId || !courseId) return;

    try {
      setLoading(true);
      setError(null);

      // Get the user's certificate for this course
      const { data: userCertificate } = await actions.getCertificateForCourse(userId, courseId);

      if (userCertificate) {
        setCertificateData(userCertificate);

        // Generate preview with error handling
        try {
          const { blob, url } = await actions.generateCertificatePreview(userCertificate.id);
          setPreviewUrl(url);
        } catch (previewError) {
          setError('Unable to generate certificate preview. You can still download the certificate.');
        }
      }
    } catch (error) {
      const errorMessage = handleCertificateError(error, 'load certificate');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, courseId, actions]);

  const handleDownload = useCallback(async () => {
    if (!certificateData) return;

    try {
      setDownloading(true);

      const { blob, filename } = await actions.generateCertificatePreview(certificateData.id);

      // Use utility function for download
      downloadBlob(blob, filename);
    } catch (error) {
      const errorMessage = handleCertificateError(error, 'download certificate');
      setError(errorMessage);
    } finally {
      setDownloading(false);
    }
  }, [certificateData, actions]);

  const handleShare = useCallback(() => {
    if (navigator.share && certificateData) {
      navigator.share({
        title: `${courseName} Certificate`,
        text: `I completed ${courseName} and earned my certificate!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  }, [courseName, certificateData]);

  // Memoized certificate details for performance using utility function
  const certificateDetails = useMemo(() => {
    if (!certificateData) return null;

    const formattedData = formatCertificateData(certificateData);
    if (!formattedData) return null;

    return [
      {
        label: 'Recipient',
        value: formattedData.recipient
      },
      {
        label: 'Course',
        value: formattedData.course
      },
      {
        label: 'Completion Date',
        value: formattedData.completionDate
      },
      {
        label: 'Issue Date',
        value: formattedData.issueDate
      },
      {
        label: 'Certificate ID',
        value: formattedData.certificateId,
        isMonospace: true
      },
      {
        label: 'Instructor',
        value: formattedData.instructor
      },
      {
        label: 'Organization',
        value: formattedData.organization
      }
    ].filter(item => item.value && item.value !== 'Unknown');
  }, [certificateData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-dark">Course Certificate</h2>
            <p className="text-text-light">{courseName}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-text-light mt-4">Generating certificate preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-text-dark mb-2">Error Loading Certificate</h3>
                <p className="text-text-light mb-4">{error}</p>
                <Button onClick={loadCertificate} variant="secondary">
                  Try Again
                </Button>
              </div>
            </div>
          ) : !certificateData ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-dark mb-2">No Certificate Found</h3>
                <p className="text-text-light">
                  Complete this course to earn your certificate.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Certificate Preview */}
              {previewUrl ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Certificate Preview"
                    className="w-full h-auto"
                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                    onError={() => {
                      setError('Certificate preview failed to load, but you can still download it.');
                    }}
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
                  <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-text-light">Certificate preview not available</p>
                  <p className="text-sm text-text-light mt-2">You can still download your certificate below</p>
                </div>
              )}

              {/* Certificate Details */}
              {certificateDetails && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-text-dark mb-3">Certificate Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {certificateDetails.map((detail, index) => (
                      <div key={detail.label}>
                        <span className="text-text-light">{detail.label}:</span>
                        <div className={`font-medium ${detail.isMonospace ? 'font-mono text-xs' : ''}`}>
                          {detail.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {certificateData && (
          <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}