import axiosClient from './axiosClient';

const productApi = {
  createProduct: (params) => {
    const url = '/product/create';
    return axiosClient.post(url, params);
  },
  getListProduct: (params) => {
    const url = '/product/find';
    return axiosClient.get(url, { params });
  },
  updateProduct: (params) => {
    const url = '/product/update';

    return axiosClient.put(url, params);
  },
  deleteProduct: (params) => {
    const url = '/product/delete';
    return axiosClient.delete(url, {
      data: {
        productIds: params.productIds,
      },
    });
  },
  getProductDetail: (params) => {
    const url = `/product/detail/${params.productId}`;
    return axiosClient.get(url);
  },
  getListProductInTree: (params) => {
    const url = '/product/list';
    return axiosClient.get(url, { params });
  },
};

export default productApi;
