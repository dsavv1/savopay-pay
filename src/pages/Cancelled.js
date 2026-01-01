import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function Cancelled() {
  const nav = useNavigate();
  const { paymentId: paymentIdParam } = useParams();
  const [searchParams] = useSearchParams();

  const paymentId = paymentIdParam || searchParams.get("payment_id") || "";

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h2>Payment cancelled</h2>
      <p>The payment was cancelled or not completed.</p>

      {paymentId ? (
        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div>
            <p style={{ marginBottom: 8 }}>
              Payment ID: <b>{paymentId}</b>
            </p>

            <button
              onClick={() => nav(`/pay/${paymentId}`)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                cursor: "pointer"
              }}
            >
              Try again
            </button>
          </div>

          <button
            onClick={() => nav(`/`)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              cursor: "pointer"
            }}
          >
            Back to POS
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => nav(`/`)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ddd",
              cursor: "pointer"
            }}
          >
            Back to POS
          </button>
        </div>
      )}
    </div>
  );
}
