import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { RootState } from "@/app/store"

interface UIState {
  activeDropdownId: string | null
}

const initialState: UIState = {
  activeDropdownId: null,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveDropdown: (state, action: PayloadAction<string | null>) => {
      state.activeDropdownId = action.payload
    },
    clearActiveDropdown: (state) => {
      state.activeDropdownId = null
    },
    toggleDropdown: (state, action: PayloadAction<string>) => {
      state.activeDropdownId = state.activeDropdownId === action.payload ? null : action.payload
    },
  },
})

export const { setActiveDropdown, clearActiveDropdown, toggleDropdown } = uiSlice.actions

export const selectActiveDropdownId = (state: RootState) => state.ui.activeDropdownId

export default uiSlice.reducer
