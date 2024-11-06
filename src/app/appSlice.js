import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import componentApi from 'api/componentApi';
import customerApi from 'api/customerApi';
import issueApi from 'api/issueApi';
import productApi from 'api/productApi';
import projectApi from 'api/projectApi';
import PreferenceKeys from 'shared/constants/PreferenceKeys';

// MARK: --- Thunks ---
export const thunkGetAllProject = createAsyncThunk('app/project', async (params, thunkApi) => {
  const res = await projectApi.getListProject(params);
  return res;
});

export const thunkGetAllCustomer = createAsyncThunk('app/customer', async (params, thunkApi) => {
  const res = await customerApi.getListCustomer(params);
  return res;
});

export const thunkGetAllProduct = createAsyncThunk('app/product', async (params, thunkApi) => {
  const res = await productApi.getListProduct(params);
  return res;
});

export const thunkGetAllComponent = createAsyncThunk('app/component', async (params, thunkApi) => {
  const res = await componentApi.getListComponent(params);
  return res;
});

export const thunkGetAllReason = createAsyncThunk('app/reason', async (params, thunkApi) => {
  const res = await issueApi.getListReason(params);
  return res;
});

export const appSlice = createSlice({
  name: 'app',
  initialState: {
    environment: process.env.REACT_APP_ENVIRONMENT || 'DEV',
    projects: [],
    currentProject: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject)),
    customers: [],
    products: [],
    components: [],
    reasons: [],
  },
  reducers: {
    setEnvironment: (state, action) => {
      state.environment = action.payload;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(thunkGetAllProject.fulfilled, (state, action) => {
      const { result, projects } = action.payload;
      if (result == 'success') {
        state.projects = projects;
        const currentProject = localStorage.getItem(PreferenceKeys.currentProject);
        const parsedCurrentProject = currentProject ? JSON.parse(currentProject) : null;

        if (projects?.length > 0) {
          const projectExists = projects.some((item) => item?.id === parsedCurrentProject?.id);

          if (!parsedCurrentProject || !projectExists) {
            const newProject = projects[0];
            localStorage.setItem(PreferenceKeys.currentProject, JSON.stringify(newProject));
            state.currentProject = newProject;
          }
        } else {
          localStorage.removeItem(PreferenceKeys.currentProject);
        }
      }
    });

    builder.addCase(thunkGetAllCustomer.fulfilled, (state, action) => {
      const { result, customers } = action.payload;
      if (result === 'success') {
        state.customers = customers;
      }
    });

    builder.addCase(thunkGetAllProduct.fulfilled, (state, action) => {
      const { result, products } = action.payload;
      if (result === 'success') {
        state.products = products;
      }
    });

    builder.addCase(thunkGetAllComponent.fulfilled, (state, action) => {
      const { result, components } = action.payload;
      if (result === 'success') {
        state.components = components;
      }
    });

    builder.addCase(thunkGetAllReason.fulfilled, (state, action) => {
      const { result, reasons } = action.payload;
      if (result === 'success') {
        state.reasons = reasons;
      }
    });
  },
});

const { reducer, actions } = appSlice;
export const { setEnvironment, setCurrentProject } = actions;
export default reducer;
