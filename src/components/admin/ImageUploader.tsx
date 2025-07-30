import React, { useState } from 'react';
import { Upload, X, Link } from 'lucide-react';
import Dropzone from '../forms/Dropzone';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  value, 
  onChange, 
  label = "Image", 
  placeholder = "https://example.com/image.jpg" 
}) => {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);

    try {
      // Create a temporary URL for the uploaded file
      // In a real application, you would upload to a cloud storage service
      const tempUrl = URL.createObjectURL(file);
      
      // For now, we'll use a placeholder service or local storage
      // You can replace this with actual upload logic to your preferred service
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll use the temporary URL
      // In production, replace this with the actual uploaded URL
      onChange(tempUrl);
      
      // Show success message
      alert('Image uploaded successfully! Note: In production, this would be uploaded to cloud storage.');
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    onChange('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {/* Mode Toggle */}
      <div className="flex mb-3 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
            uploadMode === 'url'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Link className="w-4 h-4 inline mr-2" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
            uploadMode === 'upload'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload
        </button>
      </div>

      {/* URL Input Mode */}
      {uploadMode === 'url' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={placeholder}
            />
            {value && (
              <button
                type="button"
                onClick={clearImage}
                className="px-3 py-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {uploadMode === 'upload' && (
        <div className="space-y-3">
          <Dropzone
            onFileChange={handleFileUpload}
            label="Drop an image here or click to browse"
          />
          {uploading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">Uploading...</span>
            </div>
          )}
        </div>
      )}

      {/* Image Preview */}
      {value && (
        <div className="mt-3">
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="max-w-full h-32 object-cover rounded-lg border border-gray-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click the X to remove the image
          </p>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-2">
        {uploadMode === 'url' 
          ? 'Enter a direct URL to an image file'
          : 'Upload an image from your computer (PNG, JPG, GIF, WebP)'
        }
      </p>
    </div>
  );
};

export default ImageUploader;