import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles.css";

import PayPage from "./pages/PayPage";
import Cancelled from "./pages/Cancelled";
import Success from "./pages/Success";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/pay/demo" replace />} />
        <Route path="/pay/:paymentId" element={<PayPage />} />
        <Route path="/cancelled/:paymentId" element={<Cancelled />} />
        <Route path="/success/:paymentId" element={<Success />} />
      </Routes>
    </BrowserRouter>
  );
}
