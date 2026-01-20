// src/pages/NewPayment.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE =
  (process.env.REACT_APP_API_BASE || "").trim() || "https://api.savopay.co";

const SUPPORTED_FIAT = ["USD", "GBP", "EUR", "NGN"];

// Locked for now (matches current backend default behavior)
const SUPPORTED_ASSETS = [
  { crypto: "USDT", networkLabel: "Ethereum (ERC-20)", networkKey: "ethereum" },
];

// Fallback rates: 1 USD = X fiat (approx). Used only if live FX fetch fails.
const FALLBACK_USD_BASE_RATES = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  NGN: 1500,
};

function isValidMoney(v) {
  if (v === "" || v == null) return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}

async function fetchUsdBaseRates(signal) {
  const url = "https://open.er-api.com/v6/latest/USD";
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`);
  const data = await res.json();
  if (!data || !data.rates) throw new Error("FX response missing rates");
  return data.rates;
}

export default function NewPayment() {
  const navigate = useNavigate();
  const { merchant } = useParams();
  const [fiatCurrency, setFiatCurrency] = useState("USD");
  const [fiatAmount, setFiatAmount] = useState("");
  const [payerId, setPayerId] = useState("walk-in");

  const [assetKey, setAssetKey] = useState(
    `${SUPPORTED_ASSETS[0].crypto}:${SUPPORTED_ASSETS[0].networkKey}`
  );

  const selectedAsset = useMemo(() => {
    const [crypto, networkKey] = String(assetKey).split(":");
    return (
      SUPPORTED_ASSETS.find(
        (a) => a.crypto === crypto && a.networkKey === networkKey
      ) || SUPPORTED_ASSETS[0]
    );
  }, [assetKey]);

  const [usdBaseRates, setUsdBaseRates] = useState(FALLBACK_USD_BASE_RATES);
  const [fxStatus, setFxStatus] = useState("idle"); // idle | loading | ok | fallback
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setFxStatus("loading");
        const liveRates = await fetchUsdBaseRates(ac.signal);
        const merged = { ...FALLBACK_USD_BASE_RATES, ...liveRates };
        for (const c of SUPPORTED_FIAT) {
          if (!merged[c] || !Number.isFinite(Number(merged[c]))) {
            throw new Error(`Missing FX rate for ${c}`);
          }
        }
        setUsdBaseRates(merged);
        setFxStatus("ok");
      } catch {
        setUsdBaseRates(FALLBACK_USD_BASE_RATES);
        setFxStatus("fallback");
      }
    })();
    return () => ac.abort();
  }, []);

  const usdAmount = useMemo(() => {
    if (!isValidMoney(fiatAmount)) return "";
    const amt = Number(fiatAmount);
    const rate = Number(usdBaseRates[fiatCurrency]);
    if (!Number.isFinite(rate) || rate <= 0) return "";
    const usd = fiatCurrency === "USD" ? amt : amt / rate;
    return (Math.round(usd * 100) / 100).toFixed(2);
  }, [fiatAmount, fiatCurrency, usdBaseRates]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isValidMoney(fiatAmount)) return setError("Enter a valid amount.");
    if (!usdAmount) return setError("Could not compute USD amount.");

    setSubmitting(true);
    try {
      const payload = {
        invoice_amount: usdAmount,
        invoice_currency: "USD",
        payer_id: (payerId || "walk-in").trim(),
        ...(merchant ? { merchant } : {}),
      };

      const res = await fetch(`${API_BASE}/start-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          `Start payment failed (${res.status})`;
        throw new Error(msg);
      }

      const paymentId = data.payment_id || data.id || data.paymentId;
      if (!paymentId) throw new Error("Missing payment_id from backend.");

      navigate(merchant ? `/m/${merchant}/pay/${paymentId}` : `/pay/${paymentId}`);
    } catch (err) {
      setError(err?.message || "Failed to start payment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wrap">
      <div className="shell" style={{ gridTemplateColumns: "1fr" }}>
        <div className="card">
          <div className="header">
            <div className="brand">
              <div className="logo" />
              <div>
                <div className="title">SavoPay POS</div>
                <div className="sub">Create a payment</div>
              </div>
            </div>

            <div className="pill">
              <span className="dot good" />
              <span>Live</span>
            </div>
          </div>

          <div className="content">
            <form onSubmit={onSubmit}>
              <div className="grid2">
                <div className="field">
                  <div className="label">Amount</div>
                  <input
                    className="input"
                    inputMode="decimal"
                    autoComplete="off"
                    value={fiatAmount}
                    onChange={(e) => setFiatAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="field">
                  <div className="label">Currency</div>
                  <select
                    className="select"
                    value={fiatCurrency}
                    onChange={(e) => setFiatCurrency(e.target.value)}
                  >
                    {SUPPORTED_FIAT.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid2">
                <div className="field">
                  <div className="label">Crypto</div>
                  <select
                    className="select"
                    value={assetKey}
                    onChange={(e) => setAssetKey(e.target.value)}
                    disabled={SUPPORTED_ASSETS.length <= 1}
                  >
                    {SUPPORTED_ASSETS.map((a) => (
                      <option
                        key={`${a.crypto}:${a.networkKey}`}
                        value={`${a.crypto}:${a.networkKey}`}
                      >
                        {a.crypto}
                      </option>
                    ))}
                  </select>
                  <div className="small" style={{ marginTop: 6 }}>
                    {SUPPORTED_ASSETS.length <= 1
                      ? "Locked to current backend default."
                      : ""}
                  </div>
                </div>

                <div className="field">
                  <div className="label">Network</div>
                  <input
                    className="input"
                    value={selectedAsset.networkLabel}
                    readOnly
                  />
                </div>
              </div>

              <div className="field">
                <div className="label">Payer ID</div>
                <input
                  className="input"
                  autoComplete="off"
                  value={payerId}
                  onChange={(e) => setPayerId(e.target.value)}
                  placeholder="walk-in"
                />
              </div>

              <div className="field">
                <div className="label">USD (sent to /start-payment)</div>
                <input
                  className="input"
                  value={usdAmount ? `$${usdAmount}` : ""}
                  readOnly
                />
                <div className="small" style={{ marginTop: 6 }}>
                  {fxStatus === "loading" && "Loading FX rates…"}
                  {fxStatus === "ok" && "FX rates loaded."}
                  {fxStatus === "fallback" &&
                    "Using fallback FX rates (offline/unavailable)."}
                </div>
              </div>

              <div className="hr" />

              <div>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  Payment Summary
                </div>
                <div className="kv">
                  <span className="muted">Fiat</span>
                  <span>
                    {isValidMoney(fiatAmount) ? fiatAmount : "—"} {fiatCurrency}
                  </span>
                </div>
                <div className="kv">
                  <span className="muted">USD to backend</span>
                  <span>{usdAmount ? `$${usdAmount}` : "—"}</span>
                </div>
                <div className="kv">
                  <span className="muted">Asset / Network</span>
                  <span>
                    {selectedAsset.crypto} • {selectedAsset.networkLabel}
                  </span>
                </div>
                <div className="small" style={{ marginTop: 6 }}>
                  Final crypto total + network fee is calculated after the
                  payment is created (shown on the next screen).
                </div>
              </div>

              {error ? (
                <div style={{ marginTop: 12, color: "var(--bad)" }}>
                  {error}
                </div>
              ) : null}

              <div style={{ marginTop: 14 }}>
                <button className="btn" type="submit" disabled={submitting}>
                  {submitting ? "Creating…" : "Create Payment"}
                </button>
              </div>
            </form>
          </div>

          <div className="footer">
            <span>API: {API_BASE}</span>
            <span>POS: savopay-pay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
