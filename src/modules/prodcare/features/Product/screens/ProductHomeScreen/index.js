import { unwrapResult } from '@reduxjs/toolkit';
import productApi from 'api/productApi';
import customDataTableStyle from 'assets/styles/customDataTableStyle';
import useRouter from 'hooks/useRouter';
import { thunkGetListComponent } from 'modules/prodcare/features/Component/componentSlice';
import { thunkGetListIssue } from 'modules/prodcare/features/Issue/issueSlice';
import { useEffect, useMemo, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Empty from 'shared/components/Empty';
import Loading from 'shared/components/Loading';
import KTTooltip from 'shared/components/OtherKeenComponents/KTTooltip';
import KeenSearchBarNoFormik from 'shared/components/OtherKeenComponents/KeenSearchBarNoFormik';
import Pagination from 'shared/components/Pagination';
import AppResource from 'shared/constants/AppResource';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import LanguageHelper from 'shared/helpers/LanguageHelper';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import Utils from 'shared/utils/Utils';
import Swal from 'sweetalert2';
import ModalEditProduct from '../../components/ModalEditProduct';
import ModalProductActivity from '../../components/ModalProductActivity';
import { setPaginationPerPage, thunkGetListProduct } from '../../productSlice';
import { thunkGetAllProduct } from 'app/appSlice';

ProductHomePage.propTypes = {};

const sTag = '[ProductHomePage]';

function ProductHomePage(props) {
  // MARK: --- Params ---
  const { customerId } = props;
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    ...Global.gFiltersProductList,
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
    customerId: customerId,
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [toggledClearProducts, setToggledClearProducts] = useState(true);
  const { products, isGettingProductList, pagination } = useSelector((state) => state.product);
  const { current } = useSelector((state) => state.auth);
  const needToRefreshData = useRef(products?.length === 0);
  const refLoading = useRef(false);
  const { customers } = useSelector((state) => state?.app);
  const { currentProject, projects } = useSelector((state) => state?.app);
  const columns = useMemo(() => {
    const tableColumns = [
      {
        name: t('Serial'),
        sortable: false,
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="font-weight-bolder font-weight-normal m-0 text-maxline-3 mr-4"
            >
              {row?.serial}
            </p>
          );
        },
      },
      {
        name: t('EquipmentName'),
        sortable: false,
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="font-weight-bolder font-weight-normal m-0 text-maxline-3 mr-4"
            >
              {row?.name}
            </p>
          );
        },
      },
      {
        name: t('Product'),
        sortable: false,
        cell: (row) => {
          return (
            <p data-tag="allowRowEvents" className="font-weight-normal m-0 text-maxline-3 mr-4">
              {projects.find((item) => item.id === row['project_id'])?.['project_name']}
            </p>
          );
        },
      },
      {
        name: t('Customer'),
        sortable: false,
        cell: (row) => {
          const ct = customers.find((item) => item.id === row['customer_id']);
          return (
            <p data-tag="allowRowEvents" className="font-weight-normal m-0 text-maxline-3 mr-4">
              {ct ? `${ct?.['military_region']} - ${ct?.['name']}` : ''}
            </p>
          );
        },
      },
      {
        name: t('Mfg'),
        sortable: false,
        cell: (row) => {
          return (
            <p data-tag="allowRowEvents" className="font-weight-normal m-0 text-maxline-3 mr-4">
              {row?.mfg ? Utils.formatDateTime(row?.mfg, 'YYYY-MM-DD') : ''}
            </p>
          );
        },
      },
      {
        name: t('HandedOverTime'),
        sortable: false,
        cell: (row) => {
          return (
            <p data-tag="allowRowEvents" className="font-weight-normal m-0 text-maxline-3 mr-4">
              {row?.handed_over_time
                ? Utils.formatDateTime(row?.handed_over_time, 'YYYY-MM-DD')
                : ''}
            </p>
          );
        },
      },
      {
        name: t('Action'),
        center: 'true',
        width: '120px',
        cell: (row) => (
          <div className="d-flex align-items-center">
            <KTTooltip text={t('Edit')}>
              <a
                className="btn btn-icon btn-sm btn-primary btn-hover-primary"
                onClick={(e) => {
                  e.preventDefault();
                  handleEditProduct(row);
                }}
              >
                <i className="fa-regular fa-pen p-0 icon-1x" />
              </a>
            </KTTooltip>

            <KTTooltip text={t('Delete')}>
              <a
                className="btn btn-icon btn-sm btn-danger btn-hover-danger ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteProduct(row);
                }}
              >
                <i className="far fa-trash p-0 icon-1x" />
              </a>
            </KTTooltip>
          </div>
        ),
      },
    ];

    if (current?.role === 'GUEST') return tableColumns.slice(0, tableColumns.length - 1);
    return tableColumns;
  }, [current, LanguageHelper.getCurrentLanguage(), projects, customers]);
  const [selectedProductItem, setSelectedProductItem] = useState(null);
  const [modalProductEditShowing, setModalEditProductShowing] = useState(false);
  const [modalProductActivityShowing, setModalActivityProductShowing] = useState(false);
  const { customerDetail } = useSelector((state) => state?.customer);

  // MARK: --- Functions ---
  // Get Product list
  async function getProductList() {
    refLoading.current = true;
    try {
      const res = unwrapResult(await dispatch(thunkGetListProduct(filters)));
    } catch (error) {
      console.log(`${sTag} get Product list error: ${error.message}`);
    }
    refLoading.current = false;
  }

  function handleSelectedProductsChanged(state) {
    const selectedProducts = state.selectedRows;
    setSelectedProducts(selectedProducts);
  }

  function clearSelectedProducts() {
    setSelectedProducts([]);
    setToggledClearProducts(!toggledClearProducts);
  }

  function handleEditProduct(product) {
    setSelectedProductItem(product);
    setModalEditProductShowing(true);
  }

  function handleShowProductActivity(product) {
    setSelectedProductItem(product);
    setModalActivityProductShowing(true);
  }

  function handleDeleteMultiProducts() {
    const arrIdsToDelete = selectedProducts.map((item) => item['id']);
    console.log(`${sTag} handle delete multi products: ${arrIdsToDelete}`);

    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteMultiProduct', {
        products: JSON.stringify(arrIdsToDelete.length),
      }),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t('Yes'),
      cancelButtonText: t('Cancel'),
      customClass: {
        confirmButton: 'btn btn-danger font-weight-bolder',
        cancelButton: 'btn btn-light font-weight-bolder',
      },
    }).then(async function (result) {
      if (result.value) {
        const productIds = arrIdsToDelete;
        try {
          const res = await productApi.deleteProduct({
            productIds: productIds,
          });
          const { result } = res;
          if (result === 'success') {
            clearSelectedProducts();
            Global.gNeedToRefreshProductList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersProductList = { ...filters };
            setFilters({ ...filters });
            dispatch(thunkGetListComponent(Global.gFiltersComponentList));
            dispatch(thunkGetListIssue(Global.gFiltersIssueList));
            dispatch(thunkGetAllProduct({ projectId: currentProject?.id }));
          }
        } catch (error) {
          console.log(`${sTag} delete faq error: ${error.message}`);
        }
      }
    });
  }

  function handleSelectedProductsChanged(state) {
    const selectedProducts = state.selectedRows;
    setSelectedProducts(selectedProducts);
  }

  function handleDeleteProduct(product) {
    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteEquipment', { name: product?.name }),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t('Yes'),
      cancelButtonText: t('Cancel'),
      customClass: {
        confirmButton: 'btn btn-danger font-weight-bolder',
        cancelButton: 'btn btn-light font-weight-bolder',
      },
    }).then(async function (result) {
      if (result.value) {
        try {
          const res = await productApi.deleteProduct({
            productIds: [product['id']],
          });
          const { result } = res;
          if (result == 'success') {
            Global.gNeedToRefreshProductList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersProductList = { ...filters };
            setFilters({ ...filters });
            dispatch(thunkGetListComponent(Global.gFiltersComponentList));
            dispatch(thunkGetListIssue(Global.gFiltersIssueList));
            dispatch(thunkGetAllProduct());
          }
        } catch (error) {
          console.log(`Delete Product error: ${error?.message}`);
        }
      }
    });
  }

  // async function getListCustomer(params) {
  //   try {
  //     const res = await customerApi.getListCustomer();
  //     if ((res.result = 'success')) {
  //       setCustomers(res.customers);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  function showProductIssue(row) {
    // Global.gFiltersIssueList = { ...Global.gFiltersProductList, productId: row?.id };
    // dispatch(thunkGetProductDetail({ productId: row?.id }));
    router.navigate(`/prodcare/operating/product/detail/${row?.id}`);
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    const shouldRefreshData =
      !refLoading.current && (needToRefreshData.current || Global.gNeedToRefreshProductList);

    if (shouldRefreshData) {
      if (!router.pathname.includes('detail') || customerDetail?.id) {
        getProductList();
        Global.gNeedToRefreshProductList = false;
      }
    }
  }, [filters]);

  useEffect(() => {
    const currentProjectId = JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id;

    if (!currentProjectId) return; // Ensure project ID exists

    const baseFilters = {
      ...filters,
      projectId: currentProjectId,
    };

    if (router.pathname.includes('detail') && customerDetail?.id) {
      const detailFilters = {
        ...baseFilters,
        customerId: customerDetail?.id,
      };

      setFilters(detailFilters);
      Global.gFiltersProductList = detailFilters;
    } else {
      setFilters(baseFilters);
      Global.gFiltersProductList = baseFilters;
    }

    Global.gNeedToRefreshProductList = true;
  }, [currentProject, customerDetail]);

  return (
    <div>
      <div className="card-title ">
        <h1 className="card-label">{`${t('EquipmentList')} ${
          pagination?.total ? `(${pagination?.total})` : ''
        }`}</h1>
      </div>

      <div className="card card-custom border">
        {/* card header */}
        <div className="card-header border-0 pt-6 pb-6">
          {/* header toolbar */}
          <div className="d-flex flex-wrap gap-2">
            <KeenSearchBarNoFormik
              name="searchQuery"
              className="mt-2"
              placeholder={`${t('Search')}...`}
              value={Global.gFiltersProductList.q}
              onSubmit={(text) => {
                needToRefreshData.current = true;
                Global.gFiltersProductList = {
                  ...filters,
                  q: text,
                  page: 0,
                };
                setFilters({
                  ...filters,
                  q: text,
                  page: 0,
                });
              }}
            />
          </div>
          {current?.role !== 'GUEST' ? (
            <div className="card-toolbar gap-2">
              <a
                href="#"
                className={`${
                  selectedProducts.length === 0 ? 'd-none' : 'd-flex'
                } btn btn-light-danger font-weight-bold align-items-center mr-2`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteMultiProducts();
                }}
              >
                <i className="far fa-ban"></i>
                {`${t('Delete')} (${selectedProducts.length})`}
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalEditProductShowing(true);
                }}
                className="btn btn-primary font-weight-bold d-flex align-items-center"
              >
                <i className="far fa-plus"></i>
                {t('NewEquipment')}
              </a>
            </div>
          ) : null}
        </div>

        {/* card body */}
        <div className="card-body pt-0">
          <DataTable
            // fixedHeader
            // fixedHeaderScrollHeight="60vh"
            columns={columns}
            data={products}
            customStyles={customDataTableStyle}
            responsive={true}
            noHeader
            // selectableRows={current?.role != 'ADMIN' ? false : true}
            // striped
            noDataComponent={
              <div className="pt-12">
                <Empty
                  text={t('NoData')}
                  visible={false}
                  imageEmpty={AppResource.icons.icEmptyState}
                  imageEmptyPercentWidth={90}
                />
              </div>
            }
            progressPending={isGettingProductList}
            progressComponent={<Loading showBackground={false} message={`${t('Loading')}...`} />}
            onSelectedRowsChange={handleSelectedProductsChanged}
            clearSelectedRows={toggledClearProducts}
            onRowClicked={(row) => {
              // handleShowProductActivity(row);
              showProductIssue(row);
            }}
            pointerOnHover
            highlightOnHover
            selectableRowsHighlight
          />

          {/* Pagination */}
          {pagination && products?.length > 0 && (
            <div className="d-flex align-items-center justify-content-center mt-3">
              <Pagination
                rowsPerPage={pagination?.perPage}
                rowCount={pagination?.total}
                currentPage={pagination?.currentPage}
                onChangePage={(newPage) => {
                  let iNewPage = parseInt(newPage);
                  iNewPage -= 1;
                  if (iNewPage < 0) {
                    iNewPage = 0;
                  }
                  needToRefreshData.current = true;
                  Global.gFiltersProductList = { ...filters, page: iNewPage };
                  setFilters({
                    ...filters,
                    page: iNewPage,
                  });
                }}
                onChangeRowsPerPage={(newPerPage) => {
                  const iNewPerPage = parseInt(newPerPage);
                  dispatch(setPaginationPerPage(iNewPerPage));
                  needToRefreshData.current = true;
                  Global.gFiltersProductList = {
                    ...filters,
                    limit: iNewPerPage,
                  };
                  setFilters({
                    ...filters,
                    limit: iNewPerPage,
                    page: 0,
                  });
                }}
              />
            </div>
          )}
        </div>
      </div>

      <ModalEditProduct
        show={modalProductEditShowing}
        customers={customers}
        onClose={() => {
          setModalEditProductShowing(false);
        }}
        onExistDone={() => {
          setSelectedProductItem(null);
        }}
        productItem={selectedProductItem}
        onRefreshProductList={() => {
          setSelectedProductItem(null);
          getProductList();
        }}
      />

      <ModalProductActivity
        show={modalProductActivityShowing}
        onClose={() => {
          setModalActivityProductShowing(false);
        }}
        onExistDone={() => {
          setSelectedProductItem(null);
        }}
        productItem={selectedProductItem}
        onRefreshProductList={() => {
          setSelectedProductItem(null);
          getProductList();
        }}
      />
    </div>
  );
}

export default ProductHomePage;
