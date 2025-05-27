import React from "react";
import DeletedFileList from "../components/DeletedFileList";

const BinPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Deleted Files</h1>
        <DeletedFileList />
      </div>
    </div>
  );
};

export default BinPage;
