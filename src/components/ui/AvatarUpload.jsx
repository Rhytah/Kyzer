// src/components/ui/AvatarUpload.jsx
import { useState, useRef } from 'react'
import { Camera, X, Upload } from 'lucide-react'
import { Button } from './Button'

export function AvatarUpload({ 
  currentAvatar, 
  onAvatarChange, 
  onAvatarRemove,
  size = 'large',
  disabled = false 
}) {
  const [preview, setPreview] = useState(currentAvatar)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32'
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    
    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      
      // Call parent handler
      await onAvatarChange(file)
    } catch (error) {
      console.error('Avatar upload failed:', error)
      alert('Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    setPreview(null)
    onAvatarRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex items-center gap-4">
      {/* Avatar Display */}
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-background-dark bg-background-light flex items-center justify-center`}>
          {preview ? (
            <img 
              src={preview} 
              alt="Profile avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-text-muted">
              <Camera size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} />
            </div>
          )}
        </div>

        {/* Upload Overlay */}
        {!disabled && (
          <button
            onClick={triggerFileSelect}
            disabled={isUploading}
            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 group"
          >
            <Camera 
              size={size === 'small' ? 14 : 16} 
              className="text-white group-hover:scale-110 transition-transform" 
            />
          </button>
        )}

        {/* Remove Button */}
        {preview && !disabled && (
          <button
            onClick={handleRemoveAvatar}
            className="absolute -top-2 -right-2 bg-error-default text-white rounded-full p-1 hover:bg-red-700 transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="small"
            onClick={triggerFileSelect}
            disabled={disabled || isUploading}
            className="flex items-center gap-2"
          >
            <Upload size={14} />
            {isUploading ? 'Uploading...' : 'Upload Photo'}
          </Button>
          
          {preview && (
            <Button
              variant="ghost"
              size="small"
              onClick={handleRemoveAvatar}
              disabled={disabled || isUploading}
              className="text-error-default hover:text-red-700"
            >
              Remove
            </Button>
          )}
        </div>
        
        <p className="text-xs text-text-muted">
          JPG, PNG or GIF. Max 5MB.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}