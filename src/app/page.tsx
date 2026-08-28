export default function Home() {
  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-800">Delivery Tracking</h1>
      <p className="mt-3 text-slate-500">
        Open the tracking link from your delivery notification, e.g.
        <code className="mt-2 block rounded bg-slate-100 p-2 text-xs text-slate-600">/track/&lt;your-token&gt;</code>
      </p>
    </main>
  );
}
