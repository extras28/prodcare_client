import axiosClient from './axiosClient';

const authApi = {
  signIn: (params) => {
    const url = '/auth/sign-in';
    return axiosClient.post(url, params);
  },
  signOut: () => {
    const url = '/auth/sign-out';
    return axiosClient.post(url);
  },
  //   getAccountInfor: () => {
  //     const url = '/account/detail';
  //     return axiosClient.get(url);
  //   },
  changePassword: (params) => {
    const url = '/auth/change-password';
    return axiosClient.post(url, params);
  },
  //   forgotPassword: (params) => {
  //     const url = '/auth/forgot-password';
  //     return axiosClient.post(url, params);
  //   },
};

export default authApi;
