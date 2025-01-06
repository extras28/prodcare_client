import { unwrapResult } from '@reduxjs/toolkit';
import componentApi from 'api/componentApi';
import { thunkGetAllComponent } from 'app/appSlice';
import customDataTableStyle from 'assets/styles/customDataTableStyle';
import useRouter from 'hooks/useRouter';
import { useEffect, useMemo, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Empty from 'shared/components/Empty';
import Loading from 'shared/components/Loading';
import KTFormSelect from 'shared/components/OtherKeenComponents/Forms/KTFormSelect';
import KeenSearchBarNoFormik from 'shared/components/OtherKeenComponents/KeenSearchBarNoFormik';
import KTTooltip from 'shared/components/OtherKeenComponents/KTTooltip';
import Pagination from 'shared/components/Pagination';
import AppData from 'shared/constants/AppData';
import AppResource from 'shared/constants/AppResource';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import LanguageHelper from 'shared/helpers/LanguageHelper';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import Swal from 'sweetalert2';
import ModalEditComponent from '../../components/ModalEditComponent';
import { setPaginationPerPage, thunkGetListComponent } from '../../componentSlice';

ComponentHomePage.propTypes = {};

const sTag = '[ComponentHomePage]';

function ComponentHomePage(props) {
  // MARK: --- Params ---
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    ...Global.gFiltersComponentList,
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
  });
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [toggledClearComponents, setToggledClearComponents] = useState(true);
  const { components, isGettingComponentList, pagination } = useSelector(
    (state) => state.component
  );
  const { current } = useSelector((state) => state.auth);
  const needToRefreshData = useRef(components?.length === 0);
  const refLoading = useRef(false);
  const { currentProject, projects, customers, products } = useSelector((state) => state?.app);
  const columns = useMemo(() => {
    const tableColumns = [
      {
        name: t('STT'),
        sortable: false,
        width: '60px',
        cell: (row) => {
          return (
            <div data-tag="allowRowEvents" className="">
              {row?.orderNumber}
            </div>
          );
        },
      },
      {
        name: t('Serial'),
        sortable: false,
        width: '170px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-bolder font-weight-normal m-0 text-maxline-3 mr-4"
            >
              {row?.serial}
            </p>
          );
        },
      },
      {
        name: t('ComponentName'),
        sortable: false,
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-3 mr-4"
            >
              {row?.name}
            </p>
          );
        },
      },
      {
        id: 2,
        name: t('Customer'),
        sortable: false,
        cell: (row) => {
          const ct = row?.product?.customer;
          return (
            <p data-tag="allowRowEvents" className="font-weight-normal m-0 text-maxline-3 mr-4">
              {ct ? `${ct?.['name']} - ${ct?.['military_region']}` : ''}
            </p>
          );
        },
      },
      {
        name: t('Product'),
        sortable: false,
        cell: (row) => {
          const pd = products.find((item) => item.id == row.product_id);
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-bolder font-weight-normal m-0 text-maxline-3 mr-4"
            >
              {`${pd?.name} ${pd?.serial ? '(' + pd?.serial + ')' : ''}`}
            </p>
          );
        },
      },

      {
        name: t('CurrentStatus'),
        sortable: false,
        cell: (row) => {
          return (
            <span
              data-tag="allowRowEvents"
              className={`badge badge-${
                row?.status === 'USING'
                  ? 'primary'
                  : row?.status === 'REPAIRING'
                  ? 'danger'
                  : 'warning'
              }`}
            >
              {row?.status
                ? t(AppData.productCurrentStatus.find((item) => item?.value === row?.status)?.name)
                : ''}
            </span>
          );
        },
      },
      {
        name: t('Status'),
        sortable: false,
        cell: (row) => {
          const issues = row?.issues;

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
                ? t('HaveErrors') +
                  ' (' +
                  issues.filter((item) => item?.status != 'PROCESSED' && item?.stop_fighting)
                    ?.length +
                  ')'
                : t('OperationalWithErrors')}
            </span>
          );
        },
      },
      {
        name: t('ComponentLevel'),
        sortable: false,
        width: '100px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-3 d-flex align-items-center"
            >
              {row?.level}
            </div>
          );
        },
      },
      {
        name: t('SoftwareVersion'),
        sortable: false,
        width: '100px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-3 d-flex align-items-center"
            >
              {row?.version}
            </div>
          );
        },
      },
      {
        name: t('Note'),
        sortable: false,
        cell: (row) => {
          const issues = row?.issues;

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
            <p
              data-tag="allowRowEvents"
              className={`${
                breakdown ? 'text-danger' : 'text-dark-75'
              } font-weight-normal m-0 text-maxline-3 mr-4`}
            >
              {row?.description}
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
                className="btn btn-icon btn-sm btn-primary btn-hover-primary mr-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleEditComponent(row);
                }}
              >
                <i className="fa-regular fa-pen p-0 icon-1x" />
              </a>
            </KTTooltip>

            <KTTooltip text={t('Delete')}>
              <a
                className="btn btn-icon btn-sm btn-danger btn-hover-danger mr-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteComponent(row);
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
  }, [current, LanguageHelper.getCurrentLanguage(), products, projects]);
  const [selectedComponentItem, setSelectedComponentItem] = useState(null);
  const [modalComponentEditShowing, setModalEditComponentShowing] = useState(false);

  // MARK: --- Functions ---
  // Get Component list
  async function getComponentList() {
    refLoading.current = true;
    try {
      const res = unwrapResult(await dispatch(thunkGetListComponent(filters)));
    } catch (error) {
      console.log(`${sTag} get Component list error: ${error.message}`);
    }
    refLoading.current = false;
  }

  function handleSelectedComponentsChanged(state) {
    const selectedComponents = state.selectedRows;
    setSelectedComponents(selectedComponents);
  }

  function clearSelectedComponents() {
    setSelectedComponents([]);
    setToggledClearComponents(!toggledClearComponents);
  }

  function handleEditComponent(Component) {
    setSelectedComponentItem(Component);
    setModalEditComponentShowing(true);
  }

  function handleDeleteMultiComponents() {
    const arrIdsToDelete = selectedComponents.map((item) => item.id);
    console.log(`${sTag} handle delete multi components: ${arrIdsToDelete}`);

    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteMultiComponent', {
        components: JSON.stringify(arrIdsToDelete.length),
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
        const componentIds = arrIdsToDelete;
        try {
          const res = await componentApi.deleteComponent({
            componentIds: componentIds,
          });
          const { result } = res;
          if (result === 'success') {
            clearSelectedComponents();
            Global.gNeedToRefreshComponentList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersComponentList = { ...filters };
            setFilters({ ...filters });
            dispatch(thunkGetAllComponent({ projectId: currentProject?.id }));
          }
        } catch (error) {
          console.log(`${sTag} delete faq error: ${error.message}`);
        }
      }
    });
  }

  function handleSelectedComponentsChanged(state) {
    const selectedComponents = state.selectedRows;
    setSelectedComponents(selectedComponents);
  }

  function handleDeleteComponent(component) {
    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteComponent', { name: component?.name }),
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
          const res = await componentApi.deleteComponent({
            componentIds: [component['id']],
          });
          const { result } = res;
          if (result == 'success') {
            Global.gNeedToRefreshComponentList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersComponentList = { ...filters };
            setFilters({ ...filters });
          }
        } catch (error) {
          console.log(`Delete Component error: ${error?.message}`);
        }
      }
    });
  }

  function handleViewComponentDetail(row) {
    router.navigate(`detail/${row?.id}`);
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    if (!refLoading.current && (needToRefreshData.current || Global.gNeedToRefreshComponentList)) {
      getComponentList();
      Global.gNeedToRefreshComponentList = false;
    }
  }, [filters]);

  useEffect(() => {
    setFilters({
      ...filters,
      projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
    });
    Global.gFiltersComponentList = {
      ...filters,
      projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
    };
    Global.gNeedToRefreshComponentList = true;
  }, [currentProject]);

  return (
    <div>
      <div className="card-title ">
        <h1 className="card-label">{`${t('ComponentList', {
          product: currentProject?.project_name,
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
              value={Global.gFiltersComponentList.q}
              onSubmit={(text) => {
                needToRefreshData.current = true;
                Global.gFiltersComponentList = {
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
              <label className="mr-2 mb-0" htmlFor="product">
                {_.capitalize(t('Product'))}
              </label>
              <KTFormSelect
                name="product"
                isCustom
                options={[
                  { name: 'All', value: '' },
                  ...products.map((item) => {
                    return {
                      name: `${item.name} ${item.serial ? '(' + item.serial + ')' : ''}`,
                      value: item.id?.toString(),
                    };
                  }),
                ]}
                value={Global.gFiltersComponentList.productId.toString()}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersComponentList = {
                    ...filters,
                    page: 0,
                    productId: newValue,
                  };
                  setFilters({
                    ...Global.gFiltersComponentList,
                  });
                }}
              />
            </div>
            {/* <div className="d-flex flex-wrap align-items-center">
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
                value={Global.gFiltersComponentList.customerId}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersComponentList = {
                    ...filters,
                    page: 0,
                    customerId: newValue,
                  };
                  setFilters({
                    ...Global.gFiltersComponentList,
                  });
                }}
              />
            </div> */}
            <div className="d-flex flex-wrap align-items-center">
              <label className="mr-2 mb-0" htmlFor="product">
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
                      value: item.value?.toString(),
                    };
                  }),
                ]}
                value={Global.gFiltersComponentList.status}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersComponentList = {
                    ...filters,
                    page: 0,
                    status: newValue,
                  };
                  setFilters({
                    ...Global.gFiltersComponentList,
                  });
                }}
              />
            </div>
            <div className="d-flex flex-wrap align-items-center">
              <label className="mr-2 mb-0" htmlFor="product">
                {_.capitalize(t('ComponentLevel'))}
              </label>
              <KTFormSelect
                name="componentLevel"
                isCustom
                options={[
                  { name: 'All', value: '' },
                  ...AppData.componentLevel.map((item) => {
                    return { name: item.name, value: item.value };
                  }),
                ]}
                value={Global.gFiltersComponentList.level}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersComponentList = {
                    ...filters,
                    page: 0,
                    level: newValue,
                  };
                  setFilters({
                    ...Global.gFiltersComponentList,
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
                value={Global.gFiltersComponentList.situation}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersComponentList = {
                    ...filters,
                    page: 0,
                    situation: newValue,
                  };
                  setFilters({
                    ...Global.gFiltersComponentList,
                  });
                }}
              />
            </div>
          </div>
          {current?.role === 'GUEST' ? null : (
            <div className="card-toolbar gap-2">
              <a
                href="#"
                className={`${
                  selectedComponents.length === 0 ? 'd-none' : 'd-flex'
                } btn btn-light-danger font-weight-bold align-items-center mr-2`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteMultiComponents();
                }}
              >
                <i className="far fa-ban"></i>
                {`${t('Delete')} (${selectedComponents.length})`}
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalEditComponentShowing(true);
                }}
                className="btn btn-primary font-weight-bold d-flex align-items-center"
              >
                <i className="far fa-plus"></i>
                {t('NewComponent')}
              </a>
            </div>
          )}
        </div>

        {/* card body */}
        <div className="card-body pt-0">
          <DataTable
            // fixedHeader
            // fixedHeaderScrollHeight="60vh"
            columns={columns}
            data={components}
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
            progressPending={isGettingComponentList}
            progressComponent={<Loading showBackground={false} message={`${t('Loading')}...`} />}
            onSelectedRowsChange={handleSelectedComponentsChanged}
            clearSelectedRows={toggledClearComponents}
            onRowClicked={(row) => {
              // handleEditComponent(row);
              handleViewComponentDetail(row);
            }}
            pointerOnHover
            highlightOnHover
            selectableRowsHighlight
          />

          {/* Pagination */}
          {pagination && components?.length > 0 && (
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
                  Global.gFiltersComponentList = { ...filters, page: iNewPage };
                  setFilters({
                    ...filters,
                    page: iNewPage,
                  });
                }}
                onChangeRowsPerPage={(newPerPage) => {
                  const iNewPerPage = parseInt(newPerPage);
                  dispatch(setPaginationPerPage(iNewPerPage));
                  needToRefreshData.current = true;
                  Global.gFiltersComponentList = {
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

export default ComponentHomePage;
