import { configureStore, combineReducers, createListenerMiddleware } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer from "./cartSlice";
import infoReducer from "./informationSlice";
import authReducer, { reset } from "./authSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "@/redux/api";

// Helper function to validate if cart state has correct SlotInput[] format
const isValidCartState = (state: any): boolean => {
  if (!state?.cart?.items || !Array.isArray(state.cart.items)) {
    return true; // Empty or invalid structure is fine, will be reset
  }
  
  return state.cart.items.every((item: any) => {
    if (!item.DateTime) return true; // Items without DateTime are fine
    
    // DateTime must be an array
    if (!Array.isArray(item.DateTime)) return false;
    
    // Each slot must be a SlotInput object with dateTime and availableEmployeeIds
    return item.DateTime.every((slot: any) => {
      return (
        slot &&
        typeof slot === 'object' &&
        'dateTime' in slot &&
        'availableEmployeeIds' in slot &&
        typeof slot.dateTime === 'string' &&
        Array.isArray(slot.availableEmployeeIds)
      );
    });
  });
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "auth", "info"], // 👈 choose which slices to persist
  transforms: [
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      in: (state: any) => {
        // Transform state before saving to storage
        // SlotInput objects are already serializable, so no transformation needed
        return state;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out: (state: any) => {
        // Validate cart state format - if invalid, clear cart
        if (!isValidCartState(state)) {
          console.warn('⚠️ Cart state format mismatch detected. Clearing cart for fresh start.');
          if (state?.cart) {
            state.cart = {
              items: [],
              isLoading: false,
              error: null,
            };
          }
          // Also clear localStorage cart data
          try {
            const persistData = localStorage.getItem('persist:root');
            if (persistData) {
              const parsed = JSON.parse(persistData);
              if (parsed.cart) {
                parsed.cart = JSON.stringify({
                  items: [],
                  isLoading: false,
                  error: null,
                });
                localStorage.setItem('persist:root', JSON.stringify(parsed));
              }
            }
          } catch (e) {
            console.error('Error clearing localStorage:', e);
          }
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
