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

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import ModalEditComponent from 'modules/prodcare/features/Component/components/ModalEditComponent';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import DateRangePickerInput from 'shared/components/AppDateRangePicker';
import KTFormSelect from 'shared/components/OtherKeenComponents/Forms/KTFormSelect';
import AppData from 'shared/constants/AppData';

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
  const allProducts = useSelector((state) => state?.app?.products);
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
          style={{ width: '40px' }}
          className="pr-0"
          body={(row) => {
            return (
              <span data-tag="allowRowEvents" className="ont-weight-normal">
                {row?.data?.orderNumber}
              </span>
            );
          }}
          field="order"
          header={t('STT')}
        ></Column>
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
          style={{ width: '180px' }}
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
          style={{ width: '150px' }}
          body={(row) => {
            const ct = customers.find((item) => item.id === row?.data?.['customer_id']);
            return (
              <span data-tag="allowRowEvents" className="font-weight-normal  text-maxline-3">
                {ct ? `${ct?.['name']} - ${ct?.['military_region']}` : ''}
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

            let active = 'GOOD';

            if (issues?.length > 0) {
              const allProcessed = issues.every((item) => item?.status == 'PROCESSED');
              if (!allProcessed) {
                const hasStopFighting = issues.some(
                  (item) => item?.stop_fighting && item?.status != 'PROCESSED'
                );
                active = hasStopFighting ? 'DEFECTIVE' : 'DEGRADED';
              }
            }

            return (
              <span
                data-tag="allowRowEvents"
                className={`badge badge-${
                  active == 'GOOD' ? 'success' : active == 'DEFECTIVE' ? 'danger' : 'warning'
                }`}
              >
                {active == 'GOOD'
                  ? t('Good')
                  : active == 'DEFECTIVE'
                  ? t('HaveErrors')
                  : t('OperationalWithErrors')}
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
          style={{ width: '200px' }}
          body={(row) => {
            const issues = row?.data?.issues;

            let active = 'GOOD';

            if (issues?.length > 0) {
              const allProcessed = issues.every((item) => item?.status == 'PROCESSED');
              if (!allProcessed) {
                const hasStopFighting = issues.some(
                  (item) => item?.stop_fighting && item?.status != 'PROCESSED'
                );
                active = hasStopFighting ? 'DEFECTIVE' : 'DEGRADED';
              }
            }
            const breakdown = active == 'DEFECTIVE' || row?.status === 'REPAIRING' ? true : false;
            return (
              <span
                data-tag="allowRowEvents"
                className={`${breakdown ? 'text-danger' : 'text-dark-75'} font-weight-normal`}
              >
                {row?.data?.description}
              </span>
            );
          }}
          field="description"
          header={t('Note')}
        ></Column>
        {/* <Column
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
        ></Column> */}
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

  async function getAllProduct() {
    try {
      const res = await productApi.exportExcel({ projectId: currentProject?.id });
      if (res.result === 'success') {
        return res.components;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function exportExcelFile() {
    const workbook = new ExcelJS.Workbook();
    const worksheet2 = workbook.addWorksheet(currentProject?.project_name, {
      views: [{ zoomScale: 85 }], // Set default zoom to 85%
    });

    const excelComponents = await getAllProduct();

    const listData2 = [
      [
        t('Customer'),
        t('Product'),
        t('Component'),
        t('Serial'),
        t('SoftwareVersion'),
        t('CurrentStatus'),
        t('Status'),
        t('Note'),
        'Is First Row', // Helper column
      ],
      ...excelComponents.map((item, index) => {
        const customer = item?.product?.customer;
        const issues = item?.issues;

        const breakdown =
          issues?.length > 0 && issues?.every((item) => item?.status !== 'PROCESSED')
            ? true
            : false;

        return [
          customer ? `${customer?.['military_region']} - ${customer?.['name']}` : '',
          item?.product?.name,
          item?.name,
          item?.serial,
          item?.version ?? '',
          item?.status
            ? t(AppData.productCurrentStatus.find((st) => st?.value === item?.status)?.name)
            : '',
          breakdown ? t('HaveErrors') : t('Active'),
          item?.description ?? '',
          index === 0 ||
          excelComponents[index - 1]?.product?.customer?.['name'] !== customer?.['name']
            ? 'Yes'
            : 'No', // Helper column logic
        ];
      }),
    ];

    listData2.forEach((row, rowIndex) => {
      const excelRow = worksheet2.getRow(rowIndex + 1);
      row.forEach((value, colIndex) => {
        const cell = excelRow.getCell(colIndex + 1);
        cell.value = value;
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.font = { name: 'Times New Roman', size: 11 };
      });

      if (row[6] === t('HaveErrors') || row[5] === t(AppData.productCurrentStatus[2].name)) {
        excelRow.eachCell((cell, colNumber) => {
          if (colNumber > 2) {
            // Skip columns A (1) and B (2)
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF0000' }, // Red color
            };
          }
        });
      }
    });

    // Apply styles to the first row (header row)
    const headerRow = worksheet2.getRow(1);
    headerRow.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; // Align text to the center
      cell.font = { name: 'Times New Roman', size: 12, bold: true }; // Bold and green
    });

    // Adding borders to list sheet cells
    worksheet2.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    worksheet2.columns.forEach((column, index) => {
      if (index === worksheet2.columns.length - 1) {
        column.hidden = true; // Hide the helper column
      } else {
        column.width = 30; // Adjust as necessary
      }
    });

    // Merge cells in column A (Customer) and column B (Product)
    const mergeCellsByColumn = (colIndex) => {
      let startRow = 2; // Skip the header row
      for (let i = 2; i < listData2.length; i++) {
        const currentCellValue = worksheet2.getCell(i, colIndex).value;
        const nextCellValue = worksheet2.getCell(i + 1, colIndex)?.value;
        if (currentCellValue !== nextCellValue || i + 1 === listData2.length) {
          if (startRow < i) {
            worksheet2.mergeCells(startRow, colIndex, i, colIndex);
          }
          startRow = i + 1;
        }
      }
    };

    mergeCellsByColumn(1); // Merge column A
    mergeCellsByColumn(2); // Merge column B

    worksheet2.getColumn(4).width = 30;
    worksheet2.getColumn(5).width = 15;
    worksheet2.getColumn(6).width = 15;
    worksheet2.getColumn(7).width = 15;
    worksheet2.getColumn(8).width = 40;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, currentProject?.project_name);
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
                      name: `${item?.['name']} - ${item?.['military_region']}`,
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
              <label className="mr-2 mb-0" htmlFor="situation">
                {_.capitalize(t('Status'))}
              </label>
              <KTFormSelect
                name="situation"
                isCustom
                options={[
                  { name: 'All', value: '' },
                  ...AppData.productAndComponentStatus.map((item) => {
                    return {
                      name: t(item?.name),
                      value: item.value,
                    };
                  }),
                ]}
                value={Global.gFiltersProductList.situation}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersProductList = {
                    ...filters,
                    page: 0,
                    situation: newValue,
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
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  exportExcelFile();
                }}
                className="btn btn-success font-weight-bold d-flex align-items-center"
              >
                <i className="fa-regular fa-file-download"></i>
                {t('Export')}
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
        products={allProducts}
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
