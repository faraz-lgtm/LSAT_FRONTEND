import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type InformationState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

const initialState: InformationState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const informationSlice = createSlice({
  name: "information",
  initialState,
  reducers: {
    addInfo: (state, action: PayloadAction<InformationState>) => {
      return { ...state, ...action.payload }; 
    },
    clearInfo: () => {
      return initialState;
    },
  },
});

export const { addInfo, clearInfo } = informationSlice.actions;
export default informationSlice.reducer;
