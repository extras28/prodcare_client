import axiosClient from './axiosClient';

const issueApi = {
  createIssue: (params) => {
    const url = '/issue/create';
    return axiosClient.post(url, params);
  },
  getListIssue: (params) => {
    const url = '/issue/find';
    return axiosClient.get(url, { params });
  },
  updateIssue: (params) => {
    const url = '/issue/update';
    return axiosClient.put(url, params);
  },
  deleteIssue: (params) => {
    const url = '/issue/delete';
    return axiosClient.delete(url, {
      data: {
        issueIds: params.issueIds,
      },
    });
  },
  uploadFile: (params) => {
    const url = '/issue/upload';
    const formData = new FormData();

    for (const key in params) {
      formData.append(key, params[key]);
    }
    return axiosClient.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getIssueDetail: (params) => {
    const url = `/issue/detail/${params.issueId}`;
    return axiosClient.get(url);
  },
};

export default issueApi;
