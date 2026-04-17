import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ChatRequest,
  ChatResponse,
  HCP,
  Interaction,
  InteractionCreate,
  InteractionList,
  InteractionUpdate,
} from "../types";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const crmApi = createApi({
  reducerPath: "crmApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["HCP", "Interaction"],
  endpoints: (builder) => ({
    listHcps: builder.query<HCP[], { query?: string; specialty?: string; city?: string } | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.query) params.set("query", args.query);
        if (args?.specialty) params.set("specialty", args.specialty);
        if (args?.city) params.set("city", args.city);
        const qs = params.toString();
        return `/hcps${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["HCP"],
    }),

    listInteractions: builder.query<InteractionList, { hcp_id?: number; limit?: number; offset?: number } | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.hcp_id != null) params.set("hcp_id", String(args.hcp_id));
        if (args?.limit != null) params.set("limit", String(args.limit));
        if (args?.offset != null) params.set("offset", String(args.offset));
        const qs = params.toString();
        return `/interactions${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Interaction"],
    }),

    createInteraction: builder.mutation<Interaction, InteractionCreate>({
      query: (body) => ({ url: "/interactions", method: "POST", body }),
      invalidatesTags: ["Interaction"],
    }),

    updateInteraction: builder.mutation<Interaction, { id: number; patch: InteractionUpdate }>({
      query: ({ id, patch }) => ({ url: `/interactions/${id}`, method: "PATCH", body: patch }),
      invalidatesTags: ["Interaction"],
    }),

    deleteInteraction: builder.mutation<void, number>({
      query: (id) => ({ url: `/interactions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Interaction"],
    }),

    chat: builder.mutation<ChatResponse, ChatRequest>({
      query: (body) => ({ url: "/chat", method: "POST", body }),
      invalidatesTags: ["Interaction"],
    }),
  }),
});

export const {
  useListHcpsQuery,
  useListInteractionsQuery,
  useCreateInteractionMutation,
  useUpdateInteractionMutation,
  useDeleteInteractionMutation,
  useChatMutation,
} = crmApi;
