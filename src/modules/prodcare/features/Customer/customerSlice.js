import customerApi from 'api/customerApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Global from 'shared/utils/Global';
// import Global from 'general/utils/Global';

// MARK ---- thunks ---
export const thunkGetListCustomer = createAsyncThunk('customer/list', async (params, thunkApi) => {
  const res = await customerApi.getListCustomer(params);
  return res;
});

export const thunkGetCustomerDetail = createAsyncThunk(
  'customer/detail',
  async (params, thunkApi) => {
    const res = await customerApi.getCustomerDetail(params);
    return res;
  }
);

const customerSlice = createSlice({
  name: 'customer',
  initialState: {
    customers: [],
    isGettingCustomerList: false,
    pagination: { perPage: Global.gDefaultPagination },
    customerDetail: {},
    isGetttingCustomerDetail: false,
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
    clearCustomerDetail: (state, action) => {
      state.customerDetail = {};
    },
  },
  extraReducers: (builder) => {
    // get list customer
    builder.addCase(thunkGetListCustomer.pending, (state, action) => {
      state.isGettingCustomerList = true;
    });
    builder.addCase(thunkGetListCustomer.rejected, (state, action) => {
      state.isGettingCustomerList = false;
    });
    builder.addCase(thunkGetListCustomer.fulfilled, (state, action) => {
      state.isGettingCustomerList = false;
      const { result, customers, total, count, page } = action.payload;
      if (result == 'success') {
        state.customers = customers;
        state.pagination = {
          ...state.pagination,
          total: total,
          count: count,
          currentPage: page + 1,
        };
      }
    });

    // get customer detail
    builder.addCase(thunkGetCustomerDetail.pending, (state, action) => {
      state.isGetttingCustomerDetail = true;
    });
    builder.addCase(thunkGetCustomerDetail.rejected, (state, action) => {
      state.isGetttingCustomerDetail = false;
    });
    builder.addCase(thunkGetCustomerDetail.fulfilled, (state, action) => {
      state.isGetttingCustomerDetail = false;
      const { result, customer } = action.payload;
      if (result == 'success') {
        state.customerDetail = customer;
      }
    });
  },
});
const { reducer, actions } = customerSlice;
export const { setPaginationPerPage, clearCustomerDetail } = actions;
export default reducer;
