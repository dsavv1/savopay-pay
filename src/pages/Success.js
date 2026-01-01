import React from "react";
import { Link, useParams } from "react-router-dom";

export default function Success() {
  const { paymentId } = useParams();
  return (
    <div className="wrap">
      <div className="card" style={{ maxWidth: 680, width: "100%" }}>
        <div className="header">
          <div className="brand">
            <div className="logo" />
            <div>
              <div className="title">Payment confirmed</div>
              <div className="sub">You can close this page.</div>
            </div>
          </div>
          <div className="pill">
            <span className="dot good" />
            <span>Success</span>
          </div>
        </div>

        <div className="content">
          <div className="muted">Reference</div>
          <div style={{ fontWeight: 900, marginBottom: 16 }}>{paymentId}</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn2" to={`/pay/${paymentId}`}>V