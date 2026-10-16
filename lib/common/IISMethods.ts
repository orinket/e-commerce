import { store } from "@/store"
import { setLoadings as patchLoadings } from "@/store/slices/uiSlice"

/**
 * Dashboard-style helper: toggle any `state.ui.loading.*` flag from anywhere
 * (thunks, components, utilities) without importing hooks.
 *
 * @example
 * OrinketIISMethods.setLoadings({ showGridListShimmer: true })
 * OrinketIISMethods.setLoadings({ showGridListShimmer: false, someOtherFlag: true })
 */
export class OrinketIISMethods {
  static setLoadings(updates: Partial<Record<string, boolean>>): void {
    store.dispatch(patchLoadings(updates))
  }
}

/** Function alias if you prefer not using the class. */
export function setLoadings(updates: Partial<Record<string, boolean>>): void {
  OrinketIISMethods.setLoadings(updates)
}
