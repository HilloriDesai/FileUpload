import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:8000";

const FileView = ({ file, content, error, onDownload }) => {
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        {error}
        <button
          onClick={() => navigate("/")}
          className="block mx-auto mt-4 text-blue-600 hover:text-blue-800"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{file.title}</h1>
          <div className="space-x-4">
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Download
            </button>
            <button
              onClick={() => navigate("/files")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Back to Files
            </button>
          </div>
        </div>

        <div className="mt-4">
          {file.file_type === "jpg" || file.file_type === "png" ? (
            <img
              src={file.file_url}
              alt={file.title}
              className="max-w-full h-auto rounded"
            />
          ) : file.file_type === "txt" ? (
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
              {content}
            </pre>
          ) : file.file_type === "json" ? (
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
              {JSON.stringify(content, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-600">
              Preview not available for this file type. Please download to view.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileView;
