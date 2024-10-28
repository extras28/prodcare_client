import dashboardApi from 'api/dashboardApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const thunkGetYearReport = createAsyncThunk('dashboard/year', async (params, thunkApi) => {
  const res = await dashboardApi.getReportByYear(params);
  return res;
});

export const thunkGetMonthReport = createAsyncThunk('dashboard/month', async (params, thunkApi) => {
  const res = await dashboardApi.getReportByMonth(params);
  return res;
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    year: {},
    isGetttingYearReport: false,

    quarter: {},
    isGettingQuarterReport: false,

    month: {},
    isGettingMonthReport: false,

    week: {},
    isGettingWeekReport: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(thunkGetYearReport.pending, (state, action) => {
      state.isGetttingYearReport = true;
    });
    builder.addCase(thunkGetYearReport.rejected, (state, action) => {
      state.isGetttingYearReport = false;
    });
    builder.addCase(thunkGetYearReport.fulfilled, (state, action) => {
      state.isGetttingYearReport = false;
      const { result, project, issueCounts, cummulative } = action.payload;
      if (result === 'success') {
        state.year = { project, issueCounts, cummulative };
      }
    });

    builder.addCase(thunkGetMonthReport.pending, (state, action) => {
      state.isGettingMonthReport = true;
    });
    builder.addCase(thunkGetMonthReport.rejected, (state, action) => {
      state.isGettingMonthReport = false;
    });
    builder.addCase(thunkGetMonthReport.fulfilled, (state, action) => {
      state.isGettingMonthReport = false;
      const {
        result,
        project,
        issueCount,
        remain,
        cummulative,
        totalHandledInMonth,
        warranty,
        averageTimeError,
      } = action.payload;
      if (result === 'success') {
        state.year = {
          project,
          issueCount,
          remain,
          cummulative,
          totalHandledInMonth,
          warranty,
          averageTimeError,
        };
      }
    });
  },
});

const { reducer, actions } = dashboardSlice;
export const {} = actions;
export default reducer;
