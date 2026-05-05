import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import CallsPage from "./pages/CallsPage.jsx";
import AddCallPage from "./pages/AddCallPage.jsx";
import CallDetailPage from "./pages/CallDetailPage.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/calls" replace />} />
          <Route path="calls" element={<CallsPage />} />
          <Route path="calls/new" element={<AddCallPage />} />
          <Route path="calls/:id" element={<CallDetailPage />} />
          <Route path="*" element={<Navigate to="/calls" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
