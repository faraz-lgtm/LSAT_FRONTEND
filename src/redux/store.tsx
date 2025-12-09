import { configureStore, combineReducers, createListenerMiddleware } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer from "./cartSlice";
import infoReducer from "./informationSlice";
import authReducer, { reset } from "./authSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "@/redux/api";

// Helper function to validate cart items from parsed data
const validateCartItems = (items: any[]): boolean => {
  if (!Array.isArray(items) || items.length === 0) {
    return true; // Empty is fine
  }
  
  return items.every((item: any) => {
    if (!item.DateTime) {
      return true; // Items without DateTime are fine
    }
    
    if (!Array.isArray(item.DateTime)) {
      console.log('❌ DateTime is not an array for item:', item.id, item.DateTime);
      return false;
    }
    
    return item.DateTime.every((slot: any) => {
      // Slot must be an object (not a string, not null, etc.)
      if (!slot || typeof slot !== 'object' || Array.isArray(slot)) {
        console.log('❌ Slot is not an object. Slot:', slot, 'Type:', typeof slot);
        return false;
      }
      
      // Slot must have dateTime property (string)
      if (!('dateTime' in slot) || typeof slot.dateTime !== 'string') {
        console.log('❌ Slot missing dateTime or dateTime is not a string. Slot:', slot);
        return false;
      }
      
      // Slot must have availableEmployeeIds property (array)
      if (!('availableEmployeeIds' in slot) || !Array.isArray(slot.availableEmployeeIds)) {
        console.log('❌ Slot missing availableEmployeeIds or it is not an array. Slot:', slot);
        return false;
      }
      
      return true;
    });
  });
};

// Helper function to validate if cart state has correct SlotInput[] format
const isValidCartState = (state: any): boolean => {
  if (!state?.cart) {
    return true;
  }
  
  if (!state.cart.items || !Array.isArray(state.cart.items)) {
    return true;
  }
  
  return validateCartItems(state.cart.items);
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "auth", "info"],
  transforms: [
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      in: (state: any) => {
        return state;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out: (state: any) => {
        // Validate directly from localStorage since state might not be rehydrated yet
        try {
          const persistData = localStorage.getItem('persist:root');
          if (persistData) {
            const parsed = JSON.parse(persistData);
            if (parsed.cart) {
              const cartData = JSON.parse(parsed.cart);
              console.log('🔍 Validating cart from localStorage...', {
                hasItems: !!cartData?.items,
                itemsLength: cartData?.items?.length,
                firstItemDateTime: cartData?.items?.[0]?.DateTime
              });
              
              if (!validateCartItems(cartData?.items || [])) {
                console.warn('⚠️ Cart state format mismatch detected in localStorage. Clearing cart...');
                parsed.cart = JSON.stringify({
                  items: [],
                  isLoading: false,
                  error: null,
                });
                localStorage.setItem('persist:root', JSON.stringify(parsed));
                
                // Also clear from state if it exists
                if (state?.cart) {
                  state.cart = {
                    items: [],
                    isLoading: false,
                    error: null,
                  };
                }
                return state;
              }
            }
          }
        } catch (e) {
          console.error('Error validating cart from localStorage:', e);
        }
        
        // Also validate state if it exists
        if (state?.cart && !isValidCartState(state)) {
          console.warn('⚠️ Cart state format mismatch detected in state. Clearing cart...');
          state.cart = {
            items: [],
            isLoading: false,
            error: null,
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

// Validate after rehydration completes using a listener
listenerMiddleware.startListening({
  predicate: (action) => {
    return action.type === 'persist/REHYDRATE';
  },
  effect: async (_action, listenerApi) => {
    // Check immediately - REHYDRATE means state is ready
    const state = listenerApi.getState() as RootState;
    
    // Early exit if no cart items
    if (!state?.cart?.items || state.cart.items.length === 0) {
      return;
    }
    
    if (!isValidCartState(state)) {
      console.warn('⚠️ Invalid cart state detected after rehydration. Clearing cart...');
      listenerApi.dispatch({ type: 'cart/clearCart' });
      
      // Clear localStorage asynchronously to not block
      setTimeout(() => {
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
          console.error('Error clearing localStorage after rehydration:', e);
        }
      }, 0); // Run on next tick, non-blocking
    }
  },
});

// Types
export type AppDispatch = typeof store.dispatch;

// Define RootState explicitly to include all reducers
export type RootState = {
  cart: ReturnType<typeof cartReducer>;
  info: ReturnType<typeof infoReducer>;
  auth: ReturnType<typeof authReducer>;
  api: ReturnType<typeof api.reducer>;
};
