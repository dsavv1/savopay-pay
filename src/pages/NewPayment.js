import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api";

function fmt2(n) {
  const x = Number(n);
  if (!isFinite(x)) return "";
  return x.toFixed(2);
}

const NETWORKS = {
  USDT: ["TRON", "ETH", "BSC"],
  USDC: ["ETH", "BSC"],
  BTC: ["BTC"],
  ETH: ["ETH"]
};

export default function NewPayment() {
  const nav = useNavigate();

  const [fiat, setFiat] = useState("USD");
  const [amountFiat, setAmountFiat] = useState("");
  const [crypto, setCrypto] = useState("USDT");
  const [network, setNetwork] = useState("ETH");

  const [rates, setRates] = useState(null);
  const [ratesErr, setRatesErr] = useState("");
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const opts = NETWORKS[crypto] || [];
    const preferred =
      opts.includes("TRON") ? "TRON" :
      opts.includes("ETH") ? "ETH" :
      opts[0] || "";
    setNetwork(preferred);
  }, [crypto]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setRatesErr("");
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (!alive) return;
        if (!data || data.result !== "success" || !data.rates) throw new Error("fx_unavailable");
        setRates({ base: "USD", rates: data.rates, time: data.time_last_update_utc });
      } catch (e) {
        if (!alive) return;
        setRatesErr("FX rates unavailable (conversion to USD may not work).");
        setRates(null);
      }
    })();
    return () => { alive = false; };
  }, []);

  const usdAmount = useMemo(() => {
    const a = Number(amountFiat);
    if (!isFinite(a) || a <= 0) return null;

    if (fiat === "USD") return a;

    const r = rates && rates.rates ? rates.rates[fiat] : null;
    if (!r || !isFinite(r) || r <= 0) return null;

    return a / r;
  }, [amountFiat, fiat, rates]);

  const usdDisplay = usdAmount === null ? "-" : `$${fmt2(usdAmount)}`;

  async function createPayment() {
    setErr("");
    const a = Number(amountFiat);

    if (!isFinite(a) || a <= 0) {
      setErr("Enter a valid amount.");
      return;
    }

    if (fiat !== "USD" && usdAmount === null) {
      setErr("Cannot convert to USD right now. Try again or switch to USD.");
      return;
    }

    const invoiceUsd = fiat === "USD" ? a : usdAmount;

    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/start-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_amount: fmt2(invoiceUsd),
          invoice_currency: "USD",
          currency: crypto,
          payer_id: "walk-in",
          meta_input_currency: fiat,
          meta_input_amount: fmt2(a),
          meta_network: network
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);

      if (!data.payment_id) throw new Error("missing_payment_id");
      nav(`/pay/${data.payment_id}`);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setCreating(false);
    }
  }

  const networkOpts = NETWORKS[crypto] || [];

  return (
    <div className="wrap">
      <div className="card" style={{ maxWidth: 760, width: "100%" }}>
        <div className="header">
          <div className="brand">
            <div className="logo" />
            <div>
              <div className="title">SavoPay POS</div>
              <div className="sub">Create a payment request</div>
            </div>
          </div>
          <div className="pill">
            <span className="dot" />
            <span>Live</span>
          </div>
        </div>

        <div className="content">
          <div className="muted" style={{ marginBottom: 10 }}>
            API base: <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>{API_BASE}</span>
          </div>

          {ratesErr ? (
            <div className="muted" style={{ marginBottom: 10 }}>{ratesErr}</div>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 10 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>Amount (in {fiat})</div>
              <input
                className="input"
                inputMode="decimal"
                placeholder={fiat === "NGN" ? "5000" : "1.00"}
                value={amountFiat}
                onChange={(e) => setAmountFiat(e.target.value)}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>Fiat</div>
              <select className="input" value={fiat} onChange={(e) => setFiat(e.target.value)}>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="NGN">NGN</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="muted">Converted (USD)</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 2 }}>{usdDisplay}</div>
          </div>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>Crypto</div>
              <select className="input" value={crypto} onChange={(e) => setCrypto(e.target.value)}>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>Network</div>
              <select className="input" value={network} onChange={(e) => setNetwork(e.target.value)}>
                {networkOpts.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {err ? (
            <div style={{ marginTop: 12 }} className="error">{err}</div>
          ) : null}

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn2" onClick={createPayment} disabled={creating}>
              {creating ? "Creating…" : "Create payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
