import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE, fetchPaymentById } from "../api";

export default function PayPage() {
  const { paymentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!paymentId || paymentId === "demo") {
        if (!alive) return;
        setLoading(false);
        setError("");
        setPayment(null);
        return;
      }

      try {
        if (!alive) return;
        setLoading(true);
        setError("");

        const data = await fetchPaymentById(paymentId);
        if (!alive) return;

        setPayment(data);
      } catch (e) {
        if (!alive) return;
        setPayment(null);
        setError(e?.message || "Failed to load payment");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [paymentId]);

  const checkoutUrl = payment?.access_url || "";

  if (!paymentId || paymentId === "demo") {
    return (
      <div style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
        <h2>SavoPay Payment</h2>
        <p>You are on <b>/pay/demo</b>.</p>
        <p>Open a real payment like:</p>
        <p style={{ fontFamily: "monospace" }}>
          /pay/3229830b-7149-4887-bfce-2d0887a6f56a
        </p>
        <p style={{ marginTop: 12 }}>
          API base: <span style={{ fontFamily: "monospace" }}>{API_BASE}</span>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <h2>Payment</h2>

      <div style={{ fontFamily: "monospace", fontSize: 13, marginBottom: 12 }}>
        <div>paymentId: {paymentId}</div>
        <div>API: {API_BASE}</div>
      </div>

      {loading && <p>Loading…</p>}
      {!loading && error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && payment && (
        <>
          <p><b>Status:</b> {payment.status || payment.state}</p>
          <p><b>Fiat:</b> {payment.invoice_amount} {payment.invoice_currency}</p>
          <p><b>Crypto:</b> {payment.crypto_amount} {payment.currency}</p>

          <div style={{ marginTop: 16 }}>
            <button
              disabled={!checkoutUrl}
              onClick={() => window.open(checkoutUrl, "_blank", "noopener,noreferrer")}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                cursor: checkoutUrl ? "pointer" : "not-allowed"
              }}
            >
              Continue to payment
            </button>
          </div>

          {checkoutUrl && (
            <p style={{ marginTop: 14, wordBreak: "break-all", fontSize: 13 }}>
              <b>access_url:</b> {checkoutUrl}
            </p>
          )}
        </>
      )}
    </div>
  );
}
