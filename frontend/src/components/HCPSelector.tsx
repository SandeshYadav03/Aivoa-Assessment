import { useState, useEffect, useRef } from "react";
import { useListHcpsQuery } from "../store/api";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setSelectedHcp } from "../store/uiSlice";

export default function HCPSelector() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: hcps = [], isLoading } = useListHcpsQuery({ query });
  const { data: allHcps = [] } = useListHcpsQuery();
  const selectedHcpId = useAppSelector((s) => s.ui.selectedHcpId);
  const dispatch = useAppDispatch();

  const selectedHcp = allHcps.find((h) => h.id === selectedHcpId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (hcpId: number) => {
    dispatch(setSelectedHcp(hcpId));
    setQuery("");
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="w-full max-w-md relative">
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
        HCP
      </label>

      {selectedHcp && !isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm bg-white hover:bg-slate-50 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none text-left"
        >
          <div className="text-slate-900 font-medium">{selectedHcp.name}</div>
          <div className="text-xs text-slate-500">
            {selectedHcp.specialty} · {selectedHcp.hospital} · {selectedHcp.city}
          </div>
        </button>
      ) : (
        <input
          type="text"
          placeholder="Please select HCP"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
          autoFocus={isOpen}
        />
      )}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {isLoading && <div className="p-3 text-sm text-slate-500">Loading…</div>}
          {!isLoading && hcps.length === 0 && (
            <div className="p-3 text-sm text-slate-500">No matches.</div>
          )}
          {hcps.map((h) => (
            <button
              key={h.id}
              onClick={() => handleSelect(h.id)}
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
      )}
    </div>
  );
}
