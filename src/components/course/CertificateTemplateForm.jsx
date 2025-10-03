// src/components/course/CertificateTemplateForm.jsx
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Upload, X, Eye, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { uploadFile, STORAGE_BUCKETS, supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui';
import {
  validateCertificateTemplate,
  validateTemplateFile,
  revokeObjectURL,
  handleCertificateError,
  sanitizeTemplateUrl
} from '@/utils/certificateUtils';

export default function CertificateTemplateForm({
  template = null,
  availablePlaceholders = [],
  onSubmit,
  onCancel
}) {
  const { success, error: showError } = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    template_url: template?.template_url || '',
    placeholders: template?.placeholders || {},
    is_default: template?.is_default || false
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    template?.template_url ? sanitizeTemplateUrl(template.template_url) : ''
  );
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPlaceholders, setSelectedPlaceholders] = useState(
    template?.placeholders ? Object.keys(template.placeholders) : []
  );

  // Cleanup effect for memory leak prevention
  useEffect(() => {
    return () => {
      revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file using utility function
    const validation = validateTemplateFile(file);
    if (!validation.isValid) {
      showError(validation.errors[0]);
      return;
    }

    setUploadedFile(file);

    // Clean up previous preview URL using utility function
    revokeObjectURL(previewUrl);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [previewUrl, showError]);

  const handlePlaceholderToggle = useCallback((placeholder) => {
    setSelectedPlaceholders(prev => {
      const newSelected = prev.includes(placeholder.key)
        ? prev.filter(p => p !== placeholder.key)
        : [...prev, placeholder.key];

      // Update placeholders in form data
      const newPlaceholders = {};
      newSelected.forEach(key => {
        const placeholderInfo = availablePlaceholders.find(p => p.key === key);
        if (placeholderInfo) {
          newPlaceholders[key] = placeholderInfo.description;
        }
      });

      setFormData(prev => ({
        ...prev,
        placeholders: newPlaceholders
      }));

      return newSelected;
    });
  }, [availablePlaceholders]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data using utility function
    const validation = validateCertificateTemplate(formData);
    if (!validation.isValid) {
      showError(validation.errors[0]);
      return;
    }

    setIsUploading(true);

    try {
      let templateUrl = formData.template_url;

      // Upload file if a new one was selected
      if (uploadedFile) {
        const fileName = `certificate-template-${Date.now()}-${uploadedFile.name}`;
        const uploadResult = await uploadFile(
          STORAGE_BUCKETS.CERTIFICATES,
          fileName,
          uploadedFile
        );

        if (uploadResult) {
          // Get the public URL
          const { data } = supabase.storage
            .from(STORAGE_BUCKETS.CERTIFICATES)
            .getPublicUrl(uploadResult.path);

          templateUrl = data.publicUrl;
        } else {
          throw new Error('Failed to upload template file');
        }
      }

      // Prepare form data
      const submissionData = {
        ...formData,
        template_url: templateUrl
      };

      await onSubmit(submissionData);
    } catch (error) {
      const operation = template ? 'update template' : 'create template';
      const errorMessage = handleCertificateError(error, operation);
      showError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-dark">
                {template ? 'Edit Certificate Template' : 'Create Certificate Template'}
              </h2>
              <Button type="button" variant="ghost" onClick={onCancel}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-6">
                {/* Basic Information */}
                <Card className="p-4">
                  <h3 className="font-semibold text-text-dark mb-4">Basic Information</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                        placeholder="e.g., Modern Certificate Template"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default"
                        placeholder="Describe this certificate template..."
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_default"
                        checked={formData.is_default}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-default focus:ring-primary-default border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-text-dark">
                        Set as default template
                      </label>
                    </div>
                  </div>
                </Card>

                {/* Template Upload */}
                <Card className="p-4">
                  <h3 className="font-semibold text-text-dark mb-4">Template Image</h3>

                  <div className="space-y-4">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-default transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-text-medium mb-1">
                        Click to upload certificate template
                      </p>
                      <p className="text-xs text-text-light">
                        PNG, JPG up to 5MB
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {previewUrl && (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Template preview"
                          className="w-full h-32 object-cover border border-gray-200 rounded"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 bg-white shadow-sm"
                          onClick={() => {
                            revokeObjectURL(previewUrl);
                            setPreviewUrl('');
                            setUploadedFile(null);
                            setFormData(prev => ({ ...prev, template_url: '' }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Right Column - Placeholders */}
              <div className="space-y-6">
                <Card className="p-4">
                  <h3 className="font-semibold text-text-dark mb-4">Dynamic Fields</h3>

                  <div className="mb-4">
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800">
                          Select the placeholders you want to use in your certificate template.
                          These will be automatically replaced with actual data when certificates are generated.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {availablePlaceholders.map((placeholder) => (
                      <div
                        key={placeholder.key}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPlaceholders.includes(placeholder.key)
                            ? 'border-primary-default bg-primary-light'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePlaceholderToggle(placeholder)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedPlaceholders.includes(placeholder.key)}
                            onChange={() => handlePlaceholderToggle(placeholder)}
                            className="h-4 w-4 text-primary-default focus:ring-primary-default border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {placeholder.key}
                            </code>
                            <p className="text-xs text-text-light mt-1">
                              {placeholder.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Preview Selected */}
                {selectedPlaceholders.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-medium text-text-dark mb-3">Selected Placeholders</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlaceholders.map((key) => (
                        <span
                          key={key}
                          className="bg-primary-light text-primary-dark text-xs px-2 py-1 rounded"
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading || !formData.name}>
                {isUploading ? 'Uploading...' : (template ? 'Update Template' : 'Create Template')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}