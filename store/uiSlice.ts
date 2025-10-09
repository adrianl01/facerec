import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UIState = {
  isWebCam: true | false;
};

const initialState: UIState = {
  isWebCam: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setisWebCam(state, action: PayloadAction<true | false>) {
      state.isWebCam = action.payload;
    },
  },
});

export const { setisWebCam } = uiSlice.actions;
export default uiSlice.reducer;
