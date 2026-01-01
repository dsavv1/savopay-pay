import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

export default function NewPayment() {
  const nav = useNavigate();

  const [amount, setAmount] = useState("1.00");
  const [fiat, setFiat] = useState("USD");
  const [crypto, setCrypto] = useState("USDT");
  const [payerId, setPayerId] = useState("walk-in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createPayment() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/start-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_amount: String(amount || "1.00"),
          invoice_currency: fiat,
          currency: crypto,
          payer_id: payerId
        })
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);

      if (!data?.payment_id) throw new Error("Missing payment_id from backend");
      nav(`/pay/${data.payment_id}`);
    } catch (e) {
      setError(e?.message || "Create payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <h2>SavoPay Browser POS</h2>
      <p style={{ fontFamily: "monospace", fontSize: 13 }}>API: {API_BASE}</p>

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <label>
          Amount
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ display: "block", width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>

        <label>
          Fiat currency
          <select
            value={fiat}
            onChange={(e) => setFiat(e.target.value)}
            style={{ display: "block", width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="EUR">EUR</option>
            <option value="NGN">NGN</option>
          </select>
        </label>

        <label>
          Crypto
          <select
            value={crypto}
            onChange={(e) => setCrypto(e.target.value)}
            style={{ display: "block", width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          >
            <option value="USDT">USDT</option>
            <option value="USDC">USDC</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
        </label>

        <label>
          Payer ID
          <input
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
            style={{ display: "block", width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>

        <button
          onClick={createPayment}
          disabled={loading}
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Creating…" : "Create payment"}
        </button>

        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </div>
    </div>
  );
}
