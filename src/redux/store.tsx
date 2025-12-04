import { configureStore, combineReducers, createListenerMiddleware } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer from "./cartSlice";
import infoReducer from "./informationSlice";
import authReducer, { reset } from "./authSlice";
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

// Create listener middleware to invalidate queries on login/logout
const listenerMiddleware = createListenerMiddleware();

// Invalidate all queries when user logs out
listenerMiddleware.startListening({
  actionCreator: reset,
  effect: async (_action, listenerApi) => {
    // User logged out - invalidate all queries to clear cached data
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

// Invalidate all queries when user logs in (transition from logged out to logged in)
// This uses a predicate to detect when auth state transitions from "not logged in" to "logged in"
listenerMiddleware.startListening({
  predicate: (_action, currentState, previousState) => {
    const prevAuth = (previousState as any)?.auth;
    const currAuth = (currentState as any)?.auth;
    
    // Check if we transitioned from "not fully logged in" to "fully logged in"
    // Previous state: user is null OR tokens are empty (not fully logged in)
    // Current state: user exists AND tokens exist (fully logged in)
    const wasNotLoggedIn = !prevAuth?.user || !prevAuth?.accessToken || !prevAuth?.refreshToken;
    const isNowLoggedIn = !!currAuth?.user && !!currAuth?.accessToken && !!currAuth?.refreshToken;
    
    // Only trigger on actual login transition (not token refresh)
    // Token refresh would have user and tokens in both previous and current state
    return wasNotLoggedIn && isNowLoggedIn;
  },
  effect: async (_action, listenerApi) => {
    // User completed login - invalidate all queries to refetch fresh data
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
