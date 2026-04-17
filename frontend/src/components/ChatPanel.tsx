import { useEffect, useRef, useState } from "react";
import { useChatMutation } from "../store/api";
import { useAppDispatch, useAppSelector } from "../hooks";
import { assistantReplied, requestFailed, userSent } from "../store/chatSlice";
import type { ToolEvent } from "../types";

interface Props {
  hcpId: number | null;
}

export default function ChatPanel({ hcpId }: Props) {
  const [input, setInput] = useState("");
  const [chat] = useChatMutation();
  const dispatch = useAppDispatch();
  const turns = useAppSelector((s) => s.chat.turns);
  const history = useAppSelector((s) => s.chat.history);
  const pending = useAppSelector((s) => s.chat.pending);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, pending]);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    const message = input.trim();
    if (!message || pending) return;
    setInput("");
    dispatch(userSent(message));
    try {
      const res = await chat({ hcp_id: hcpId, message, history }).unwrap();
      dispatch(assistantReplied({ reply: res.reply, toolEvents: res.tool_events }));
    } catch (err) {
      dispatch(assistantReplied({
        reply: "Sorry — the agent errored. Check the backend logs.",
        toolEvents: [],
      }));
      dispatch(requestFailed());
      console.error(err);
    }
  }

  return (
    <div className="flex h-[520px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-auto p-4">
        {turns.length === 0 && (
          <div className="text-sm text-slate-500">
            Try: "Log that I met Dr. Sharma today about Atorvastatin — she was positive, follow
            up in two weeks."
          </div>
        )}
        {turns.map((t) => (
          <div
            key={t.id}
            className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                t.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-900"
              }`}
            >
              <div className="whitespace-pre-wrap">{t.content}</div>
              {t.toolEvents && t.toolEvents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {t.toolEvents.map((ev, i) => (
                    <ToolEventChip key={i} ev={ev} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {pending && (
          <div className="text-sm italic text-slate-500">RepPilot is thinking…</div>
        )}
      </div>
      <form onSubmit={onSend} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask RepPilot…"
          className="input"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-slate-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function ToolEventChip({ ev }: { ev: ToolEvent }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className="block w-full rounded border border-slate-300 bg-white px-2 py-1 text-left text-xs text-slate-700"
    >
      <span className="font-semibold">🛠 {ev.tool}</span>
      {ev.error ? (
        <span className="ml-2 text-red-600">· {ev.error}</span>
      ) : (
        <span className="ml-2 text-emerald-700">· ok</span>
      )}
      {open && (
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-50 p-2 text-[11px] text-slate-700">
{JSON.stringify({ args: ev.args, result: ev.result }, null, 2)}
        </pre>
      )}
    </button>
  );
}
