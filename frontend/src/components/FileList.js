import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { showSuccessToast, showErrorToast } from "../services/toast";

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
  const [isSharing, setIsSharing] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  // API configuration
  const API_URL = "http://localhost:8000";

  /**
   * Handles the file move to bin operation
   * @param {string} fileId - The ID of the file to move to bin
   */
  const handleFileMoveToBin = async (fileId) => {
    console.log(`Moving file with ID: ${fileId} to bin`);
    const response = await axios.post(
      `${API_URL}/api/files/${fileId}/move_to_bin/`
    );
    if (response.status === 200) {
      showSuccessToast("File moved to bin successfully");
    } else {
      showErrorToast("Failed to move file to bin");
    }
  };

  /**
   * Handles the file share operation
   * @param {string} fileId - The ID of the file to share
   */
  const handleShareFile = async () => {
    const response = await axios.post(
      `${API_URL}/api/files/${selectedFileId}/share_file/`,
      { userIds: selectedUsers },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 200) {
      showSuccessToast("File shared successfully");
      setIsSharing(false);
      setSelectedUsers([]);
      setSelectedFileId(null);
    } else {
      showErrorToast("Failed to share file");
    }
  };

  /**
   * Shows the user selection modal
   */
  const showUserSelection = async (fileId, fileName) => {
    //  First fetch the list of users
    const usersResponse = await axios.get(`${API_URL}/api/files/list_users/`);
    const users = usersResponse.data;
    console.log(users);
    setUsers(users);
    setIsSharing(true);
    setSelectedFileId(fileId);
    setSelectedFileName(fileName);
  };

  /**
   * Handles user selection
   * @param {string} user - The user to select
   */
  const handleUserSelect = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== user));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  /**
   * Closes the sharing modal and resets state
   */
  const closeSharingModal = () => {
    setIsSharing(false);
    setSelectedUsers([]);
    setSelectedFileId(null);
    setSelectedFileName("");
  };

  /**
   * Fetches the list of files from the API
   * @returns {Promise<void>}
   */
  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ownerId = "hilloridesai@gmail.com";
      // Set ownerId in headers
      const response = await axios.get(
        `${API_URL}/api/files/list_restored/?ownerId=${ownerId}`,
        {
          timeout: 10000, // 10 second timeout
        }
      );

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
                <button
                  className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => showUserSelection(file.id, file.title)}
                >
                  Share
                </button>
                <button
                  className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => handleFileMoveToBin(file.id)}
                >
                  Move to Bin
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {isSharing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Share "{selectedFileName}"
              </h3>
              <button
                onClick={closeSharingModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Select users to share with:
              </p>
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {users.map((user) => (
                  <label
                    key={user}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user)}
                      onChange={() => handleUserSelect(user)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{user}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeSharingModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleShareFile}
                disabled={selectedUsers.length === 0}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  selectedUsers.length === 0
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                Share with {selectedUsers.length}{" "}
                {selectedUsers.length === 1 ? "user" : "users"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

FileList.propTypes = {
  onFileSelect: PropTypes.func,
};

export default FileList;
