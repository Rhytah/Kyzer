// src/components/course/CertificatePreview.jsx
import { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useCourseStore } from '@/store/courseStore';
import { CERTIFICATE_THEMES } from '@/utils/certificateUtils';

export default function CertificatePreview({ 
  certificateData, 
  theme = 'classic',
  showWatermark = true,
  logoUrl = null,
  logoPosition = 'top-left',
  onDownload,
  className = ''
}) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const actions = useCourseStore(state => state.actions);

  useEffect(() => {
    if (certificateData) {
      generatePreview();
    }
  }, [certificateData, theme, showWatermark, logoUrl, logoPosition]);

  const generatePreview = async () => {
    if (!certificateData) return;

    setLoading(true);
    setError(null);

    try {
      // Generate preview directly with logo support
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = 800;
      canvas.height = 600;

      // Import certificate utilities
      const { 
        getDefaultPlaceholderPositions, 
        getFontStyles, 
        calculateTextLayout,
        drawCertificateBorder,
        drawWatermark,
        drawLogo,
        DEFAULT_CERTIFICATE_SVG
      } = await import('@/utils/certificateUtils');

      // Create a white background for the certificate
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add decorative border and watermark
      drawCertificateBorder(ctx, canvas.width, canvas.height, theme);
      if (showWatermark) {
        drawWatermark(ctx, canvas.width, canvas.height);
      }

      // Add logo if provided
      if (logoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => {
          drawLogo(ctx, logoImg, logoPosition, canvas.width, canvas.height);
        };
        logoImg.src = logoUrl;
      }

      // Add organization name/header at the top
      const organizationStyles = getFontStyles(theme, 'small');
      ctx.fillStyle = organizationStyles.fillStyle;
      ctx.textAlign = 'center';
      ctx.font = `bold ${organizationStyles.font.split('px')[0]}px ${organizationStyles.font.split('px')[1]}`;
      const orgName = certificateData.organization_name || 'Leadwise Academy';
      ctx.fillText(orgName, canvas.width / 2, canvas.height * 0.12);

      // Add "Certificate of Completion" title - lowered to make room for header
      const titleStyles = getFontStyles(theme, 'title');
      ctx.fillStyle = titleStyles.fillStyle;
      ctx.textAlign = titleStyles.textAlign;
      ctx.font = titleStyles.font;
      ctx.fillText('Certificate of Completion', canvas.width / 2, canvas.height * 0.3);

      // Get positioning and add text
      const positions = getDefaultPlaceholderPositions(canvas.width, canvas.height, theme);

      // Fill in the placeholders with enhanced styling
      Object.keys(positions).forEach(placeholder => {
        // Skip organization_name as it's already rendered at the top
        if (placeholder === '{{organization_name}}') return;
        
        const position = positions[placeholder];
        const textType = position.textType || 'body';
        const value = certificateData[placeholder.replace(/[{}]/g, '')];

        if (value) {
          // Get theme-specific font styling
          const fontStyles = getFontStyles(theme, textType);
          
          // Apply font styles
          ctx.fillStyle = fontStyles.fillStyle;
          ctx.textAlign = fontStyles.textAlign;
          ctx.font = fontStyles.font;
          
          // Calculate text layout for long text
          const maxWidth = canvas.width * 0.8;
          const textLayout = calculateTextLayout(value, maxWidth, fontStyles.font);
          
          // Draw text with proper line breaks
          textLayout.lines.forEach((line, index) => {
            const y = position.y + (index * textLayout.lineHeight);
            ctx.fillText(line, position.x, y);
          });
        }
      });

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        } else {
          setError('Failed to generate preview image');
        }
      }, 'image/png');
      
    } catch (err) {
      setError('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload(theme);
    }
  };

  const handleRefresh = () => {
    generatePreview();
  };

  if (loading) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <LoadingSpinner size="lg" />
        <p className="text-text-light mt-4">Generating certificate preview...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <div className="text-red-600 mb-4">
          <RefreshCw className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-text-dark mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary-default" />
          <h3 className="font-semibold text-text-dark">Certificate Preview</h3>
          <span className="text-sm text-text-muted">({CERTIFICATE_THEMES[theme]?.name || 'Classic'} Theme)</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-4">
        {previewUrl ? (
          <div className="space-y-4">
            {/* Certificate Image */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <img
                src={previewUrl}
                alt="Certificate Preview"
                className="w-full h-auto max-h-96 object-contain"
                style={{ aspectRatio: '4/3' }}
              />
            </div>

            {/* Theme Details */}
            {showDetails && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-text-dark mb-3">Theme Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-muted">Theme:</span>
                    <div className="font-medium">{CERTIFICATE_THEMES[theme]?.name}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Description:</span>
                    <div className="font-medium">{CERTIFICATE_THEMES[theme]?.description}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Title Font:</span>
                    <div className="font-medium">{CERTIFICATE_THEMES[theme]?.fonts.title.family.split(',')[0]}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Body Font:</span>
                    <div className="font-medium">{CERTIFICATE_THEMES[theme]?.fonts.body.family.split(',')[0]}</div>
                  </div>
                  <div>
                    <span className="text-text-muted">Primary Color:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: CERTIFICATE_THEMES[theme]?.colors.primary }}
                      />
                      <span className="font-mono text-xs">{CERTIFICATE_THEMES[theme]?.colors.primary}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-text-muted">Accent Color:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: CERTIFICATE_THEMES[theme]?.colors.accent }}
                      />
                      <span className="font-mono text-xs">{CERTIFICATE_THEMES[theme]?.colors.accent}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-text-light">No preview available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
