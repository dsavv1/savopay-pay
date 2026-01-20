import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE, fetchPaymentById } from "../api";

function pickNetwork(payment) {
  const qr = (payment?.qr || "").trim();
  if (!qr) return "";
  const idx = qr.indexOf(":");
  if (idx === -1) return "";
  const scheme = qr.slice(0, idx).toLowerCase();
  if (scheme === "ethereum") return "Ethereum";
  if (scheme === "tron") return "TRON";
  if (scheme === "bitcoin") return "Bitcoin";
  return scheme.charAt(0).toUpperCase() + scheme.slice(1);
}

function fmtNum(v, dp = 6) {
  if (v == null || v === "") return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(dp);
}

function firstNotice(payment) {
  const notices = payment?.notices;
  if (Array.isArray(notices) && notices.length) {
    const msg = notices[0]?.message;
    return msg ? String(msg) : "";
  }
  return "";
}

export default function PayPage() {
  const { merchant, paymentId } = useParams();

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
  const network = useMemo(() => pickNetwork(payment), [payment]);

  const summary = useMemo(() => {
    if (!payment) return null;

    // Backend fields observed in your /start-payment output:
    // invoice_amount, invoice_currency, currency, rate, amount_exchange, network_processing_fee, amount, qr, qr_img, notices
    const invoiceAmount = payment.invoice_amount ?? payment.invoiceAmount;
    const invoiceCurrency = payment.invoice_currency ?? payment.invoiceCurrency;

    const currency = payment.currency || "";
    const rate = payment.rate;
    const amountExchange = payment.amount_exchange ?? payment.amountExchange ?? payment.crypto_amount;
    const networkFee = payment.network_processing_fee ?? payment.networkProcessingFee;
    const totalCrypto = payment.amount ?? payment.crypto_amount;

    const notice = firstNotice(payment);

    return {
      invoiceAmount,
      invoiceCurrency,
      currency,
      rate,
      amountExchange,
      networkFee,
      totalCrypto,
      notice,
      qr: payment.qr,
      qrImg: payment.qr_img,
      address: payment.address,
      waitTime: payment.wait_time,
      minConfirmations: payment.min_confirmations,
      status: payment.status || payment.state,
    };
  }, [payment]);

  if (!paymentId || paymentId === "demo") {
    return (
      <div style={{ maxWidth: 820, margin: "40px auto", padding: 16 }}>
        <h2>SavoPay Payment</h2>
        <p>
          You are on <b>{merchant ? `/m/${merchant}/pay/demo` : `/pay/demo`}</b>.
        </p>
        <p>Open a real payment like:</p>
        <p style={{ fontFamily: "monospace" }}>
          {merchant ? `/m/${merchant}/pay/3229830b-7149-4887-bfce-2d0887a6f56a` : `/pay/3229830b-7149-4887-bfce-2d0887a6f56a`}
        </p>
        <p style={{ marginTop: 12 }}>
          API base: <span style={{ fontFamily: "monospace" }}>{API_BASE}</span>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "40px auto", padding: 16 }}>
      <h2>Payment (v2 summary test)</h2>

      <div style={{ fontFamily: "monospace", fontSize: 13, marginBottom: 12 }}>
        <div>paymentId: {paymentId}</div>
        <div>API: {API_BASE}</div>
      </div>

      {loading && <p>Loading…</p>}
      {!loading && error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && summary && (
        <>
          {summary.notice ? (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(245,158,11,0.35)",
                background: "rgba(245,158,11,0.12)",
                color: "#92400E",
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              {summary.notice}
            </div>
          ) : null}

          <div
            style={{
              border: "1px solid rgba(0,0,0,0.10)",
              borderRadius: 14,
              padding: 14,
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              <div style={{ flex: "1 1 240px" }}>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
                  Status
                </div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>
                  {summary.status || "—"}
                </div>
              </div>

              <div style={{ flex: "1 1 240px" }}>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
                  Fiat
                </div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>
                  {summary.invoiceAmount} {summary.invoiceCurrency}
                </div>
              </div>

              <div style={{ flex: "1 1 240px" }}>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
                  Asset / Network
                </div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>
                  {summary.currency || "—"}
                  {network ? ` on ${network}` : ""}
                </div>
              </div>

              <div style={{ flex: "1 1 240px" }}>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
                  Rate
                </div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>
                  {summary.rate != null ? fmtNum(summary.rate, 6) : "—"}
                </div>
              </div>

              <div style={{ flex: "1 1 240px" }}>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
                  Crypto (before fee)
                </div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>
                  {summary.amountExchange != null
                    ? `${fmtNum(summary.amountExchange, 6)} ${summary.currency}`
                    : "—"}
                </div>
              </div>

              <div style={{ flex: "1 1 240px" }}>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
                  Network fee
                </div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>
                  {summary.networkFee != null
                    ? `${fmtNum(summary.networkFee, 6)} ${summary.currency}`
                    : "—"}
                </div>
              </div>

              <div style={{ flex: "1 1 240px" }}>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
                  Total
                </div>
                <div style={{ fontSize: 16, fontWeight: 1000 }}>
                  {summary.totalCrypto != null
                    ? `${fmtNum(summary.totalCrypto, 6)} ${summary.currency}`
                    : "—"}
                </div>
              </div>

              <div style={{ flex: "1 1 240px" }}>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
                  Confirmations / ETA
                </div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>
                  {summary.minConfirmations != null
                    ? `${summary.minConfirmations} conf`
                    : "—"}
                  {summary.waitTime ? ` • ${summary.waitTime}` : ""}
                </div>
              </div>
            </div>

            {summary.address ? (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
                  Address
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    wordBreak: "break-all",
                    marginTop: 6,
                  }}
                >
                  {summary.address}
                </div>
              </div>
            ) : null}

            {summary.qrImg ? (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>
                  QR
                </div>
                <img
                  src={summary.qrImg}
                  alt="Payment QR"
                  style={{ width: 220, height: 220, marginTop: 8 }}
                />
              </div>
            ) : null}
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              disabled={!checkoutUrl}
              onClick={() =>
                window.open(checkoutUrl, "_blank", "noopener,noreferrer")
              }
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                cursor: checkoutUrl ? "pointer" : "not-allowed",
                fontWeight: 900,
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
