import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import FileUp from 'lucide-react/dist/esm/icons/file-up';
import FileCheck from 'lucide-react/dist/esm/icons/file-check';
import FileX from 'lucide-react/dist/esm/icons/file-x';
import PlusCircle from 'lucide-react/dist/esm/icons/plus-circle';

interface MultiFileDropzoneProps {
  onFileChange: (files: File[]) => void;
  label: string;
}

const MultiFileDropzone: React.FC<MultiFileDropzoneProps> = ({ onFileChange, label }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    if (fileRejections.length > 0) {
      setError(t('common.dropzone.file_rejected'));
      return;
    }
    if (acceptedFiles.length > 0) {
      const newFiles = [...files, ...acceptedFiles];
      setFiles(newFiles);
      onFileChange(newFiles);
      acceptedFiles.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviews(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }, [files, onFileChange, t]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 5242880, // 5MB
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    noClick: true,
  });

  useEffect(() => {
    // Revoke the data uris to avoid memory leaks
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors duration-200 bg-white shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
      <div {...getRootProps()} className="w-full text-center">
        <input {...getInputProps()} />
        <div className="grid grid-cols-3 gap-2 mb-2">
          {previews.map((preview, index) => (
            <img key={index} src={preview} alt={`Preview ${index}`} className="w-full h-auto" />
          ))}
        </div>
        {files.length > 0 ? (
          <div className="flex flex-col items-center text-green-600">
            <FileCheck size={48} className="mb-2" />
            <p className="text-sm font-medium">{t('common.dropzone.files_uploaded', { count: files.length })}</p>
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
      <button type="button" onClick={open} className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        <PlusCircle size={20} className="mr-2" />
        {t('common.add_more_files')}
      </button>
    </div>
  );
};

export default MultiFileDropzone;
