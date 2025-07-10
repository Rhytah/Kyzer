import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";

function TestPage() {
  return (
    <div className="p-4">
      <h2 className="text-lg">Test Page - No Preamble Error!</h2>
      <p className="text-gray-600">
        If you see this, the preamble error is fixed.
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="*" element={<TestPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
