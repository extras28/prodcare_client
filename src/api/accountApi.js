import axiosClient from './axiosClient';

export const accountApi = {
  getAccountInformation: (params) => {
    const url = '/account/detail';
    return axiosClient.get(url, { params });
  },
  adjustIssueColumns: (params) => {
    const url = '/account/issue-column';
    return axiosClient.post(url, params);
  },
  getIssueColumns: (params) => {
    const url = '/account/get-issue-column';
    return axiosClient.get(url, { params });
  },
};
