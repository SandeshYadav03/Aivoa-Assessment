import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type LogMode = "form" | "chat";

interface UIState {
  selectedHcpId: number | null;
  mode: LogMode;
  editingInteractionId: number | null;
}

const initialState: UIState = {
  selectedHcpId: null,
  mode: "form",
  editingInteractionId: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSelectedHcp(state, action: PayloadAction<number | null>) {
      state.selectedHcpId = action.payload;
    },
    setMode(state, action: PayloadAction<LogMode>) {
      state.mode = action.payload;
    },
    setEditingInteraction(state, action: PayloadAction<number | null>) {
      state.editingInteractionId = action.payload;
    },
  },
});

export const { setSelectedHcp, setMode, setEditingInteraction } = uiSlice.actions;
export default uiSlice.reducer;
