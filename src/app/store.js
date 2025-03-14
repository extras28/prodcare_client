import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';
import authReducer from './authSlice';
import userReducer from '../modules/prodcare/features/User/userSlice';
import customerReducer from '../modules/prodcare/features/Customer/customerSlice';
import projectReducer from '../modules/prodcare/features/Project/projectSlice';
import productProducer from '../modules/prodcare/features/Product/productSlice';
import productProducerV2 from '../modules/prodcare/features/Product/productSliceV2';
import componentReducer from '../modules/prodcare/features/Component/componentSlice';
import issueRuducer from '../modules/prodcare/features/Issue/issueSlice';
import eventReducer from '../app/eventSlice';
import dashboardReducer from '../modules/prodcare/features/Dashboard/dashboardSlice';

const rootReducer = {
  app: appReducer,
  auth: authReducer,
  user: userReducer,
  customer: customerReducer,
  project: projectReducer,
  product: productProducer,
  productV2: productProducerV2,
  component: componentReducer,
  issue: issueRuducer,
  event: eventReducer,
  dashboard: dashboardReducer,
};

// app store

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.REACT_APP_DEV_TOOLS == 1 ? true : false,
});

export default store;
