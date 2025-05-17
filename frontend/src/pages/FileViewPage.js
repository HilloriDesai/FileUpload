import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FileView from "../components/FileView";

const API_URL = "http://localhost:8000";

const FileViewPage = () => {
  const { fileId } = useParams();
  const [file, setFile] = useState(null);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFileDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/files/${fileId}/`);
      setFile(response.data);

      // Fetch file content based on file type
      if (
        response.data.file_type === "txt" ||
        response.data.file_type === "json"
      ) {
        const contentResponse = await axios.get(
          `${API_URL}/api/files/${fileId}/content/`
        );
        setContent(contentResponse.data);
      }
    } catch (err) {
      setError("Failed to load file");
      console.error("Error loading file:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFileDetails();
  }, [fileId]);

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/files/${fileId}/download/`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download file");
      console.error("Error downloading file:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <FileView
      file={file}
      content={content}
      error={error}
      onDownload={handleDownload}
    />
  );
};

export default FileViewPage;
