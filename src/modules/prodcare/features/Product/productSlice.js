import productApi from 'api/productApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Global from 'shared/utils/Global';
// import Global from 'general/utils/Global';

// MARK ---- thunks ---
export const thunkGetListProduct = createAsyncThunk('product/list', async (params, thunkApi) => {
  const res = await productApi.getListProductInTree(params);
  return res;
});

export const thunkGetListProductInTree = createAsyncThunk(
  'product/list-in-tree',
  async (params, thunkApi) => {
    const res = await productApi.getListProductInTree(params);
    return res;
  }
);

export const thunkGetProductDetail = createAsyncThunk(
  'product/detail',
  async (params, thunkApi) => {
    const res = await productApi.getProductDetail(params);
    return res;
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    isGettingProductList: false,
    pagination: { perPage: Global.gDefaultPagination },
    productDetail: {},
    isGettingProductDetail: false,
    events: [],
    issues: [],
  },
  reducers: {
    setPaginationPerPage: (state, action) => {
      return {
        ...state,
        pagination: {
          ...state.pagination,
          perPage: action.payload,
        },
      };
    },
    clearProductDetail: (state, action) => {
      state.productDetail = {};
    },
  },
  extraReducers: (builder) => {
    // get list product
    builder.addCase(thunkGetListProduct.pending, (state, action) => {
      state.isGettingProductList = true;
    });
    builder.addCase(thunkGetListProduct.rejected, (state, action) => {
      state.isGettingProductList = false;
    });
    builder.addCase(thunkGetListProduct.fulfilled, (state, action) => {
      state.isGettingProductList = false;
      const { result, products, total, count, page } = action.payload;
      if (result == 'success') {
        state.products = products;
        state.pagination = {
          ...state.pagination,
          total: total,
          count: count,
          currentPage: page + 1,
        };
      }
    });

    // get product detail
    builder.addCase(thunkGetProductDetail.pending, (state, action) => {
      state.isGettingProductDetail = true;
    });
    builder.addCase(thunkGetProductDetail.rejected, (state, action) => {
      state.isGettingProductDetail = false;
    });
    builder.addCase(thunkGetProductDetail.fulfilled, (state, action) => {
      state.isGettingProductDetail = false;
      const { result, product, issues, events } = action.payload;
      if (result == 'success') {
        state.productDetail = product;
        state.events = events;
        state.issues = issues;
      }
    });
  },
});
const { reducer, actions } = productSlice;
export const { setPaginationPerPage, clearProductDetail } = actions;
export default reducer;
