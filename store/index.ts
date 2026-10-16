import { configureStore } from '@reduxjs/toolkit'
import { catalogReducer } from '@/store/slices/catalogSlice'
import { cartReducer } from '@/store/slices/cartSlice'
import { topStylesReducer } from '@/store/slices/topStylesSlice'
import { uiReducer } from '@/store/slices/uiSlice'

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    cart: cartReducer,
    topStyles: topStylesReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
