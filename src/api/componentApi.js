import axiosClient from './axiosClient';

const componentApi = {
  createComponent: (params) => {
    const url = '/component/create';
    return axiosClient.post(url, params);
  },
  getListComponent: (params) => {
    const url = '/component/find';
    return axiosClient.get(url, { params });
  },
  updateComponent: (params) => {
    const url = '/component/update';

    return axiosClient.put(url, params);
  },
  deleteComponent: (params) => {
    const url = '/component/delete';
    return axiosClient.delete(url, {
      data: {
        componentIds: params.componentIds,
      },
    });
  },
  getComponentDetail: (params) => {
    const url = `/component/detail/${params.componentId}`;
    return axiosClient.get(url);
  },
};
export default componentApi;
