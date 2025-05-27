import React from "react";
import SharedFileList from "../components/SharedFileList";

const SharedFilesPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Files Shared With Me</h1>
        <SharedFileList />
      </div>
    </div>
  );
};

export default SharedFilesPage;
