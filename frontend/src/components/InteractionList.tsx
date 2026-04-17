import {
  useDeleteInteractionMutation,
  useListInteractionsQuery,
} from "../store/api";
import { useAppDispatch } from "../hooks";
import { setEditingInteraction } from "../store/uiSlice";

interface Props {
  hcpId: number | null;
}

export default function InteractionList({ hcpId }: Props) {
  const { data, isLoading } = useListInteractionsQuery(
    hcpId ? { hcp_id: hcpId, limit: 20 } : undefined,
    { skip: hcpId === null },
  );
  const [deleteInteraction] = useDeleteInteractionMutation();
  const dispatch = useAppDispatch();

  if (hcpId === null) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <p className="text-sm text-gray-500">Select an HCP to see their interactions.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-sm text-gray-500">Loading interactions...</p>
      </div>
    );
  }

  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-gray-500">No interactions yet.</p>
        <p className="text-xs text-gray-400 mt-1">Start logging interactions to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((i, index) => (
        <div key={i.id} className="card p-4 hover:shadow-md transition-all duration-200 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="text-xs text-gray-500 font-medium">
                #{i.id} · {new Date(i.occurred_at).toLocaleDateString()}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                i.outcome === 'positive' ? 'bg-green-100 text-green-700' :
                i.outcome === 'negative' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {i.channel}
              </span>
              {i.outcome && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  i.outcome === 'positive' ? 'bg-green-100 text-green-700' :
                  i.outcome === 'negative' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {i.outcome}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => dispatch(setEditingInteraction(i.id))}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 hover:scale-110"
                title="Edit interaction"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => deleteInteraction(i.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 hover:scale-110"
                title="Delete interaction"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-800 leading-relaxed mb-3">
            {i.summary || i.raw_notes || "(no summary)"}
          </div>

          {i.products_discussed && i.products_discussed.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 font-medium mb-1">Products Discussed:</div>
              <div className="flex flex-wrap gap-1">
                {i.products_discussed.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {i.next_step && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-xs text-amber-700 font-medium mb-1">Next Action:</div>
                  <div className="text-xs text-amber-800">{i.next_step}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
