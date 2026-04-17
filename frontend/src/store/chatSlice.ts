import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessage, ToolEvent } from "../types";

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolEvents?: ToolEvent[];
}

interface ChatState {
  turns: ChatTurn[];
  history: ChatMessage[];
  pending: boolean;
}

const initialState: ChatState = {
  turns: [],
  history: [],
  pending: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    userSent(state, action: PayloadAction<string>) {
      state.turns.push({
        id: crypto.randomUUID(),
        role: "user",
        content: action.payload,
      });
      state.history.push({ role: "user", content: action.payload });
      state.pending = true;
    },
    assistantReplied(
      state,
      action: PayloadAction<{ reply: string; toolEvents: ToolEvent[] }>,
    ) {
      state.turns.push({
        id: crypto.randomUUID(),
        role: "assistant",
        content: action.payload.reply,
        toolEvents: action.payload.toolEvents,
      });
      state.history.push({ role: "assistant", content: action.payload.reply });
      state.pending = false;
    },
    requestFailed(state) {
      state.pending = false;
    },
    resetChat() {
      return initialState;
    },
  },
});

export const { userSent, assistantReplied, requestFailed, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
