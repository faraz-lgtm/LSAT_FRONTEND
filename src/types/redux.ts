// types/redux.ts
import { combineReducers } from "@reduxjs/toolkit";
import cartReducer from "../redux/cartSlice";
import infoReducer from "../redux/informationSlice";
import authReducer from "../redux/authSlice";

// Create rootReducer without API reducer initially
const rootReducer = combineReducers({
  cart: cartReducer,
  info: infoReducer,
  auth: authReducer,
});

// Export RootState from store to include API state
export type { RootState } from "../redux/store";
export default rootReducer;
