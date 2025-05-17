import React from "react";
import FileList from "../components/FileList";

const FilesPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">All Files</h1>
        <FileList />
      </div>
    </div>
  );
};

export default FilesPage;
