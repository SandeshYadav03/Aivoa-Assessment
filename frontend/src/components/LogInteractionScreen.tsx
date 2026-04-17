import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setMode } from "../store/uiSlice";
import ChatPanel from "./ChatPanel";
import EditInteractionModal from "./EditInteractionModal";
import HCPSelector from "./HCPSelector";
import InteractionList from "./InteractionList";
import StructuredForm from "./StructuredForm";

export default function LogInteractionScreen() {
  const mode = useAppSelector((s) => s.ui.mode);
  const hcpId = useAppSelector((s) => s.ui.selectedHcpId);
  const dispatch = useAppDispatch();

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Log Interaction</h1>
          <p className="text-sm text-slate-600">
            AI-first CRM for HCP field reps — powered by LangGraph + Groq
          </p>
        </div>
        <div className="inline-flex rounded-md border border-slate-300 bg-white p-1 shadow-sm">
          <ModeButton active={mode === "form"} onClick={() => dispatch(setMode("form"))}>
            Form
          </ModeButton>
          <ModeButton active={mode === "chat"} onClick={() => dispatch(setMode("chat"))}>
            Chat
          </ModeButton>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr_360px]">
        <aside className="space-y-4">
          <HCPSelector />
        </aside>

        <main>
          {mode === "form" ? (
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <StructuredForm hcpId={hcpId} />
            </section>
          ) : (
            <ChatPanel hcpId={hcpId} />
          )}
        </main>

        <aside>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Recent interactions
          </h2>
          <InteractionList hcpId={hcpId} />
        </aside>
      </div>

      <EditInteractionModal />
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded px-3 py-1 text-sm font-medium transition",
        active ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-100",
      )}
    >
      {children}
    </button>
  );
}
