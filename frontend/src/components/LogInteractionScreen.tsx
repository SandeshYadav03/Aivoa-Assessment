import clsx from "clsx";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setMode } from "../store/uiSlice";
import ChatPanel from "./ChatPanel";
import EditInteractionModal from "./EditInteractionModal";
import InteractionList from "./InteractionList";
import StructuredForm from "./StructuredForm";

export default function LogInteractionScreen() {
  const mode = useAppSelector((s) => s.ui.mode);
  const hcpId = useAppSelector((s) => s.ui.selectedHcpId);
  const dispatch = useAppDispatch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 animate-fade-in">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative card-elevated border-0 px-6 py-4 mx-4 mt-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Log HCP Interaction</h1>
              <p className="text-sm text-gray-600">Pharmaceutical Sales Rep Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="inline-flex rounded-xl bg-white/50 backdrop-blur-sm border border-white/30 shadow-lg p-1">
              <ModeButton active={mode === "form"} onClick={() => dispatch(setMode("form"))}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Form
              </ModeButton>
              <ModeButton active={mode === "chat"} onClick={() => dispatch(setMode("chat"))}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat
              </ModeButton>
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex h-[calc(100vh-120px)] px-4 pb-4">
        {/* Left Side - Main Form */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-2">
            {/* Main Content */}
            <div className="card-elevated p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <StructuredForm hcpId={hcpId} />
            </div>
          </div>
        </div>

        {/* Right Side - AI Assistant Panel */}
        <div className="w-96 ml-4 mt-2 card-elevated flex flex-col animate-slide-up" style={{ animationDelay: '300ms' }}>
          {mode === "chat" ? (
            <ChatPanel hcpId={hcpId} />
          ) : (
            <>
              {/* AI Assistant Header */}
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-t-xl">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">AI Assistant</h2>
                    <p className="text-sm text-gray-600">Smart interaction logging</p>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-6 custom-scrollbar">
                <div className="h-full flex flex-col">
                  {/* <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-xl p-6 mb-6 border border-blue-100 backdrop-blur-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        💡
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        <p className="font-medium text-gray-900 mb-2">Quick Tips:</p>
                        <p className="mb-2">Try: "Met Dr. Smith today about Atorvastatin — she was positive, follow up in two weeks."</p>
                        <p>Or ask: "How should I follow up after a neutral meeting?"</p>
                      </div>
                    </div>
                  </div> */}

                  {/* Recent Interactions */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h3 className="text-sm font-bold text-gray-900">Recent Interactions</h3>
                    </div>
                    <div className="space-y-2 max-h-full overflow-y-auto custom-scrollbar">
                      <InteractionList hcpId={hcpId} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
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
        "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95",
        active
          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
          : "text-gray-700 hover:bg-white/70 bg-transparent hover:shadow-sm"
      )}
    >
      {children}
    </button>
  );
}