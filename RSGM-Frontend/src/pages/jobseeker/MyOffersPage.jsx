import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  XCircle,
} from "lucide-react";
import {
  acceptOffer,
  declineOffer,
  getJobSeekerOffers,
} from "../../services/hiringWorkflowService";

function readable(value) {
  if (!value) return "Not specified";
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function CompanyLogo({ name, logoUrl }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${name || "Company"} logo`}
        className="h-16 w-16 shrink-0 rounded-2xl border border-neutral-200 bg-white object-contain p-1.5"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
      <Building2 size={26} />
    </div>
  );
}

function statusClass(status) {
  if (status === "Accepted") return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  if (status === "Declined") return "bg-red-50 text-red-700 ring-red-100";
  return "bg-amber-50 text-amber-700 ring-amber-100";
}

export default function MyOffersPage() {
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [reason, setReason] = useState("");

  const refresh = useCallback(() => getJobSeekerOffers().then(setOffers), []);

  useEffect(() => {
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refresh]);

  async function act(id, action) {
    setBusy(id);
    setError("");
    try {
      await action();
      await refresh();
      setDeclining(null);
      setReason("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-600">
        <BadgeCheck size={13} /> JOB OFFERS
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">My offers</h1>
      <p className="mt-2 text-neutral-500">
        Review the complete offer, company, and role details before you accept or decline.
      </p>

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 space-y-5">
        {loading && (
          <p className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="animate-spin" size={16} /> Loading offers...
          </p>
        )}

        {!loading && offers.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
            You have no approved offers yet.
          </div>
        )}

        {offers.map((offer) => (
          <article key={offer.id} className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-4">
                  <CompanyLogo name={offer.company} logoUrl={offer.companyLogoUrl} />
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-neutral-900">{offer.job}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-neutral-600">
                      <Building2 size={14} /> {offer.company || "Company not specified"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
                      <span className="flex items-center gap-1.5"><MapPin size={13} />{offer.jobLocation || "Location not specified"}</span>
                      <span className="flex items-center gap-1.5"><BriefcaseBusiness size={13} />{readable(offer.employmentType)}</span>
                      <span className="flex items-center gap-1.5"><Clock3 size={13} />{readable(offer.workMode)}</span>
                    </div>
                  </div>
                </div>

                <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${statusClass(offer.status)}`}>
                  {offer.status === "Approved" ? "Awaiting your response" : offer.status}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <OfferDetail icon={Banknote} label="Salary" value={`${offer.currency} ${Number(offer.salary).toLocaleString()}`} />
                <OfferDetail icon={CalendarDays} label="Start date" value={new Date(`${offer.startDate}T00:00:00`).toLocaleDateString()} />
                <OfferDetail icon={BriefcaseBusiness} label="Experience level" value={readable(offer.experienceLevel)} />
                <OfferDetail icon={BadgeCheck} label="Offer status" value={offer.status === "Approved" ? "Awaiting response" : offer.status} />
              </div>

              {(offer.jobDescription || offer.notes) && (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {offer.jobDescription && (
                    <section className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        <FileText size={14} /> Role summary
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{offer.jobDescription}</p>
                    </section>
                  )}
                  {offer.notes && (
                    <section className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-500">
                        <FileText size={14} /> Offer notes
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">{offer.notes}</p>
                    </section>
                  )}
                </div>
              )}

              {(offer.reviewedAt || offer.respondedAt) && (
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                  {offer.reviewedAt && <span>Approved: {new Date(offer.reviewedAt).toLocaleString()}</span>}
                  {offer.respondedAt && <span>Your response: {new Date(offer.respondedAt).toLocaleString()}</span>}
                </div>
              )}

              {offer.candidateDeclineReason && (
                <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <strong>Your decline reason:</strong> {offer.candidateDeclineReason}
                </p>
              )}

              {offer.status === "Approved" && (
                <div className="mt-6 flex flex-wrap gap-3 border-t border-neutral-100 pt-5">
                  <button
                    disabled={busy === offer.id}
                    onClick={() => {
                      if (window.confirm("Accept this job offer?")) {
                        act(offer.id, () => acceptOffer(offer.id));
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {busy === offer.id ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
                    Accept offer
                  </button>
                  <button
                    disabled={busy === offer.id}
                    onClick={() => setDeclining(offer)}
                    className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={17} /> Decline offer
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {declining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              act(declining.id, () => declineOffer(declining.id, reason.trim()));
            }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-xl font-semibold">Decline offer</h2>
            <p className="mt-1 text-sm text-neutral-500">Please give the recruiter and HR a short reason.</p>
            <textarea
              autoFocus
              required
              maxLength={1000}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-5 w-full rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeclining(null)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!reason.trim() || busy === declining.id}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Confirm decline
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function OfferDetail({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
        <Icon size={14} /> {label}
      </div>
      <p className="mt-1.5 text-sm font-semibold text-neutral-800">{value}</p>
    </div>
  );
}
