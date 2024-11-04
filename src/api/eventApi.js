import axiosClient from './axiosClient';

const eventApi = {
  createEvent: (params) => {
    const url = '/event/create';
    return axiosClient.post(url, params);
  },
  getListEvent: (params) => {
    const url = '/event/find';
    return axiosClient.get(url, { params });
  },
  updateEvent: (params) => {
    const url = '/event/update';
    return axiosClient.put(url, params);
  },
  deleteEvent: (params) => {
    const url = '/event/delete';
    return axiosClient.delete(url, {
      data: {
        eventIds: params.eventIds,
      },
    });
  },
};

export default eventApi;
