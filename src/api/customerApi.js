import axiosClient from './axiosClient';

const customerApi = {
  createCustomer: (params) => {
    const url = '/customer/create';
    return axiosClient.post(url, params);
  },
  getListCustomer: (params) => {
    const url = '/customer/find';
    return axiosClient.get(url, { params });
  },
  updateCustomer: (params) => {
    const url = '/customer/update';

    return axiosClient.put(url, params);
  },
  deleteCustomer: (params) => {
    const url = '/customer/delete';
    return axiosClient.delete(url, {
      data: {
        customerIds: params.customerIds,
      },
    });
  },
  getCustomerDetail: (params) => {
    const url = `/customer/detail/${params.customerId}`;
    return axiosClient.get(url);
  },
};

export default customerApi;
