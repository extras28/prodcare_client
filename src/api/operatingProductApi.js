import axiosClient from './axiosClient';

const operatingProductApi = {
  createOperatingProduct: (params) => {
    const url = '/product/create';
    return axiosClient.post(url, params);
  },
  getListOperatingProduct: (params) => {
    const url = '/product/find';
    return axiosClient.get(url, { params });
  },
  updateOperatingProduct: (params) => {
    const url = '/product/update';

    return axiosClient.put(url, params);
  },
  deleteOperatingProduct: (params) => {
    const url = '/product/delete';
    return axiosClient.delete(url, {
      data: {
        productIds: params.productIds,
      },
    });
  },
};

export default operatingProductApi;
