import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer from "./cartSlice";
import infoReducer from "./informationSlice";
import authReducer from "./authSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "@/redux/api";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "auth"], // 👈 choose which slices to persist
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

// Create the final reducer with all reducers
const finalReducer = combineReducers({
  cart: cartReducer,
  info: infoReducer,
  auth: authReducer,
  [api.reducerPath]: api.reducer,
});

const persistedReducer = persistReducer(persistConfig, finalReducer);

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

// Define RootState explicitly to include all reducers
export type RootState = {
  cart: ReturnType<typeof cartReducer>;
  info: ReturnType<typeof infoReducer>;
  auth: ReturnType<typeof authReducer>;
  api: ReturnType<typeof api.reducer>;
};
