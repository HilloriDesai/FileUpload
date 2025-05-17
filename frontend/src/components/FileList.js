import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

/**
 * FileList component for displaying a list of uploaded files
 *
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onFileSelect - Optional callback when a file is selected
 */
const FileList = ({ onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // API configuration
  const API_URL = "http://localhost:8000";

  /**
   * Fetches the list of files from the API
   * @returns {Promise<void>}
   */
  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/files/`, {
        timeout: 10000, // 10 second timeout
      });

      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching files:", err);
      let errorMessage = "Failed to fetch files: ";

      if (err.response) {
        errorMessage +=
          err.response.data?.detail ||
          err.response.data?.error ||
          "Server error";
      } else if (err.request) {
        errorMessage += "No response from server";
      } else if (err.code === "ECONNABORTED") {
        errorMessage += "Request timed out";
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  /**
   * Formats the file size in a human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /**
   * Handles file selection
   * @param {Object} file - The selected file
   */
  const handleFileSelect = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative"
          role="alert"
        >
          <p>{error}</p>
          <button
            onClick={fetchFiles}
            className="mt-2 text-sm underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {files.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No files uploaded yet.</p>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="text-gray-800 font-medium">
                    {file.title}
                  </span>
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>{file.file_type.toUpperCase()}</span>
                    <span>
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={`/files/${file.id}`}
                  className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => handleFileSelect(file)}
                >
                  View
                </Link>
                <a
                  href={`${API_URL}/api/files/${file.id}/download`}
                  className="text-green-600 hover:text-green-800 px-3 py-2 rounded-md text-sm font-medium"
                  download
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

FileList.propTypes = {
  onFileSelect: PropTypes.func,
};

export default FileList;
