// src/components/course/CertificatePreviewModal.jsx
import { useState, useEffect } from 'react';
import { X, Download, Share2, Eye, Award } from 'lucide-react';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useCourseStore } from '@/store/courseStore';

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
    if (isOpen && userId && courseId) {
      loadCertificate();
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, userId, courseId]);

  const loadCertificate = async () => {
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
          console.error('Error generating certificate preview:', previewError);
          setError('Unable to generate certificate preview. You can still download the certificate.');
        }
      }
    } catch (error) {
      console.error('Error loading certificate:', error);
      setError('Unable to load certificate. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificateData) return;

    try {
      setDownloading(true);

      const { blob, filename } = await actions.generateCertificatePreview(certificateData.id);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && certificateData) {
      navigator.share({
        title: `${courseName} Certificate`,
        text: `I completed ${courseName} and earned my certificate!`,
        url: window.location.href
      });
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href);
      // Could add a toast notification here
    }
  };

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
                      console.error('Certificate image failed to load');
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
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-text-dark mb-3">Certificate Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-light">Recipient:</span>
                    <div className="font-medium">{certificateData.certificate_data?.user_name}</div>
                  </div>
                  <div>
                    <span className="text-text-light">Course:</span>
                    <div className="font-medium">{certificateData.certificate_data?.course_title}</div>
                  </div>
                  <div>
                    <span className="text-text-light">Completion Date:</span>
                    <div className="font-medium">{certificateData.certificate_data?.completion_date}</div>
                  </div>
                  <div>
                    <span className="text-text-light">Certificate ID:</span>
                    <div className="font-medium font-mono text-xs">{certificateData.certificate_data?.certificate_id}</div>
                  </div>
                </div>
              </div>
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