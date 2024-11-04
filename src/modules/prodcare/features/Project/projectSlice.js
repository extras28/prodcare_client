import projectApi from 'api/projectApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Global from 'shared/utils/Global';
// import Global from 'general/utils/Global';

// MARK ---- thunks ---
export const thunkGetListProject = createAsyncThunk('project/list', async (params, thunkApi) => {
  const res = await projectApi.getListProject(params);
  return res;
});

const projectSlice = createSlice({
  name: 'project',
  initialState: {
    projects: [],
    isGettingProjectList: false,
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
    // get list project
    builder.addCase(thunkGetListProject.pending, (state, action) => {
      state.isGettingProjectList = true;
    });
    builder.addCase(thunkGetListProject.rejected, (state, action) => {
      state.isGettingProjectList = false;
    });
    builder.addCase(thunkGetListProject.fulfilled, (state, action) => {
      state.isGettingProjectList = false;
      const { result, projects, total, count, page } = action.payload;
      if (result == 'success') {
        state.projects = projects;
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
const { reducer, actions } = projectSlice;
export const { setPaginationPerPage } = actions;
export default reducer;
