import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { ItemInput } from "@/types/api/data-contracts";
import { fetchSlotsForPackage } from "@/utils/slotFetcher";
import type { RootState } from "./store";

export type CartItem = ItemInput;

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
};

// Async thunk for adding items to cart with slot fetching
export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async (item: ItemInput, { rejectWithValue, getState }) => {
    try {
      const requiredSlots = item.sessions;
      if (!requiredSlots) {
        throw new Error("Invalid item: sessions count is required");
      }

      console.log(`🛒 Adding item ${item.id} to cart with ${requiredSlots} sessions`);
      
      // Get current cart state to extract already booked slots
      const state = getState() as RootState;
      const cartItems = state.cart?.items || [];
      
      // Extract all already booked slots from existing cart items
      const bookedSlots = cartItems.flatMap((cartItem: ItemInput) => 
        cartItem.DateTime || []
      ).filter((slot: string) => slot && slot.trim() !== '');
      
      console.log(`📋 Found ${bookedSlots.length} already booked slots in cart:`, bookedSlots);
      
      // Fetch available slots for the package, excluding already booked ones
      const slots = await fetchSlotsForPackage(item.id, requiredSlots, new Date(), bookedSlots);
      
      // Create the cart item with fetched slots
      const cartItem: ItemInput = {
        ...item,
        DateTime: slots,
        quantity: 1,
      };

      console.log(`✅ Successfully added item to cart with ${slots.length} slots`);
      return cartItem;
    } catch (error: unknown) {
      console.error(`❌ Failed to add item to cart:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch available slots';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for increasing quantity with slot fetching
export const increaseQuantityAsync = createAsyncThunk(
  'cart/increaseQuantityAsync',
  async (itemId: number, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const item = state.cart.items.find((i) => i.id === itemId);
      
      if (!item) {
        throw new Error("Item not found in cart");
      }

      const requiredSlots = item.sessions;
      if (!requiredSlots) {
        throw new Error("Invalid item: sessions count is required");
      }

      const newQuantity = item.quantity + 1;
      const totalSlotsNeeded = requiredSlots * newQuantity;
      const currentSlotsCount = item.DateTime?.length || 0;
      const additionalSlotsNeeded = totalSlotsNeeded - currentSlotsCount;

      console.log(`📈 Increasing quantity for item ${itemId}: quantity=${newQuantity}, totalSlotsNeeded=${totalSlotsNeeded}, additionalSlotsNeeded=${additionalSlotsNeeded}`);

      if (additionalSlotsNeeded > 0) {
        // Get all already booked slots from cart (including current item's slots)
        const cartItems = state.cart.items || [];
        const bookedSlots = cartItems.flatMap((cartItem: ItemInput) => 
          cartItem.DateTime || []
        ).filter((slot: string) => slot && slot.trim() !== '');
        
        console.log(`📋 Found ${bookedSlots.length} already booked slots in cart`);
        
        // Fetch additional slots for the package, excluding already booked ones
        const additionalSlots = await fetchSlotsForPackage(item.id, additionalSlotsNeeded, new Date(), bookedSlots);
        
        console.log(`✅ Successfully fetched ${additionalSlots.length} additional slots for item ${itemId}`);
        
        return {
          itemId,
          newQuantity,
          additionalSlots
        };
      } else {
        // No additional slots needed
        return {
          itemId,
          newQuantity,
          additionalSlots: []
        };
      }
    } catch (error: unknown) {
      console.error(`❌ Failed to increase quantity for item ${itemId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch additional slots';
      return rejectWithValue(errorMessage);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    updateBookingDate: (state, action) => {
      console.log(action.payload);
      const { id, bookingDate, index } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (
        item &&
        Array.isArray(item.DateTime) &&
        index >= 0 &&
        index < item.DateTime.length
      ) {
        item.DateTime[index] = new Date(bookingDate).toString(); // update just one slot
      }
    },

    decreaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.quantity -= 1;

        // Update DateTime array based on new quantity
        const requiredSlots = item.sessions;
        if (requiredSlots) {
          const totalSlotsNeeded = requiredSlots * item.quantity;
          console.log(
            `Decreasing quantity for item ${item.id}: quantity=${item.quantity}, requiredSlots=${requiredSlots}, totalSlotsNeeded=${totalSlotsNeeded}, currentDateTimeLength=${item.DateTime?.length}`
          );

          if (item.DateTime && item.DateTime.length > totalSlotsNeeded) {
            // Remove excess slots
            item.DateTime = item.DateTime.slice(0, totalSlotsNeeded);
            console.log(
              `Removed excess slots. New DateTime length: ${item.DateTime.length}`
            );
          } else if (item.DateTime && item.DateTime.length < totalSlotsNeeded) {
            // Add more slots
            // const currentLength = item.DateTime.length;
            // const newSlots = Array.from({ length: totalSlotsNeeded - currentLength }, () => undefined);
            // item.DateTime = [...item.DateTime, ...newSlots];
            const currentLength = item.DateTime.length;
            const slotsToAdd = totalSlotsNeeded - currentLength;
            if (slotsToAdd > 0) {
              item.DateTime = [...item.DateTime, ...Array(slotsToAdd).fill("")];
            }
            console.log(
              `Added ${slotsToAdd} new slots. New DateTime length: ${item.DateTime?.length}`
            );
          }
        }

        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload);
        }
      }
    },

    increaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.quantity += 1;
        console.log(`📈 Increased quantity for item ${item.id} to ${item.quantity}`);
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        const newItem = action.payload;
        const existing = state.items.find((item) => item.id === newItem.id);
        
        if (existing) {
          // Don't allow user to add a package multiple times in one session
          console.info("Package already exists in cart, not adding duplicate");
        } else {
          state.items.push(newItem);
          console.log("Cart updated with fetched slots", newItem);
        }
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        console.error("Failed to add item to cart:", action.payload);
      })
      .addCase(increaseQuantityAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(increaseQuantityAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        
        const { itemId, newQuantity, additionalSlots } = action.payload;
        const item = state.items.find((i) => i.id === itemId);
        
        if (item) {
          item.quantity = newQuantity;
          
          // Add additional slots to existing DateTime array
          if (additionalSlots.length > 0) {
            item.DateTime = [...(item.DateTime || []), ...additionalSlots];
            console.log(`✅ Added ${additionalSlots.length} additional slots to item ${itemId}`);
          }
        }
      })
      .addCase(increaseQuantityAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        console.error("Failed to increase quantity:", action.payload);
      });
  },
});

export const {
  decreaseQuantity,
  removeFromCart,
  clearCart,
  updateBookingDate,
  increaseQuantity,
  clearError,
} = cartSlice.actions;

export default cartSlice.reducer;
