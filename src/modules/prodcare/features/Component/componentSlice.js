import componentApi from 'api/componentApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Global from 'shared/utils/Global';
// import Global from 'general/utils/Global';

// MARK ---- thunks ---
export const thunkGetListComponent = createAsyncThunk(
  'component/list',
  async (params, thunkApi) => {
    const res = await componentApi.getListComponent(params);
    return res;
  }
);

export const thunkGetComponentDetail = createAsyncThunk(
  'component/detail',
  async (params, thunkApi) => {
    const res = await componentApi.getComponentDetail(params);
    return res;
  }
);

const componentSlice = createSlice({
  name: 'component',
  initialState: {
    components: [],
    isGettingComponentList: false,
    pagination: { perPage: Global.gDefaultPagination },
    componentDetail: {},
    isGettingDetail: false,
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
    clearComponentDetail: (state, action) => {
      state.componentDetail = {};
    },
  },
  extraReducers: (builder) => {
    // get list component
    builder.addCase(thunkGetListComponent.pending, (state, action) => {
      state.isGettingComponentList = true;
    });
    builder.addCase(thunkGetListComponent.rejected, (state, action) => {
      state.isGettingComponentList = false;
    });
    builder.addCase(thunkGetListComponent.fulfilled, (state, action) => {
      state.isGettingComponentList = false;
      const { result, components, total, count, page } = action.payload;
      if (result == 'success') {
        state.components = components;
        state.pagination = {
          ...state.pagination,
          total: total,
          count: count,
          currentPage: page + 1,
        };
      }
    });

    // get component detail
    builder.addCase(thunkGetComponentDetail.pending, (state, action) => {
      state.isGettingDetail = true;
    });
    builder.addCase(thunkGetComponentDetail.rejected, (state, action) => {
      state.isGettingDetail = false;
    });
    builder.addCase(thunkGetComponentDetail.fulfilled, (state, action) => {
      state.isGettingDetail = false;
      const { result, component, events, issues } = action.payload;
      if (result == 'success') {
        state.componentDetail = component;
        state.events = events;
        state.issues = issues;
      }
    });
  },
});
const { reducer, actions } = componentSlice;
export const { setPaginationPerPage, clearComponentDetail } = actions;
export default reducer;
