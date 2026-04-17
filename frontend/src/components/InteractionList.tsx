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
    return <div className="text-sm text-slate-500">Select an HCP to see their interactions.</div>;
  }

  if (isLoading) return <div className="text-sm text-slate-500">Loading…</div>;

  const items = data?.items ?? [];
  if (items.length === 0) {
    return <div className="text-sm text-slate-500">No interactions yet.</div>;
  }

  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i.id} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              #{i.id} · {new Date(i.occurred_at).toLocaleString()} · {i.channel}
              {i.outcome ? ` · ${i.outcome}` : ""}
            </div>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => dispatch(setEditingInteraction(i.id))}
                className="text-brand-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deleteInteraction(i.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
          <div className="mt-1 text-sm text-slate-800">
            {i.summary || i.raw_notes || "(no summary)"}
          </div>
          {i.products_discussed && i.products_discussed.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {i.products_discussed.map((p) => (
                <span
                  key={p}
                  className="rounded bg-brand-50 px-2 py-0.5 text-[11px] text-brand-700"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
          {i.next_step && (
            <div className="mt-1 text-xs text-slate-600">
              <span className="font-semibold">Next:</span> {i.next_step}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
