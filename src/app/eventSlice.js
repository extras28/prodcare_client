import eventApi from 'api/eventApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Global from 'shared/utils/Global';

// MARK ---- thunks ---
export const thunkGetListEvent = createAsyncThunk('event/list', async (params, thunkApi) => {
  const res = await eventApi.getListEvent(params);
  return res;
});

const eventSlice = createSlice({
  name: 'event',
  initialState: {
    events: [],
    isGettingEvent: false,
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
    // get list event
    builder.addCase(thunkGetListEvent.pending, (state, action) => {
      state.isGettingEvent = true;
    });
    builder.addCase(thunkGetListEvent.rejected, (state, action) => {
      state.isGettingEvent = false;
    });
    builder.addCase(thunkGetListEvent.fulfilled, (state, action) => {
      state.isGettingEvent = false;
      const { result, events, total, count, page } = action.payload;
      if (result == 'success') {
        state.events = events;
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
const { reducer, actions } = eventSlice;
export const { setPaginationPerPage } = actions;
export default reducer;
