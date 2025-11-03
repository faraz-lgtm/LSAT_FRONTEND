import { configureStore, combineReducers, createListenerMiddleware } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer from "./cartSlice";
import infoReducer from "./informationSlice";
import authReducer, { reset, setUser, setTokens } from "./authSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "@/redux/api";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "auth", "info"], // 👈 choose which slices to persist
  transforms: [
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      in: (state: any) => {
        // Transform state before saving to storage
        if (state.cart?.items) {
          return {
            ...state,
            cart: {
              ...state.cart,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items: state.cart.items.map((item: any) => ({
                ...item,
                DateTime: item.DateTime?.map((date: Date) => date.toISOString())
              }))
            }
          };
        }
        return state;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out: (state: any) => {
        // Transform state after loading from storage
        if (state.cart?.items) {
          return {
            ...state,
            cart: {
              ...state.cart,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Create listener middleware to invalidate queries on auth state changes
const listenerMiddleware = createListenerMiddleware();

// Listen for auth state changes and invalidate all queries
listenerMiddleware.startListening({
  actionCreator: reset,
  effect: async (action, listenerApi) => {
    // Invalidate all query tags when user logs out
    listenerApi.dispatch(
      api.util.invalidateTags([
        'Orders',
        'Users',
        'AvailableSlots',
        'Products',
        'Tasks',
        'Dashboard',
        'Invoices',
        'Refunds',
        'Transactions',
        'Currency',
        'Automation',
        'Chat',
      ])
    );
  },
});

// Invalidate all queries when user logs in
listenerMiddleware.startListening({
  actionCreator: setUser,
  effect: async (action, listenerApi) => {
    if (action.payload) {
      // User logged in - invalidate all queries to refetch fresh data
      listenerApi.dispatch(
        api.util.invalidateTags([
          'Orders',
          'Users',
          'AvailableSlots',
          'Products',
          'Tasks',
          'Dashboard',
          'Invoices',
          'Refunds',
          'Transactions',
          'Currency',
          'Automation',
          'Chat',
        ])
      );
    }
  },
});

// Also invalidate when tokens are set (login/refresh)
listenerMiddleware.startListening({
  actionCreator: setTokens,
  effect: async (action, listenerApi) => {
    // Invalidate all queries when tokens are set (new login or token refresh)
    listenerApi.dispatch(
      api.util.invalidateTags([
        'Orders',
        'Users',
        'AvailableSlots',
        'Products',
        'Tasks',
        'Dashboard',
        'Invoices',
        'Refunds',
        'Transactions',
        'Currency',
        'Automation',
        'Chat',
      ])
    );
  },
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }).concat(api.middleware, listenerMiddleware.middleware),
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
