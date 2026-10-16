import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit"
import type { Product } from "@/types/product"
import { postPublicListing } from "@/lib/publicApi/client/listingPublicClient"
import {
  deriveCatalogFromRaw,
  type ApiCategoryRow,
  type ApiProductRow,
  type ApiSubcategoryRow,
  type CatalogCategoryRow,
  type CatalogSubcategoryRow,
} from "@/lib/publicApi/mappers/catalogFromApi"

export type { CatalogCategoryRow, CatalogSubcategoryRow }

export type CatalogResourceKey = "categories" | "subcategories" | "products"

type ResourceStatus = "idle" | "loading" | "succeeded" | "failed"

function applyDerivation(state: {
  rawCategories: ApiCategoryRow[]
  rawSubcategories: ApiSubcategoryRow[]
  rawProducts: ApiProductRow[]
  categories: CatalogCategoryRow[]
  subcategories: CatalogSubcategoryRow[]
  products: Product[]
}) {
  const d = deriveCatalogFromRaw(
    state.rawCategories,
    state.rawSubcategories,
    state.rawProducts
  )
  state.categories = d.categories
  state.subcategories = d.subcategories
  state.products = d.products
}

export type FetchPublicListingArg = {
  resource: CatalogResourceKey
  paginationinfo?: Record<string, unknown>
  searchtext?: string
  skipIfLoaded?: boolean
}

type CatalogAwareState = {
  catalog: { status: Record<CatalogResourceKey, ResourceStatus> }
}

export const fetchPublicListing = createAsyncThunk(
  "catalog/fetchPublicListing",
  async (arg: FetchPublicListingArg, { rejectWithValue }) => {
    try {
      const body = {
        paginationinfo: arg.paginationinfo ?? {},
        searchtext: arg.searchtext ?? "",
      }
      const result = await postPublicListing<unknown[]>(arg.resource, body)
      return {
        resource: arg.resource,
        rows: result.data,
        totalCount: result.totalCount,
        count: result.count,
      }
    } catch (e) {
      return rejectWithValue(
        e instanceof Error ? e.message : "listing_failed"
      )
    }
  },
  {
    condition: (arg, { getState }) => {
      if (!arg.skipIfLoaded) return true
      const s = (getState() as CatalogAwareState).catalog.status[arg.resource]
      return s !== "succeeded"
    },
  }
)

const catalogSlice = createSlice({
  name: "catalog",
  initialState: {
    rawCategories: [] as ApiCategoryRow[],
    rawSubcategories: [] as ApiSubcategoryRow[],
    rawProducts: [] as ApiProductRow[],
    categories: [] as CatalogCategoryRow[],
    subcategories: [] as CatalogSubcategoryRow[],
    products: [] as Product[],
    listingMeta: {
      categories: { totalCount: 0, count: 0 },
      subcategories: { totalCount: 0, count: 0 },
      products: { totalCount: 0, count: 0 },
    },
    status: {
      categories: "idle" as ResourceStatus,
      subcategories: "idle" as ResourceStatus,
      products: "idle" as ResourceStatus,
    },
    errors: {
      categories: null as string | null,
      subcategories: null as string | null,
      products: null as string | null,
    },
  },
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicListing.pending, (state, action) => {
        const key = action.meta.arg.resource
        state.status[key] = "loading"
        state.errors[key] = null
      })
      .addCase(fetchPublicListing.fulfilled, (state, action) => {
        const { resource, rows, totalCount, count } = action.payload
        state.status[resource] = "succeeded"
        state.errors[resource] = null
        state.listingMeta[resource] = { totalCount, count }

        if (resource === "categories") {
          state.rawCategories = rows as ApiCategoryRow[]
        } else if (resource === "subcategories") {
          state.rawSubcategories = rows as ApiSubcategoryRow[]
        } else {
          state.rawProducts = rows as ApiProductRow[]
        }
        applyDerivation(state)
      })
      .addCase(fetchPublicListing.rejected, (state, action) => {
        const key = action.meta.arg.resource
        state.status[key] = "failed"
        state.errors[key] =
          typeof action.payload === "string"
            ? action.payload
            : action.error.message ?? `${key} failed`
      })
  },
})

export const { setProducts } = catalogSlice.actions
export const catalogReducer = catalogSlice.reducer
