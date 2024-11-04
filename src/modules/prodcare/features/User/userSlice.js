import userApi from 'api/userApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Global from 'shared/utils/Global';
// import Global from 'general/utils/Global';

// MARK ---- thunks ---
export const thunkGetListUser = createAsyncThunk('user/list', async (params, thunkApi) => {
  const res = await userApi.getListUser(params);
  return res;
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    isGettingUserList: false,
    pagination: { perPage: Global.gDefaultPagination },
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
  },
});
const { reducer, actions } = userSlice;
export const { setPaginationPerPage } = actions;
export default reducer;
