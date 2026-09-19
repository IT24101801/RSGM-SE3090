import { useEffect, useState } from "react";
import {
  approveRequisition,
  getHrRequisitions,
  rejectRequisition,
} from "../../services/hrRequisitionService";

export default function RequisitionApprovalsPage() {
  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [rejectingId, setRejectingId] =
    useState(null);

  const [feedback, setFeedback] =
    useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setItems(
        await getHrRequisitions()
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(id) {
    if (
      !window.confirm(
        "Approve this requisition?"
      )
    ) {
      return;
    }

    try {
      await approveRequisition(id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReject(id) {
    if (
      feedback.trim().length < 5
    ) {
      setError(
        "Please provide a reason for rejection."
      );

      return;
    }

    try {
      await rejectRequisition(
        id,
        feedback
      );

      setFeedback("");
      setRejectingId(null);

      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Requisition Approvals
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review job requisitions
          submitted by recruiters in
          your company.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const isSubmitted =
              item.status ===
                "Submitted" ||
              item.status === 1;

            return (
              <div
                key={item.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {
                        item.positionTitle
                      }
                    </h2>

                    <p className="text-sm text-slate-500">
                      Requested by{" "}
                      {
                        item.recruiterName
                      }
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                    {item.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                  <p>
                    Department:{" "}
                    {item.department}
                  </p>

                  <p>
                    Headcount:{" "}
                    {item.headcount}
                  </p>

                  <p>
                    Location:{" "}
                    {item.location}
                  </p>

                  <p>
                    Experience:{" "}
                    {
                      item.minExperienceYears
                    }{" "}
                    years
                  </p>

                  <p>
                    Salary:{" "}
                    {item.minSalary ??
                      "-"}{" "}
                    -{" "}
                    {item.maxSalary ??
                      "-"}{" "}
                    {item.currency}
                  </p>

                  <p>
                    Company:{" "}
                    {item.companyName}
                  </p>
                </div>

                {item.description && (
                  <div className="mt-4">
                    <strong>
                      Description
                    </strong>
                    <p className="mt-1 text-sm text-slate-600">
                      {
                        item.description
                      }
                    </p>
                  </div>
                )}

                {item.justification && (
                  <div className="mt-4">
                    <strong>
                      Justification
                    </strong>
                    <p className="mt-1 text-sm text-slate-600">
                      {
                        item.justification
                      }
                    </p>
                  </div>
                )}

                {isSubmitted && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        handleApprove(
                          item.id
                        )
                      }
                      className="rounded-lg bg-green-600 px-4 py-2 text-white"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        setRejectingId(
                          item.id
                        )
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-white"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {rejectingId ===
                  item.id && (
                  <div className="mt-5 rounded-lg border p-4">
                    <label className="font-medium">
                      Reason for
                      rejection
                    </label>

                    <textarea
                      value={feedback}
                      onChange={(e) =>
                        setFeedback(
                          e.target.value
                        )
                      }
                      className="mt-2 min-h-28 w-full rounded-lg border p-3"
                      placeholder="Explain why this requisition was rejected..."
                    />

                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() =>
                          handleReject(
                            item.id
                          )
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 text-white"
                      >
                        Confirm Rejection
                      </button>

                      <button
                        onClick={() => {
                          setRejectingId(
                            null
                          );
                          setFeedback("");
                        }}
                        className="rounded-lg border px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {item.hrFeedback && (
                  <div className="mt-5 rounded-lg bg-red-50 p-4">
                    <strong className="text-red-800">
                      HR Feedback
                    </strong>

                    <p className="mt-1 text-sm text-red-700">
                      {
                        item.hrFeedback
                      }
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}