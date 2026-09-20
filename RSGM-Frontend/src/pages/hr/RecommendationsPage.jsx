import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHrRecommendations } from "../../services/panelistWorkflowService";
export default function RecommendationsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { getHrRecommendations().then(setRows).catch((e) => setError(e.message)); }, []);
  return <div><p className="text-xs font-semibold uppercase text-emerald-600">Final review</p><h1 className="mt-3 text-3xl font-semibold">Panelist recommendations</h1>
    <p className="mt-2 text-sm text-neutral-500">Read the panelist’s decision and rationale before approving an offer.</p>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    <div className="mt-7 space-y-3">{rows.length === 0 && <p className="rounded-2xl bg-white p-5 text-neutral-500">No recommendations submitted yet.</p>}
      {rows.map((r) => <article key={r.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{r.candidate}</h2><p className="text-sm text-neutral-500">{r.job} · {r.panelist}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.selected ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{r.selected ? "Recommended" : "Not recommended"}</span></div><p className="mt-4 whitespace-pre-wrap text-sm text-neutral-700">{r.rationale}</p><p className="mt-3 text-xs text-neutral-400">{new Date(r.submittedAt).toLocaleString()}</p>{r.selected && <Link to="/hr/offers" className="mt-3 inline-block text-sm font-semibold text-emerald-700">Review offer approvals →</Link>}</article>)}
    </div>
  </div>;
}
