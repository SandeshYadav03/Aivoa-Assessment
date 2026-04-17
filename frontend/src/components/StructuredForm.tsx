import { useState } from "react";
import { useCreateInteractionMutation } from "../store/api";
import type { Channel, Outcome, Sentiment } from "../types";
import HCPSelector from "./HCPSelector";

interface Props {
  hcpId: number | null;
}

const INTERACTION_TYPES = ["Meeting", "Call", "Email", "Conference", "Other"];

export default function StructuredForm({ hcpId }: Props) {
  const [interactionType, setInteractionType] = useState("Meeting");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("19:36");
  const [attendees, setAttendees] = useState("");
  const [topicsDiscussed, setTopicsDiscussed] = useState("");
  const [materialsShared, setMaterialsShared] = useState("");
  const [samplesDistributed, setSamplesDistributed] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment>("neutral");
  const [outcomes, setOutcomes] = useState("");
  const [followUpActions, setFollowUpActions] = useState("");

  const [createInteraction, { isLoading, error }] = useCreateInteractionMutation();
  const [flash, setFlash] = useState<string | null>(null);

  const disabled = hcpId === null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hcpId === null) return;
    try {
      const occurredAt = new Date(`${date}T${time}`).toISOString();
      await createInteraction({
        hcp_id: hcpId,
        channel: "visit" as Channel,
        outcome: "positive" as Outcome,
        sentiment,
        summary: topicsDiscussed,
        raw_notes: `Attendees: ${attendees}\n\nTopics: ${topicsDiscussed}\n\nMaterials: ${materialsShared}\n\nSamples: ${samplesDistributed}\n\nOutcomes: ${outcomes}`,
        products_discussed: materialsShared ? [materialsShared] : null,
        next_step: followUpActions || null,
        occurred_at: occurredAt,
      }).unwrap();
      setFlash("Interaction logged successfully.");
      // Reset form
      setTopicsDiscussed("");
      setAttendees("");
      setMaterialsShared("");
      setSamplesDistributed("");
      setOutcomes("");
      setFollowUpActions("");
    } catch {
      setFlash("Failed to save interaction.");
    }
    setTimeout(() => setFlash(null), 3000);
  }

  return (
    <div className="animate-fade-in">
      <form onSubmit={onSubmit} className="space-y-8">
        {disabled && (
          <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-sm text-amber-900 shadow-sm animate-bounce-subtle">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium">Please select an HCP first to continue.</span>
            </div>
          </div>
        )}

        {/* Interaction Details Section */}
        <section className="card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Interaction Details</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* HCP Name */}
            <div className="form-group">
              <HCPSelector />
            </div>

            {/* Interaction Type */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Interaction Type
              </label>
              <div className="relative">
                <select
                  value={interactionType}
                  onChange={(e) => setInteractionType(e.target.value)}
                  className="input appearance-none bg-white pr-10 group-hover:shadow-md transition-all duration-200"
                >
                  {INTERACTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input group-hover:shadow-md transition-all duration-200"
              />
            </div>

            {/* Time */}
            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input group-hover:shadow-md transition-all duration-200"
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="mt-6 form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Attendees
            </label>
            <input
              type="text"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="Enter attendee names..."
              className="input group-hover:shadow-md transition-all duration-200"
            />
          </div>

          {/* Topics Discussed */}
          <div className="mt-6 form-group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Topics Discussed
            </label>
            <textarea
              rows={4}
              value={topicsDiscussed}
              onChange={(e) => setTopicsDiscussed(e.target.value)}
              placeholder="Enter key discussion points..."
              className="input resize-none group-hover:shadow-md transition-all duration-200"
            />
            <div className="mt-3 flex items-center text-sm text-blue-600 bg-blue-50 rounded-lg p-3 border border-blue-100">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="font-medium">Voice Note Integration Available</span>
              <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded-full">Requires Consent</span>
            </div>
          </div>
        </section>

        {/* Materials Shared / Samples Distributed Section */}
        <section className="card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Materials & Samples</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Materials Shared */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">
                  Materials Shared
                </label>
                <button
                  type="button"
                  className="btn-secondary text-xs px-3 py-1.5 transform hover:scale-105"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group">
                <svg className="w-8 h-8 mx-auto text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500 group-hover:text-blue-600 font-medium">No materials added</p>
                <p className="text-xs text-gray-400 mt-1">Click to add brochures, studies, etc.</p>
              </div>
            </div>

            {/* Samples Distributed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">
                  Samples Distributed
                </label>
                <button
                  type="button"
                  className="btn-secondary text-xs px-3 py-1.5 transform hover:scale-105"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white text-center hover:border-green-300 hover:bg-green-50/30 transition-all duration-200 cursor-pointer group">
                <svg className="w-8 h-8 mx-auto text-gray-400 mb-2 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-sm text-gray-500 group-hover:text-green-600 font-medium">No samples added</p>
                <p className="text-xs text-gray-400 mt-1">Track distributed product samples</p>
              </div>
            </div>
          </div>
        </section>

        {/* Observed/Inferred HCP Sentiment */}
        <section className="card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">HCP Sentiment</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="radio-modern flex-1 p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all duration-200 cursor-pointer group">
              <input
                type="radio"
                name="sentiment"
                value="positive"
                checked={sentiment === "positive"}
                onChange={(e) => setSentiment(e.target.value as Sentiment)}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${sentiment === 'positive' ? 'border-green-500 bg-green-500' : 'border-gray-300 group-hover:border-green-400'}`}>
                  {sentiment === 'positive' && (
                    <svg className="w-4 h-4 text-white m-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="font-semibold text-gray-800">Positive</span>
                </div>
              </div>
            </label>
            <label className="radio-modern flex-1 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer group">
              <input
                type="radio"
                name="sentiment"
                value="neutral"
                checked={sentiment === "neutral"}
                onChange={(e) => setSentiment(e.target.value as Sentiment)}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${sentiment === 'neutral' ? 'border-gray-500 bg-gray-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
                  {sentiment === 'neutral' && (
                    <svg className="w-4 h-4 text-white m-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-5 6c2.76 0 5-2.24 5-5H7c0 2.76 2.24 5 5 5z"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                  <span className="font-semibold text-gray-800">Neutral</span>
                </div>
              </div>
            </label>
            <label className="radio-modern flex-1 p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50/50 transition-all duration-200 cursor-pointer group">
              <input
                type="radio"
                name="sentiment"
                value="negative"
                checked={sentiment === "negative"}
                onChange={(e) => setSentiment(e.target.value as Sentiment)}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${sentiment === 'negative' ? 'border-red-500 bg-red-500' : 'border-gray-300 group-hover:border-red-400'}`}>
                  {sentiment === 'negative' && (
                    <svg className="w-4 h-4 text-white m-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4"/>
                    </svg>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
                  </svg>
                  <span className="font-semibold text-gray-800">Negative</span>
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* Outcomes */}
        <section className="card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Outcomes</h2>
          </div>
          <textarea
            rows={4}
            value={outcomes}
            onChange={(e) => setOutcomes(e.target.value)}
            placeholder="Key outcomes, agreements, or commitments..."
            className="input resize-none group-hover:shadow-md transition-all duration-200"
          />
        </section>

        {/* Follow-up Actions */}
        <section className="card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Follow-up Actions</h2>
          </div>
          <textarea
            rows={3}
            value={followUpActions}
            onChange={(e) => setFollowUpActions(e.target.value)}
            placeholder="Enter next steps, tasks, or scheduled activities..."
            className="input resize-none group-hover:shadow-md transition-all duration-200"
          />

          {/* AI Suggested Follow-ups */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-blue-800">AI Suggested Follow-ups</h3>
            </div>
            <div className="space-y-2">
              <button type="button" className="flex items-center w-full text-sm text-blue-700 hover:text-blue-800 hover:bg-blue-100/50 rounded-lg p-2 transition-all duration-200 group">
                <svg className="w-4 h-4 mr-3 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Schedule follow-up meeting in 2 weeks</span>
              </button>
              <button type="button" className="flex items-center w-full text-sm text-blue-700 hover:text-blue-800 hover:bg-blue-100/50 rounded-lg p-2 transition-all duration-200 group">
                <svg className="w-4 h-4 mr-3 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Send OncoBoost Phase III PDF</span>
              </button>
              <button type="button" className="flex items-center w-full text-sm text-blue-700 hover:text-blue-800 hover:bg-blue-100/50 rounded-lg p-2 transition-all duration-200 group">
                <svg className="w-4 h-4 mr-3 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Dr. Sharma to advisory board invite list</span>
              </button>
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quick Summary (Optional)
              </label>
              <input
                type="text"
                placeholder="Brief description of this interaction..."
                className="input"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={disabled || isLoading}
                className="btn-primary px-8 py-3 text-base font-semibold disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:bg-gray-300 disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Log Interaction
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {flash && (
            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg text-green-800 text-sm font-medium animate-bounce-subtle">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {flash}
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-800 text-sm font-medium animate-bounce-subtle">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Error saving interaction. Please try again.
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}