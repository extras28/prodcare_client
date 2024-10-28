import axiosClient from './axiosClient';

export const accountApi = {
  getAccountInformation: (params) => {
    const url = '/account/detail';
    return axiosClient.get(url, { params });
  },
};
