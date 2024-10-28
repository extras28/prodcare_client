import issueApi from 'api/issueApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Global from 'shared/utils/Global';
// import Global from 'general/utils/Global';

// MARK ---- thunks ---
export const thunkGetListIssue = createAsyncThunk('issue/list', async (params, thunkApi) => {
  const res = await issueApi.getListIssue(params);
  return res;
});

export const thunkGetIssueDetail = createAsyncThunk('issue/detail', async (params, thunkApi) => {
  const res = await issueApi.getIssueDetail(params);
  return res;
});

const issueSlice = createSlice({
  name: 'issue',
  initialState: {
    issues: [],
    isGettingIssueList: false,
    pagination: { perPage: Global.gDefaultPagination },
    issueDetail: {},
    isGettingIssueDetail: false,
    events: [],
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
    clearIssues: (state, action) => {
      state.issues = [];
    },
  },
  extraReducers: (builder) => {
    // get list issue
    builder.addCase(thunkGetListIssue.pending, (state, action) => {
      state.isGettingIssueList = true;
    });
    builder.addCase(thunkGetListIssue.rejected, (state, action) => {
      state.isGettingIssueList = false;
    });
    builder.addCase(thunkGetListIssue.fulfilled, (state, action) => {
      state.isGettingIssueList = false;
      const { result, issues, total, count, page } = action.payload;
      if (result == 'success') {
        state.issues = issues;
        state.pagination = {
          ...state.pagination,
          total: total,
          count: count,
          currentPage: page + 1,
        };
      }
    });

    // get issue detail
    builder.addCase(thunkGetIssueDetail.pending, (state, action) => {
      state.isGettingIssueDetail = true;
    });
    builder.addCase(thunkGetIssueDetail.rejected, (state, action) => {
      state.isGettingIssueDetail = false;
    });
    builder.addCase(thunkGetIssueDetail.fulfilled, (state, action) => {
      state.isGettingIssueDetail = false;
      const { result, issue, events } = action.payload;
      if (result == 'success') {
        state.issueDetail = issue;
        state.events = events;
      }
    });
  },
});
const { reducer, actions } = issueSlice;
export const { setPaginationPerPage, clearIssues } = actions;
export default reducer;
