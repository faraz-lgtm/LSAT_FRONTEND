import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { Product } from "../Interfaces/product";

export type CartItem = Product & { quantity: number };

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

// helper map: productId → number of DateTimes required
const bookingConfig: Record<number, number> = {
  5: 1,
  8: 1,
  6: 5,
  7: 10,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      console.log("Adding to cart....")
      const existing = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existing) {
        // don't allow user to add a package multiple times in one session
        console.info(
          "don't allow user to add a package multiple times in one session"
        );
      } else {
      const requiredSlots = bookingConfig[action.payload.id];
      if (!requiredSlots) {
        console.error("Wrong item pushed, Please contact dev!");
        return;
      }

      // Create a copy of product and assign DateTimes based on quantity
      const productCopy: Product = {
        ...action.payload,
        DateTime: Array.from({ length: requiredSlots }, () => undefined),
      };

      console.log("Cart updated",productCopy)
      state.items.push({ ...productCopy, quantity: 1 });
      }
    },
    updateBookingDate: (state, action) => {
      console.log(action.payload);
      const { id, bookingDate, index } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item && Array.isArray(item.DateTime) && index >= 0 && index < item.DateTime.length) {
        item.DateTime[index] = new Date(bookingDate); // update just one slot
      }
    },

    decreaseQuantity: (state, action: PayloadAction<number>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.quantity -= 1;
        
        // Update DateTime array based on new quantity
        const requiredSlots = bookingConfig[item.id];
        if (requiredSlots) {
          const totalSlotsNeeded = requiredSlots * item.quantity;
          console.log(`Decreasing quantity for item ${item.id}: quantity=${item.quantity}, requiredSlots=${requiredSlots}, totalSlotsNeeded=${totalSlotsNeeded}, currentDateTimeLength=${item.DateTime?.length}`);
          
          if (item.DateTime && item.DateTime.length > totalSlotsNeeded) {
            // Remove excess slots
            item.DateTime = item.DateTime.slice(0, totalSlotsNeeded);
            console.log(`Removed excess slots. New DateTime length: ${item.DateTime.length}`);
          } else if (item.DateTime && item.DateTime.length < totalSlotsNeeded) {
            // Add more slots
            const currentLength = item.DateTime.length;
            const newSlots = Array.from({ length: totalSlotsNeeded - currentLength }, () => undefined);
            item.DateTime = [...item.DateTime, ...newSlots];
            console.log(`Added ${newSlots.length} new slots. New DateTime length: ${item.DateTime.length}`);
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
        
        // Update DateTime array based on new quantity
        const requiredSlots = bookingConfig[item.id];
        if (requiredSlots) {
          const totalSlotsNeeded = requiredSlots * item.quantity;
          console.log(`Increasing quantity for item ${item.id}: quantity=${item.quantity}, requiredSlots=${requiredSlots}, totalSlotsNeeded=${totalSlotsNeeded}, currentDateTimeLength=${item.DateTime?.length}`);
          
          if (item.DateTime && item.DateTime.length < totalSlotsNeeded) {
            // Add more slots
            const currentLength = item.DateTime.length;
            const newSlots = Array.from({ length: totalSlotsNeeded - currentLength }, () => undefined);
            item.DateTime = [...item.DateTime, ...newSlots];
            console.log(`Added ${newSlots.length} new slots. New DateTime length: ${item.DateTime.length}`);
          }
        }
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  updateBookingDate,
  increaseQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
