import { useEffect, useState } from "react";
import {
  useListInteractionsQuery,
  useUpdateInteractionMutation,
} from "../store/api";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setEditingInteraction } from "../store/uiSlice";
import type { Outcome, Sentiment } from "../types";

const OUTCOMES: Outcome[] = ["positive", "neutral", "negative", "follow_up", "no_show"];
const SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative"];

export default function EditInteractionModal() {
  const editingId = useAppSelector((s) => s.ui.editingInteractionId);
  const hcpId = useAppSelector((s) => s.ui.selectedHcpId);
  const dispatch = useAppDispatch();
  const { data } = useListInteractionsQuery(
    hcpId ? { hcp_id: hcpId, limit: 100 } : undefined,
    { skip: hcpId === null },
  );
  const [updateInteraction, { isLoading }] = useUpdateInteractionMutation();

  const target = data?.items.find((i) => i.id === editingId) ?? null;

  const [summary, setSummary] = useState("");
  const [outcome, setOutcome] = useState<Outcome | "">("");
  const [sentiment, setSentiment] = useState<Sentiment | "">("");
  const [nextStep, setNextStep] = useState("");

  useEffect(() => {
    if (target) {
      setSummary(target.summary || "");
      setOutcome((target.outcome as Outcome) || "");
      setSentiment((target.sentiment as Sentiment) || "");
      setNextStep(target.next_step || "");
    }
  }, [target?.id]);

  if (editingId === null || !target) return null;

  async function onSave() {
    await updateInteraction({
      id: editingId as number,
      patch: {
        summary: summary || null,
        outcome: outcome || null,
        sentiment: sentiment || null,
        next_step: nextStep || null,
      },
    }).unwrap();
    dispatch(setEditingInteraction(null));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit interaction #{target.id}</h2>
          <button
            onClick={() => dispatch(setEditingInteraction(null))}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Summary
            </span>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="input"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Outcome
              </span>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as Outcome)}
                className="input"
              >
                <option value="">—</option>
                {OUTCOMES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Sentiment
              </span>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as Sentiment)}
                className="input"
              >
                <option value="">—</option>
                {SENTIMENTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Next step
            </span>
            <input
              type="text"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              className="input"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => dispatch(setEditingInteraction(null))}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-slate-300"
          >
            {isLoading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
