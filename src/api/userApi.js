import axiosClient from './axiosClient';

const userApi = {
  getListUser: (params) => {
    const url = '/user/find';
    return axiosClient.get(url, { params });
  },
  createUser: (params) => {
    const url = '/user/create';
    const formData = new FormData();
    for (const key in params) {
      formData.append(key, params[key]);
    }

    return axiosClient.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  updateUser: (params) => {
    const url = '/user/update';
    const formData = new FormData();
    for (const key in params) {
      formData.append(key, params[key]);
    }

    return axiosClient.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteUser: (params) => {
    const url = '/user/delete';
    return axiosClient.delete(url, {
      data: {
        employeeIds: params.employeeIds,
        avatars: params.avatars,
      },
    });
  },
};

export default userApi;
