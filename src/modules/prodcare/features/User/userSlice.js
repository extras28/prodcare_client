import userApi from 'api/userApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Global from 'shared/utils/Global';
// import Global from 'general/utils/Global';

// MARK ---- thunks ---
export const thunkGetListUser = createAsyncThunk('user/list', async (params, thunkApi) => {
  const res = await userApi.getListUser(params);
  return res;
});

export const thunkGetUserDetail = createAsyncThunk('user/detail', async (params, thunkApi) => {
  const res = await userApi.getUserDetail(params);
  return res;
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    isGettingUserList: false,
    pagination: { perPage: Global.gDefaultPagination },

    isGettingUserDetail: false,
    userDetail: {},
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
    clearUserDetail: (state, action) => {
      state.userDetail = {};
    },
  },
  extraReducers: (builder) => {
    // get list user
    builder.addCase(thunkGetListUser.pending, (state, action) => {
      state.isGettingUserList = true;
    });
    builder.addCase(thunkGetListUser.rejected, (state, action) => {
      state.isGettingUserList = false;
    });
    builder.addCase(thunkGetListUser.fulfilled, (state, action) => {
      state.isGettingUserList = false;
      const { result, users, total, count, page } = action.payload;
      if (result == 'success') {
        state.users = users;
        state.pagination = {
          ...state.pagination,
          total: total,
          count: count,
          currentPage: page + 1,
        };
      }
    });

    // get user detail
    builder.addCase(thunkGetUserDetail.pending, (state, action) => {
      state.isGettingUserDetail = true;
    });
    builder.addCase(thunkGetUserDetail.rejected, (state, action) => {
      state.isGettingUserDetail = false;
    });
    builder.addCase(thunkGetUserDetail.fulfilled, (state, action) => {
      state.isGettingUserDetail = false;
      const { result, user } = action.payload;
      if (result === 'success') {
        state.userDetail = user;
      }
    });
  },
});
const { reducer, actions } = userSlice;
export const { setPaginationPerPage, clearUserDetail } = actions;
export default reducer;
