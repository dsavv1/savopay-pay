import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles.css";
import NewPayment from "./pages/NewPayment";
import PayPage from "./pages/PayPage";
import Cancelled from "./pages/Cancelled";
import Success from "./pages/Success";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewPayment />} />
        <Route path="/pay/:paymentId" element={<PayPage />} />
        <Route path="/cancelled/:paymentId" element={<Cancelled />} />
        <Route path="/success/:paymentId" element={<Success />} />
      </Routes>
    </BrowserR