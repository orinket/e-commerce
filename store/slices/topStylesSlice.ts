import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { Product } from '@/types/product'
import { postPublicListing } from '@/lib/publicApi/client/listingPublicClient'
import { mapApiProducts, type ApiProductRow } from '@/lib/publicApi/mappers/catalogFromApi'

interface TopStylesState {
  items: Product[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  totalCount: number
}

const initialState: TopStylesState = {
  items: [],
  status: 'idle',
  error: null,
  totalCount: 0,
}

export const fetchTopStyles = createAsyncThunk(
  'topStyles/fetchTopStyles',
  async (params: { categoryid?: string; pageno?: number; pagelimit?: number } = {}) => {
    const filter: Record<string, unknown> = {
      status: 1,
      storefrontHomeSectionKeys: ['topStylesProducts'],
    }
    if (params.categoryid) {
      filter.categoryid = params.categoryid
    }

    const result = await postPublicListing<ApiProductRow[]>('products', {
      paginationinfo: {
        filter,
        pageno: params.pageno || 1,
        pagelimit: params.pagelimit || 8,
      },
      searchtext: '',
    })
    return {
      items: mapApiProducts(result.data || [], []),
      totalCount: result.totalCount,
    }
  }
)

const topStylesSlice = createSlice({
  name: 'topStyles',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopStyles.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchTopStyles.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchTopStyles.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Something went wrong'
      })
  },
})

export const topStylesReducer = topStylesSlice.reducer
