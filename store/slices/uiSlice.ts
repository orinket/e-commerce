import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

/**
 * UI flags toggled from anywhere via `setLoadings` (see `lib/common/IISMethods.ts`).
 * Add new keys here for defaults; unknown keys can still be set at runtime.
 */
export type UiLoadingState = {
  showGridListShimmer: boolean
} & Record<string, boolean>

const defaultLoading: UiLoadingState = {
  showGridListShimmer: false,
}

type UiState = {
  loading: UiLoadingState
}

const initialState: UiState = {
  loading: { ...defaultLoading },
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    /** Merge partial loading flags (any string key → boolean). */
    setLoadings(state, action: PayloadAction<Partial<Record<string, boolean>>>) {
      state.loading = {
        ...state.loading,
        ...action.payload,
      } as UiLoadingState
    },
    resetLoadings(state) {
      state.loading = { ...defaultLoading }
    },
  },
})

export const { setLoadings, resetLoadings } = uiSlice.actions
export const uiReducer = uiSlice.reducer
