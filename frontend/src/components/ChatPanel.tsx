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
      const detail =
        (err as { data?: { detail?: string } })?.data?.detail ??
        "Sorry — the agent errored. Check the backend logs.";
      dispatch(assistantReplied({
        reply: detail,
        toolEvents: [],
      }));
      dispatch(requestFailed());
      console.error(err);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg backdrop-blur-sm animate-fade-in">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-auto p-6 custom-scrollbar">
        {turns.length === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 text-center animate-slide-up">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-2">Start a conversation with RepPilot</p>
            <p className="text-xs text-gray-600">Try: "Log that I met Dr. Sharma today about Atorvastatin — she was positive, follow up in two weeks."</p>
          </div>
        )}
        {turns.map((t, index) => (
          <div
            key={t.id}
            className={`flex ${t.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`flex items-end space-x-2 max-w-[85%] ${
              t.role === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                t.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                  : "bg-gradient-to-r from-purple-500 to-pink-600"
              }`}>
                {t.role === "user" ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
              </div>

              {/* Message */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  t.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{t.content}</div>
                {/* {t.toolEvents && t.toolEvents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {t.toolEvents.map((ev, i) => (
                      <ToolEventChip key={i} ev={ev} />
                    ))}
                  </div>
                )} */}
              </div>
            </div>
          </div>
        ))}
        {pending && (
          <div className="flex justify-start animate-slide-up">
            <div className="flex items-end space-x-2 max-w-[85%]">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">RepPilot is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={onSend} className="border-t border-gray-100/50 p-4 bg-white/50 backdrop-blur-sm rounded-b-xl">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message RepPilot..."
              className="w-full rounded-2xl border-0 bg-gray-100 px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 pr-12"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {pending ? (
              <div className="spinner"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>AI Assistant Ready</span>
          </div>
          <span>Press Enter to send</span>
        </div>
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
      className="block w-full rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 px-3 py-2 text-left text-xs transition-all duration-200 group"
    >
      <div className="flex items-center space-x-2">
        <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
          🛠
        </div>
        <span className="font-semibold text-gray-800">{ev.tool}</span>
        {ev.error ? (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-red-600 font-medium">Error</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-600 font-medium">Success</span>
          </div>
        )}
        <svg className={`w-4 h-4 text-gray-400 ml-auto transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white border border-gray-200 p-3 text-[11px] text-gray-700 animate-slide-up">
{JSON.stringify({ args: ev.args, result: ev.result }, null, 2)}
        </pre>
      )}
    </button>
  );
}
