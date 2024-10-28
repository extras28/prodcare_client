const { default: axiosClient } = require('./axiosClient');

const dashboardApi = {
  getReportByYear: (params) => {
    const url = '/dashboard/year';
    return axiosClient.get(url, { params });
  },
  getReportByMonth: (params) => {
    const url = '/dashboard/month';
    return axiosClient.get(url, { params });
  },
};

export default dashboardApi;
