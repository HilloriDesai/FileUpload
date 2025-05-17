import React, { useState, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { showSuccessToast, showErrorToast } from "../services/toast";

/**
 * Supported file types and their extensions
 * @constant
 */
const SUPPORTED_FILE_TYPES = {
  "text/plain": ".txt",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/json": ".json",
};

/**
 * Maximum file size in bytes (5MB)
 * @constant
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * FileUpload component for handling file selection and upload
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onUploadSuccess - Callback function called after successful upload
 */
const FileUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // API configuration
  const API_URL = "http://localhost:8000";

  /**
   * Validates the selected file
   * @param {File} file - The file to validate
   * @returns {string|null} Error message if validation fails, null otherwise
   */
  const validateFile = useCallback((file) => {
    if (!file) return "No file selected";

    if (!SUPPORTED_FILE_TYPES[file.type]) {
      return "Unsupported file type. Please upload txt, jpg, png, or json files.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds the maximum limit of ${
        MAX_FILE_SIZE / (1024 * 1024)
      }MB`;
    }

    return null;
  }, []);

  /**
   * Handles file selection
   * @param {Event} event - File input change event
   */
  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];
      setError(null);
      setSelectedFile(null);
      setPreviewUrl(null);

      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        showErrorToast(validationError);
        return;
      }

      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        // Cleanup URL when component unmounts or file changes
        return () => URL.revokeObjectURL(url);
      }
    },
    [validateFile]
  );

  /**
   * Handles file upload
   */
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", selectedFile.name);

    try {
      const response = await axios.post(`${API_URL}/api/files/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Add timeout to prevent hanging requests
        timeout: 30000,
      });

      console.log("Upload response:", response.data);
      setSelectedFile(null);
      setPreviewUrl(null);
      showSuccessToast("File uploaded successfully!");

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      let errorMessage = "Upload failed: ";

      if (err.response) {
        // Server responded with error
        errorMessage +=
          err.response.data?.detail ||
          err.response.data?.error ||
          "Unknown server error";
      } else if (err.request) {
        // Request made but no response
        errorMessage +=
          "No response from server. Please check if the backend is running.";
      } else if (err.code === "ECONNABORTED") {
        errorMessage += "Request timed out. Please try again.";
      } else {
        // Other errors
        errorMessage += err.message;
      }

      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handles file upload cancellation
   */
  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  }, []);

  return (
    <div className="mb-6">
      <label className="block mb-2 text-gray-700 font-medium">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="mt-1 block w-full rounded border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          accept=".txt,.jpg,.jpeg,.png,.json"
          aria-label="Select file to upload"
        />
      </label>

      {/* Preview Section */}
      {selectedFile && (
        <div className="mt-4 flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="File preview"
              className="w-20 h-20 object-cover rounded shadow"
            />
          ) : (
            <div className="flex flex-col">
              <span className="font-semibold">{selectedFile.name}</span>
              <span className="text-sm text-gray-500">{selectedFile.type}</span>
              <span className="text-xs text-gray-400">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}

          <button
            onClick={handleFileUpload}
            disabled={isUploading}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            aria-label={isUploading ? "Uploading file..." : "Upload file"}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>

          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            aria-label="Cancel upload"
          >
            Cancel
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-600 mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

FileUpload.propTypes = {
  onUploadSuccess: PropTypes.func,
};

export default FileUpload;
