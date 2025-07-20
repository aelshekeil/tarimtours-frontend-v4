import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import FileUp from 'lucide-react/dist/esm/icons/file-up';
import FileCheck from 'lucide-react/dist/esm/icons/file-check';
import FileX from 'lucide-react/dist/esm/icons/file-x';

interface DropzoneProps {
  onFileChange: (file: File) => void;
  label: string;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFileChange, label }) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    if (fileRejections.length > 0) {
      setError(t('common.dropzone.file_rejected'));
      setFile(null);
      setPreview(null);
      return;
    }
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0];
      setFile(newFile);
      onFileChange(newFile);
      if (newFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(newFile);
      } else {
        setPreview(null);
      }
    }
  }, [onFileChange, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 5242880, // 5MB
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
  });

  useEffect(() => {
    // Revoke the data uris to avoid memory leaks
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors duration-200 bg-white shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
      <div
        {...getRootProps()}
        className="w-full text-center"
      >
        <input {...getInputProps()} />
        {preview && (
          <div className="mb-2">
            <img src={preview} alt="Preview" className="mx-auto" />
          </div>
        )}
        {file ? (
          <div className="flex flex-col items-center text-green-600">
            <FileCheck size={48} className="mb-2" />
            <p className="text-sm font-medium">{t('common.dropzone.file_uploaded')}: {file.name}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-red-600">
            <FileX size={48} className="mb-2" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <FileUp size={48} className="mb-2" />
            {isDragActive ? (
              <p className="text-sm font-medium">{t('common.dropzone.drop_files_here')}</p>
            ) : (
              <p className="text-sm font-medium">{t('common.dropzone.drag_drop_or_click')}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{t('common.dropzone.file_types')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropzone;
