import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { crmApi } from "./api";
import uiReducer from "./uiSlice";
import chatReducer from "./chatSlice";

export const store = configureStore({
  reducer: {
    [crmApi.reducerPath]: crmApi.reducer,
    ui: uiReducer,
    chat: chatReducer,
  },
  middleware: (getDefault) => getDefault().concat(crmApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
