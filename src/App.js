import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./HomePage";
import UploadPage from "./UploadPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route → HomePage */}
        <Route path="/" element={<HomePage />} />

        {/* Upload page */}
        <Route path="/upload" element={<UploadPage />} />

        {/* Catch-all → redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
