import { useState } from "react";
import { useListHcpsQuery } from "../store/api";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setSelectedHcp } from "../store/uiSlice";

export default function HCPSelector() {
  const [query, setQuery] = useState("");
  const { data: hcps = [], isLoading } = useListHcpsQuery({ query });
  const selectedHcpId = useAppSelector((s) => s.ui.selectedHcpId);
  const dispatch = useAppDispatch();

  return (
    <div className="w-full max-w-md">
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
        HCP
      </label>
      <input
        type="text"
        placeholder="Search by name or hospital…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
      />
      <div className="mt-2 max-h-56 overflow-auto rounded-md border border-slate-200 bg-white">
        {isLoading && <div className="p-3 text-sm text-slate-500">Loading…</div>}
        {!isLoading && hcps.length === 0 && (
          <div className="p-3 text-sm text-slate-500">No matches.</div>
        )}
        {hcps.map((h) => (
          <button
            key={h.id}
            onClick={() => dispatch(setSelectedHcp(h.id))}
            className={`block w-full px-3 py-2 text-left text-sm hover:bg-brand-50 ${
              selectedHcpId === h.id ? "bg-brand-100 font-semibold" : ""
            }`}
          >
            <div className="text-slate-900">{h.name}</div>
            <div className="text-xs text-slate-500">
              {h.specialty} · {h.hospital} · {h.city}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
