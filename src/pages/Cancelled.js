import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

export default function Cancelled() {
  const { merchant, paymentId: paymentIdParam } = useParams();
  const [searchParams] = useSearchParams();

  const paymentId = paymentIdParam || searchParams.get("payment_id") || "";

  const tryAgainHref = merchant
    ? `/m/${merchant}/pay/${paymentId}`
    : `/pay/${paymentId}`;

  const backHref = merchant ? `/m/${merchant}` : `/`;

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
                <Link className="btn2" to={tryAgainHref}>
                  Try again
                </Link>
                <Link className="btn2" to={backHref}>
                  Back to POS
                </Link>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>No payment reference was provided.</div>
              <Link className="btn2" to={backHref}>
                Back to POS
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

