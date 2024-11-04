import axiosClient from './axiosClient';

const projectApi = {
  createProject: (params) => {
    const url = '/project/create';
    return axiosClient.post(url, params);
  },
  getListProject: (params) => {
    const url = '/project/find';
    return axiosClient.get(url, { params });
  },
  updateProject: (params) => {
    const url = '/project/update';

    return axiosClient.put(url, params);
  },
  deleteProject: (params) => {
    const url = '/project/delete';
    return axiosClient.delete(url, {
      data: {
        projectIds: params.projectIds,
      },
    });
  },
};

export default projectApi;
