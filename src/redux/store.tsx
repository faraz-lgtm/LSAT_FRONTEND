import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./rootReducer";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "@/redux/api";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart"], // 👈 choose which slices to persist
  transforms: [
    {
      in: (state: any) => {
        // Transform state before saving to storage
        if (state.cart?.items) {
          return {
            ...state,
            cart: {
              ...state.cart,
              items: state.cart.items.map((item: any) => ({
                ...item,
                DateTime: item.DateTime?.map((date: Date) => date.toISOString())
              }))
            }
          };
        }
        return state;
      },
      out: (state: any) => {
        // Transform state after loading from storage
        if (state.cart?.items) {
          return {
            ...state,
            cart: {
              ...state.cart,
              items: state.cart.items.map((item: any) => ({
                ...item,
                DateTime: item.DateTime?.map((dateString: string) => new Date(dateString))
              }))
            }
          };
        }
        return state;
      }
    }
  ]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }).concat(api.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

// Types
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
