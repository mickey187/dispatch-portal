"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { confirmDelivery, getTracking, reschedule } from "@/lib/api";
import type { Tracking } from "@/lib/types";

const TrackMap = dynamic(() => import("@/components/TrackMap"), {
  ssr: false,
  loading: () => <div className="flex h-64 items-center justify-center rounded-xl bg-slate-100 text-slate-400">Loading map…</div>,
});

const RISK_BADGE: Record<string, { label: string; cls: string }> = {
  ok: { label: "On time", cls: "bg-emerald-100 text-emerald-700" },
  at_risk: { label: "Running a little late", cls: "bg-amber-100 text-amber-700" },
  breached: { label: "Delayed", cls: "bg-rose-100 text-rose-700" },
  done: { label: "Complete", cls: "bg-slate-200 text-slate-700" },
};

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";
}

function countdown(iso: string | null, now: number): string {
  if (!iso) return "";
  const diffMin = Math.round((new Date(iso).getTime() - now) / 60000);
  if (diffMin <= 0) return "Arriving now";
  if (diffMin === 1) return "in about 1 minute";
  if (diffMin < 60) return `in about ${diffMin} minutes`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return `in about ${h}h ${m}m`;
}

export default function TrackPage() {
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token[0] : (params.token as string);

  const [t, setT] = useState<Tracking | null>(null);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setT(await getTracking(token));
      setError(false);
    } catch {
      setError(true);
    }
  }, [token]);

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const doReschedule = async (startH: number, endH: number, label: string) => {
    setBusy(true);
    setFlash(null);
    const today = new Date().toISOString().slice(0, 10);
    const pad = (h: number) => String(h).padStart(2, "0");
    try {
      setT(await reschedule(token, `${today}T${pad(startH)}:00:00`, `${today}T${pad(endH)}:00:00`));
      setFlash(`Rescheduled to ${label}. We'll deliver within your new window.`);
    } catch {
      setFlash("Sorry, we couldn't reschedule right now.");
    } finally {
      setBusy(false);
    }
  };

  const doConfirm = async () => {
    setBusy(true);
    try {
      setT(await confirmDelivery(token));
      setFlash("Thanks! Delivery confirmed.");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <main className="mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-800">Tracking link not found</h1>
        <p className="mt-2 text-slate-500">Please check the link from your delivery notification.</p>
      </main>
    );
  }

  if (!t) {
    return <main className="mx-auto max-w-md p-8 text-center text-slate-400">Loading your delivery…</main>;
  }

  const badge = RISK_BADGE[t.risk ?? "ok"] ?? RISK_BADGE.ok;
  const delivered = t.status === "delivered";

  return (
    <main className="mx-auto max-w-md space-y-4 p-4 pb-10">
      <header className="pt-4 text-center">
        <p className="text-sm text-slate-400">Delivery for</p>
        <h1 className="text-2xl font-bold text-slate-800">{t.customer}</h1>
        <p className="text-sm text-slate-500">{t.address}</p>
      </header>

      <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-100">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>{badge.label}</span>
        {!delivered ? (
          <>
            <p className="mt-3 text-3xl font-bold text-slate-800">{fmt(t.current_eta)}</p>
            <p className="text-sm text-slate-500">{countdown(t.current_eta, now)}</p>
            {t.driver && <p className="mt-1 text-xs text-slate-400">Driver: {t.driver.name}</p>}
          </>
        ) : (
          <p className="mt-3 text-2xl font-bold text-emerald-600">Delivered ✓</p>
        )}
      </div>

      {t.stop && <TrackMap stop={t.stop} driver={t.driver} />}

      {/* Timeline */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <ol className="space-y-3">
          {t.timeline.map((s, i) => (
            <li key={i} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  s.done ? "bg-emerald-500 text-white" : s.active ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-400"
                }`}
              >
                {s.done ? "✓" : i + 1}
              </span>
              <span className={`text-sm ${s.active ? "font-semibold text-slate-800" : "text-slate-500"}`}>{s.label}</span>
            </li>
          ))}
        </ol>
      </div>

      {flash && <div className="rounded-xl bg-blue-50 p-3 text-center text-sm text-blue-700">{flash}</div>}

      {!delivered && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Need it later?</h2>
          <p className="mt-1 text-xs text-slate-500">We&apos;ll re-plan the route around your new window.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button onClick={() => doReschedule(12, 15, "12–3 PM")} disabled={busy} className="rounded-lg bg-slate-100 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50">
              12–3 PM
            </button>
            <button onClick={() => doReschedule(16, 18, "4–6 PM")} disabled={busy} className="rounded-lg bg-slate-100 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50">
              4–6 PM
            </button>
            <button onClick={() => doReschedule(18, 20, "6–8 PM")} disabled={busy} className="rounded-lg bg-slate-100 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50">
              6–8 PM
            </button>
          </div>

          <button
            onClick={doConfirm}
            disabled={busy}
            className="mt-4 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            I&apos;ve received my delivery
          </button>
        </div>
      )}
    </main>
  );
}
