import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Typography from '../Typography';
import LoadingSpinner from '../LoadingSpinner';
import { FILE_UPLOAD } from '../../../constants';
import { TiUpload } from "react-icons/ti";
import './FileUpload.css';

/**
 * File Upload Component with drag & drop support
 * @param {Object} props
 * @param {Function} props.onFileSelect - Callback when file is selected
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 */
const FileUpload = ({ onFileSelect, loading = false, error = null }) => {
  const onDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        let errorMessage = 'File không hợp lệ';

        if (rejection.errors[0]?.code === 'file-too-large') {
          errorMessage = 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB';
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          errorMessage = 'Chỉ chấp nhận file Excel (.xlsx, .xls)';
        }

        onFileSelect(null, errorMessage);
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: FILE_UPLOAD.ACCEPTED_TYPES,
    maxSize: FILE_UPLOAD.MAX_SIZE,
    maxFiles: FILE_UPLOAD.MAX_FILES,
    disabled: loading
  });

  return (
    <div className="file-upload">
      <div
        {...getRootProps()}
        className={`file-upload__dropzone ${isDragActive ? 'file-upload__dropzone--active' : ''
          } ${loading ? 'file-upload__dropzone--disabled' : ''}`}
      >
        <input {...getInputProps()} />

        {loading ? (
          <div className="file-upload__loading">
            <LoadingSpinner size="lg" color="primary" />
            <Typography variant="body1" color="secondary" className="file-upload__loading-text">
              Đang xử lý file...
            </Typography>
          </div>
        ) : (
          <div className="file-upload__content">
            <div className="file-upload__icon">
              <TiUpload width={15} height={15} color='#3b82f6' />
            </div>

            <Typography variant="h4" color="primary" className="file-upload__title">
              {isDragActive ? 'Thả file Excel vào đây' : 'Tải lên file Excel'}
            </Typography>

            <Typography variant="body1" color="secondary" className="file-upload__description">
              Kéo thả file Excel (.xlsx, .xls) vào đây hoặc nhấp để chọn file
            </Typography>

            <Typography variant="body2" color="secondary" className="file-upload__note">
              File tối đa 10MB • Chỉ chấp nhận file Excel
            </Typography>
          </div>
        )}
      </div>

      {error && (
        <div className="file-upload__error">
          <Typography variant="body2" className="file-upload__error-text">
            ❌ {error}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
