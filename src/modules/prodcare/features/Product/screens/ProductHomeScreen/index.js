import { unwrapResult } from '@reduxjs/toolkit';
import productApi from 'api/productApi';
import { thunkGetAllProduct } from 'app/appSlice';
import useRouter from 'hooks/useRouter';
import { thunkGetListComponent } from 'modules/prodcare/features/Component/componentSlice';
import { thunkGetListIssue } from 'modules/prodcare/features/Issue/issueSlice';
import { Column } from 'primereact/column';
import { TreeTable } from 'primereact/treetable';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Empty from 'shared/components/Empty';
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

import ModalEditComponent from 'modules/prodcare/features/Component/components/ModalEditComponent';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import DateRangePickerInput from 'shared/components/AppDateRangePicker';
import KTFormSelect from 'shared/components/OtherKeenComponents/Forms/KTFormSelect';
import AppData from 'shared/constants/AppData';
import ExcelJS from 'exceljs';

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
  const [selectedProductItem, setSelectedProductItem] = useState(null);
  const [modalProductEditShowing, setModalEditProductShowing] = useState(false);
  const [modalProductActivityShowing, setModalActivityProductShowing] = useState(false);
  const { customerDetail } = useSelector((state) => state?.customer);
  const [modalComponentEditShowing, setModalEditComponentShowing] = useState(false);
  const [selectedComponentItem, setSelectedComponentItem] = useState(null);

  const table = useMemo(
    () => (
      <TreeTable
        showGridlines={true}
        rowHover={true}
        loading={isGettingProductList}
        emptyMessage={
          <div className="pt-12">
            <Empty
              text={t('NoData')}
              visible={false}
              imageEmpty={AppResource.icons.icEmptyState}
              imageEmptyPercentWidth={10}
            />
          </div>
        }
        onRowClick={(row) => {
          showProductIssue(row);
        }}
        value={products}
      >
        <Column
          style={{ width: '200px' }}
          body={(row) => {
            return (
              <span data-tag="allowRowEvents" className="font-weight-bolder font-weight-normal">
                {row?.data?.name}
              </span>
            );
          }}
          field="name"
          header={t('ProductName')}
          expander
        ></Column>
        <Column
          style={{ width: '200px' }}
          body={(row) => {
            return (
              <span data-tag="allowRowEvents" className="font-weight-bolder font-weight-normal">
                {row?.data?.serial}
              </span>
            );
          }}
          field="serial"
          header={t('Serial')}
        ></Column>
        <Column
          style={{ width: '200px' }}
          body={(row) => {
            const ct = customers.find((item) => item.id === row?.data?.['customer_id']);
            return (
              <span data-tag="allowRowEvents" className="font-weight-normal  text-maxline-3">
                {ct ? `${ct?.['military_region']} - ${ct?.['name']}` : ''}
              </span>
            );
          }}
          header={t('Customer')}
        ></Column>
        <Column
          style={{ width: '90px' }}
          body={(row) => {
            return (
              <span data-tag="allowRowEvents" className="font-weight-normal">
                {row?.data?.version}
              </span>
            );
          }}
          field="version"
          header={t('SoftwareVersion')}
        ></Column>
        <Column
          style={{ width: '120px' }}
          body={(row) => {
            return (
              <span
                data-tag="allowRowEvents"
                className={`badge badge-${
                  row?.data?.status === 'USING'
                    ? 'primary'
                    : row?.data?.status === 'REPAIRING'
                    ? 'danger'
                    : 'warning'
                }`}
              >
                {row?.data?.status
                  ? t(
                      AppData.productCurrentStatus.find((item) => item?.value === row?.data?.status)
                        ?.name
                    )
                  : ''}
              </span>
            );
          }}
          field="currentStatus"
          header={t('CurrentStatus')}
        ></Column>
        <Column
          style={{ width: '100px' }}
          body={(row) => {
            const issues = row?.data?.issues;

            const breakdown =
              issues?.length > 0 && issues?.every((item) => item?.status !== 'PROCESSED')
                ? true
                : false;
            return (
              <span
                data-tag="allowRowEvents"
                className={`badge badge-${breakdown ? 'danger' : 'success'}`}
              >
                {breakdown ? t('HaveErrors') : t('Active')}
              </span>
            );
          }}
          field="status"
          header={t('Status')}
        ></Column>
        {/* <Column
          body={(row) => {
            return (
              <p data-tag="allowRowEvents" className="font-weight-normal ">
                {row?.data?.mfg ? Utils.formatDateTime(row?.data?.mfg, 'YYYY-MM-DD') : ''}
              </p>
            );
          }}
          header={t('Mfg')}
        ></Column> */}
        <Column
          style={{ width: '100px' }}
          body={(row) => {
            return (
              <span data-tag="allowRowEvents" className="font-weight-normal ">
                {row?.data?.handed_over_time
                  ? Utils.formatDateTime(row?.data?.handed_over_time, 'YYYY-MM-DD')
                  : ''}
              </span>
            );
          }}
          header={t('HandedOverTime')}
        ></Column>
        <Column
          style={{ width: '120px' }}
          body={(row) => {
            return (
              <div className="d-flex align-items-center">
                <KTTooltip text={t('Edit')}>
                  <a
                    className="btn btn-icon btn-sm btn-primary btn-hover-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditProduct(row?.data);
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
                      handleDeleteProduct(row?.data);
                    }}
                  >
                    <i className="fa-regular fa-trash p-0 icon-1x" />
                  </a>
                </KTTooltip>
              </div>
            );
          }}
          header={t('Action')}
        ></Column>
      </TreeTable>
    ),
    [current, LanguageHelper.getCurrentLanguage(), projects, customers, products]
  );

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

  function clearSelectedProducts() {
    setSelectedProducts([]);
    setToggledClearProducts(!toggledClearProducts);
  }

  function handleEditProduct(product) {
    const isComponent = product?.hasOwnProperty('product_id');

    if (isComponent) {
      setSelectedComponentItem(product);
      setModalEditComponentShowing(true);
    } else {
      setSelectedProductItem(product);
      setModalEditProductShowing(true);
    }
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
      text: t('MessageConfirmDeleteProduct', { name: product?.name }),
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

  function showProductIssue(row) {
    const isAction = /btn|fa-regular/.test(row?.originalEvent?.target?.className || '');

    if (isAction) return;

    if (row?.node?.data?.hasOwnProperty('product_id')) {
      router.navigate(`/prodcare/operating/component/detail/${row?.node?.data?.id}`);
    } else {
      router.navigate(`/prodcare/operating/product/detail/${row?.node?.data?.id}`);
    }
  }

  function handleExportFile() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(t('General'), {
      views: [{ zoomScale: 85 }], // Set default zoom to 85%
    });

    const data = [products?.map((item) => item)];
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
        <h1 className="card-label">{`${t('ListOfProductsHasBeenImplemented', {
          project: currentProject?.project_name,
        })} ${pagination?.total ? `(${pagination?.total})` : ''}`}</h1>
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
            <div className="d-flex flex-wrap align-items-center">
              <label className="mr-2 mb-0" htmlFor="customer">
                {_.capitalize(t('Customer'))}
              </label>
              <KTFormSelect
                name="customer"
                isCustom
                options={[
                  { name: 'All', value: '' },
                  ...customers.map((item) => {
                    return {
                      name: `${item?.['military_region']} - ${item?.['name']}`,
                      value: item.id.toString(),
                    };
                  }),
                ]}
                value={Global.gFiltersProductList.customerId}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersProductList = {
                    ...filters,
                    page: 0,
                    customerId: newValue,
                  };
                  setFilters({
                    ...Global.gFiltersProductList,
                  });
                }}
              />
            </div>
            <div className="d-flex flex-wrap align-items-center">
              <label className="mr-2 mb-0" htmlFor="status">
                {_.capitalize(t('CurrentStatus'))}
              </label>
              <KTFormSelect
                name="status"
                isCustom
                options={[
                  { name: 'All', value: '' },
                  ...AppData.productCurrentStatus.map((item) => {
                    return {
                      name: t(item?.name),
                      value: item.value,
                    };
                  }),
                ]}
                value={Global.gFiltersProductList.status}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersProductList = {
                    ...filters,
                    page: 0,
                    status: newValue,
                  };
                  setFilters({
                    ...Global.gFiltersProductList,
                  });
                }}
              />
            </div>
            <div className="d-flex flex-wrap align-items-center">
              <label className="mr-2 mb-0" htmlFor="handedOverTime">
                {_.capitalize(t('HandedOverTime'))}
              </label>
              <DateRangePickerInput
                getDateRange={(dateRange) => {
                  needToRefreshData.current = true;
                  Global.gFiltersProductList = {
                    ...filters,
                    startTime: dateRange.startDate,
                    endTime: dateRange.endDate,
                  };
                  setFilters({
                    ...Global.gFiltersProductList,
                  });
                }}
              />
            </div>
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
              {/* <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalEditProductShowing(true);
                }}
                className="btn btn-success font-weight-bold d-flex align-items-center"
              >
                <i className="fa-regular fa-file-download"></i>
                {t('Export')}
              </a> */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalEditProductShowing(true);
                }}
                className="btn btn-primary font-weight-bold d-flex align-items-center"
              >
                <i className="far fa-plus"></i>
                {t('NewProduct')}
              </a>
            </div>
          ) : null}
        </div>

        {/* card body */}
        <div className="card-body pt-0">
          {table}

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

      <ModalEditComponent
        products={products}
        show={modalComponentEditShowing}
        onClose={() => {
          setModalEditComponentShowing(false);
        }}
        onExistDone={() => {
          setSelectedComponentItem(null);
        }}
        componentItem={selectedComponentItem}
        onRefreshComponentList={() => {
          setSelectedComponentItem(null);
          getComponentList();
        }}
      />
    </div>
  );
}

export default ProductHomePage;
