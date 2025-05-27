import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { showSuccessToast, showErrorToast } from "../services/toast";

/**
 * DeletedFileList component for displaying a list of deleted files
 *
 * @component
 * @param {Object} props - Component props
 */
const DeletedFileList = ({ onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // API configuration
  const API_URL = "http://localhost:8000";

  /**
   * Handles the file permanent delete operation
   * @param {string} fileId - The ID of the file to permanently delete
   */
  const handleFilePermanentDelete = async (fileId) => {
    console.log(`Permanently deleting file with ID: ${fileId}`);
    const response = await axios.delete(
      `${API_URL}/api/files/${fileId}/permanent_delete/`
    );
    if (response.status === 204) {
      showSuccessToast("File permanently deleted successfully");
    } else {
      showErrorToast("Failed to permanently delete file");
    }
  };

  /**
   * Handles the file restore operation
   * @param {string} fileId - The ID of the file to restore
   */
  const handleFileRestore = async (fileId) => {
    console.log(`Restoring file with ID: ${fileId}`);
    const response = await axios.post(
      `${API_URL}/api/files/${fileId}/restore/`
    );
    if (response.status === 200) {
      showSuccessToast("File restored successfully");
    } else {
      showErrorToast("Failed to restore file");
    }
  };

  /**
   * Fetches the list of files from the API
   * @returns {Promise<void>}
   */
  const fetchDeletedFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`${API_URL}/api/files/bin/`, {
        timeout: 10000, // 10 second timeout
      });
      console.log("bin data", response.data);
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
    fetchDeletedFiles();
  }, [fetchDeletedFiles]);

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
            onClick={fetchDeletedFiles}
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
                <button
                  className="text-green-600 hover:text-green-800 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => handleFileRestore(file.id)}
                >
                  Restore
                </button>
                <button
                  className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => handleFilePermanentDelete(file.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

DeletedFileList.propTypes = {
  onFileSelect: PropTypes.func,
};

export default DeletedFileList;
