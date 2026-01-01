// ~/Documents/savopay-pay/src/api.js

const RAW_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5050";
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

async function fetchJson(url, opts) {
  const res = await fetch(url, opts);
  const text = await res.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: "non_json_response", raw: text };
  }

  if (!res.ok) {
    const msg = (data && data.error) ? data.error : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export async function fetchPaymentById(paymentId) {
  const url = `${API_BASE}/payments/${encodeURIComponent(paymentId)}`;
  return fetchJson(url);
}

export async function recheckPayment(paymentId) {
  const url = `${API_BASE}/payments/${encodeURIComponent(paymentId)}/recheck`;
  return fetchJson(url, { method: "POST" });
}
