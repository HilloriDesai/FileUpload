import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import UploadPage from "./pages/UploadPage";
import FilesPage from "./pages/FilesPage";
import FileViewPage from "./pages/FileViewPage";
import Header from "./components/Header";
import BinPage from "./pages/BinPage";
import SharedFilesPage from "./pages/SharedFilesPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Toaster />
        <Header />
        <div className="container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/files" element={<FilesPage />} />
            <Route path="/bin" element={<BinPage />} />
            <Route path="/files/:fileId" element={<FileViewPage />} />
            <Route path="/shared" element={<SharedFilesPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
