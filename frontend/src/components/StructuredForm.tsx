import { useState } from "react";
import { useCreateInteractionMutation } from "../store/api";
import type { Channel, Outcome, Sentiment } from "../types";

interface Props {
  hcpId: number | null;
}

const CHANNELS: Channel[] = ["visit", "call", "email", "chat", "other"];
const OUTCOMES: Outcome[] = ["positive", "neutral", "negative", "follow_up", "no_show"];
const SENTIMENTS: Sentiment[] = ["positive", "neutral", "negative"];

export default function StructuredForm({ hcpId }: Props) {
  const [channel, setChannel] = useState<Channel>("visit");
  const [outcome, setOutcome] = useState<Outcome | "">("");
  const [sentiment, setSentiment] = useState<Sentiment | "">("");
  const [summary, setSummary] = useState("");
  const [rawNotes, setRawNotes] = useState("");
  const [productsCsv, setProductsCsv] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [occurredAt, setOccurredAt] = useState<string>(() =>
    new Date().toISOString().slice(0, 16),
  );

  const [createInteraction, { isLoading, error }] = useCreateInteractionMutation();
  const [flash, setFlash] = useState<string | null>(null);

  const disabled = hcpId === null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hcpId === null) return;
    try {
      await createInteraction({
        hcp_id: hcpId,
        channel,
        outcome: outcome || null,
        sentiment: sentiment || null,
        summary: summary || null,
        raw_notes: rawNotes || null,
        products_discussed: productsCsv
          ? productsCsv.split(",").map((s) => s.trim()).filter(Boolean)
          : null,
        next_step: nextStep || null,
        occurred_at: occurredAt ? new Date(occurredAt).toISOString() : null,
      }).unwrap();
      setFlash("Interaction logged.");
      setSummary("");
      setRawNotes("");
      setProductsCsv("");
      setNextStep("");
    } catch {
      setFlash("Failed to save.");
    }
    setTimeout(() => setFlash(null), 2500);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {disabled && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Select an HCP first.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Channel">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel)}
            className="input"
          >
            {CHANNELS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Occurred at">
          <input
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Outcome">
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
        </Field>
        <Field label="Sentiment">
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
        </Field>
      </div>

      <Field label="Products discussed (comma-separated)">
        <input
          type="text"
          value={productsCsv}
          onChange={(e) => setProductsCsv(e.target.value)}
          placeholder="Atorvastatin 10mg, Rosuvastatin 20mg"
          className="input"
        />
      </Field>

      <Field label="Summary">
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Raw notes">
        <textarea
          rows={5}
          value={rawNotes}
          onChange={(e) => setRawNotes(e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Next step">
        <input
          type="text"
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          className="input"
        />
      </Field>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={disabled || isLoading}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isLoading ? "Saving…" : "Log interaction"}
        </button>
        {flash && <span className="text-sm text-slate-600">{flash}</span>}
        {error && <span className="text-sm text-red-600">Error saving.</span>}
      </div>

    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
