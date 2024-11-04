import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { accountApi } from 'api/accountApi';
import authApi from 'api/authApi';
import { updateAxiosAccessToken } from 'api/axiosClient';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import AccountHelper from 'shared/helpers/AccountHelper';
import ToastHelper from 'shared/helpers/ToastHelper';

// MARK: --- Thunks ---

export const thunkSignIn = createAsyncThunk('auth/sign-in', async (params, thunkApi) => {
  const res = await authApi.signIn(params);
  return res;
});

export const thunkSignOut = createAsyncThunk('auth/sign-out', async () => {
  const res = await authApi.signOut();
  return res;
});

export const thunkGetAccountInfor = createAsyncThunk('account/get-account-infor', async () => {
  const res = await accountApi.getAccountInformation();
  return res;
});

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isSigningIn: false,
    current: {},
    isGettingAccountInfor: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    // MARK: ---- THUNK SIGN IN ----
    builder.addCase(thunkSignIn.pending, (state, action) => {
      state.isSigningIn = true;
    });
    builder.addCase(thunkSignIn.rejected, (state, action) => {
      state.isSigningIn = false;
    });
    builder.addCase(thunkSignIn.fulfilled, (state, action) => {
      const { result, account, accessToken, accessTokenExpireDate } = action?.payload;
      state.isSigningIn = false;
      if (result === 'success') {
        localStorage.setItem(PreferenceKeys.accessToken, accessToken);
        localStorage.setItem(PreferenceKeys.accessTokenExpired, accessTokenExpireDate);
        updateAxiosAccessToken(accessToken);
        state.current = account;
      }
    });

    // MARK: ---- THUNK SIGN OUT ---
    builder.addCase(
      thunkSignOut.fulfilled, // Sign out
      (state, action) => {
        const { result } = action.payload;
        if (result === 'success') {
          state.current = {};
          // localStorage.setItem(PreferenceKeys.permission, '');
        }
        AccountHelper.signOut();
        window.location.href = '/sign-in';
      }
    );

    // MARK: ---- THUNK GET ACCOUNT INFORMATION ----
    builder.addCase(thunkGetAccountInfor.pending, (state, action) => {
      state.isSigningIn = true;
    });
    builder.addCase(thunkGetAccountInfor.rejected, (state, action) => {
      state.isSigningIn = false;
    });
    builder.addCase(thunkGetAccountInfor.fulfilled, (state, action) => {
      state.isSigningIn = false;
      if (action.payload?.result === 'success') {
        state.current = action.payload?.account;
      }
    });
  },
});

const { reducer, actions } = authSlice;
export const {} = actions;
export default reducer;
