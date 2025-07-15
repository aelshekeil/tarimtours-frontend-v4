import React, { useCallback, useState } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    if (fileRejections.length > 0) {
      setError(t('dropzone.file_rejected'));
      setFile(null);
      return;
    }
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0];
      setFile(newFile);
      onFileChange(newFile);
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

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors duration-200 bg-white shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
      <div
        {...getRootProps()}
        className="w-full text-center"
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center text-green-600">
            <FileCheck size={48} className="mb-2" />
            <p className="text-sm font-medium">{t('dropzone.file_uploaded')}: {file.name}</p>
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
              <p className="text-sm font-medium">{t('dropzone.drop_files_here')}</p>
            ) : (
              <p className="text-sm font-medium">{t('dropzone.drag_drop_or_click')}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{t('dropzone.file_types')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropzone;
