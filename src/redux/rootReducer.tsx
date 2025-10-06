import { combineReducers } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import infoReducer from "./informationSlice";
import { api } from "@/redux/api";

const rootReducer = combineReducers({
  cart: cartReducer,
  info: infoReducer,
  [api.reducerPath]: api.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
