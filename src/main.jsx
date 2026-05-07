import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import ConversacionesPage from "./pages/ConversacionesPage.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/conversaciones" replace />} />
          <Route path="conversaciones" element={<ConversacionesPage />} />
          <Route path="*" element={<Navigate to="/conversaciones" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
