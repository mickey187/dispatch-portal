import type { Tracking } from "./types";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function getTracking(token: string): Promise<Tracking> {
  const res = await fetch(`${API_BASE}/track/${token}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`track ${res.status}`);
  return res.json();
}

export async function reschedule(token: string, windowStart: string, windowEnd: string): Promise<Tracking> {
  const res = await fetch(`${API_BASE}/track/${token}/reschedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ window_start: windowStart, window_end: windowEnd }),
  });
  if (!res.ok) throw new Error(`reschedule ${res.status}`);
  return res.json();
}

export async function confirmDelivery(token: string, feedback?: string): Promise<Tracking> {
  const res = await fetch(`${API_BASE}/track/${token}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedback }),
  });
  if (!res.ok) throw new Error(`confirm ${res.status}`);
  return res.json();
}
