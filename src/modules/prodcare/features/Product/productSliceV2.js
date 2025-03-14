import productApi from 'api/productApi';

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Global from 'shared/utils/Global';
import componentApi from 'api/componentApi';
// import Global from 'general/utils/Global';

// MARK ---- thunks ---
export const thunkGetListProduct = createAsyncThunk('productV2/list', async (params, thunkApi) => {
  const res = await productApi.getListProduct(params);
  return res;
});

export const thunkGetProductDetail = createAsyncThunk(
  'productV2/detail',
  async (params, thunkApi) => {
    const res = await productApi.getProductDetail(params);
    return res;
  }
);

export const thunkGetChildrenById = createAsyncThunk(
  'component/children',
  async (params, thunkApi) => {
    const res = await componentApi.getChildrenById(params);
    return res;
  }
);

const productSliceV2 = createSlice({
  name: 'productV2',
  initialState: {
    products: [],
    isGettingProductList: false,
    isGettingChildren: false,
    rowKey: null,
    pagination: { perPage: Global.gDefaultPagination },
    productDetail: {},
    isGettingProductDetail: false,
    events: [],
    issues: [],
  },
  reducers: {
    setPaginationPerPage: (state, action) => {
      return {
        ...state,
        pagination: {
          ...state.pagination,
          perPage: action.payload,
        },
      };
    },
    clearProductDetail: (state, action) => {
      state.productDetail = {};
    },
  },
  extraReducers: (builder) => {
    // get list product
    builder.addCase(thunkGetListProduct.pending, (state, action) => {
      state.isGettingProductList = true;
    });
    builder.addCase(thunkGetListProduct.rejected, (state, action) => {
      state.isGettingProductList = false;
    });
    builder.addCase(thunkGetListProduct.fulfilled, (state, action) => {
      state.isGettingProductList = false;
      const { result, products, total, count, page } = action.payload;
      if (result == 'success') {
        state.products = products.map((product, index) => {
          return {
            key: `p-${product.id}-key`,
            data: { ...product },
            children: product?.components?.map((component) => ({
              data: component,
              key: `c-${component.id}`,
              children: [{}],
            })),
          };
        });
        state.pagination = {
          ...state.pagination,
          total: total,
          count: count,
          currentPage: page + 1,
        };
      }
    });

    // get product detail
    builder.addCase(thunkGetProductDetail.pending, (state, action) => {
      state.isGettingProductDetail = true;
    });
    builder.addCase(thunkGetProductDetail.rejected, (state, action) => {
      state.isGettingProductDetail = false;
    });
    builder.addCase(thunkGetProductDetail.fulfilled, (state, action) => {
      state.isGettingProductDetail = false;
      const { result, product, issues, events } = action.payload;

      if (result == 'success') {
        state.productDetail = product;
        state.events = events;
        state.issues = issues;
      }
    });

    // get component's children
    builder.addCase(thunkGetChildrenById.pending, (state, action) => {
      const { key } = action.meta.arg;
      state.rowKey = key;
      state.isGettingChildren = true;
    });
    builder.addCase(thunkGetChildrenById.rejected, (state, action) => {
      state.isGettingChildren = false;
      state.rowKey = null;
    });
    builder.addCase(thunkGetChildrenById.fulfilled, (state, action) => {
      const { result, children } = action.payload;
      const { componentId, productId } = action.meta.arg;

      if (result === 'success') {
        // Tìm product cần tìm
        const product = state.products.find((p) => p.data.id === productId);
        if (!product) return; // Nếu không tìm thấy product, thoát sớm

        // Hàm DFS để tìm component theo ID và cập nhật children
        const updateChildrenDFS = (nodes) => {
          for (let node of nodes) {
            if (node.data?.id === componentId) {
              // Tìm thấy component cần cập nhật
              node.children = children.map((child) => ({
                data: child,
                key: `c-${child.id}`,
                children: [{}],
              }));

              return true; // Kết thúc tìm kiếm sớm nếu đã tìm thấy
            }
            if (node.children?.length) {
              if (updateChildrenDFS(node.children)) return true; // Đệ quy vào con
            }
          }
          return false;
        };

        // Gọi DFS trên cây con của product tìm được
        updateChildrenDFS(product.children);
      }

      state.isGettingChildren = false;
      state.rowKey = null;
    });
  },
});
const { reducer, actions } = productSliceV2;
export const { setPaginationPerPage, clearProductDetail } = actions;
export default reducer;
