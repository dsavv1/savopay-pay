import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

export default function Cancelled() {
  const { paymentId: paymentIdParam } = useParams();
  const [searchParams] = useSearchParams();

  const paymentId = paymentIdParam || searchParams.get("payment_id") || "";

  return (
    <div className="wrap">
      <div className="card" style={{ maxWidth: 680, width: "100%" }}>
        <div className="header">
          <div className="brand">
            <div className="logo" />
            <div>
              <div className="title">Payment cancelled</div>
              <div className="sub">The payment was cancelled or not completed.</div>
            </div>
          </div>
          <div className="pill">
            <span className="dot" />
            <span>Cancelled</span>
          </div>
        </div>

        <div className="content">
          {paymentId ? (
            <>
              <div className="muted">Reference</div>
              <div style={{ fontWeight: 900, marginBottom: 16 }}>{paymentId}</div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link className="btn2" to