import { unwrapResult } from '@reduxjs/toolkit';
import customerApi from 'api/customerApi';
import { thunkGetAllCustomer } from 'app/appSlice';
import customDataTableStyle from 'assets/styles/customDataTableStyle';
import useRouter from 'hooks/useRouter';
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
import LanguageHelper from 'shared/helpers/LanguageHelper';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import Swal from 'sweetalert2';
import ModalEditCustomer from '../../components/ModalEditCustomer';
import { setPaginationPerPage, thunkGetListCustomer } from '../../customerSlice';

CustomerHomePage.propTypes = {};

const sTag = '[CustomerHomePage]';

function CustomerHomePage(props) {
  // MARK: --- Params ---
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState(Global.gFiltersCustomerList);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [toggledClearCustomers, setToggledClearCustomers] = useState(true);
  const { customers, isGettingCustomerList, pagination } = useSelector((state) => state.customer);
  const { current } = useSelector((state) => state.auth);
  const needToRefreshData = useRef(customers?.length === 0);
  const refLoading = useRef(false);
  const columns = useMemo(() => {
    const tableColumns = [
      {
        name: t('ManagingAuthority'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-bold m-0 text-maxline-3 d-flex align-items-center"
            >
              {row?.military_region}
            </div>
          );
        },
      },
      {
        name: t('Unit'),
        sortable: false,
        width: '120px',
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
        name: t('Sign'),
        sortable: false,
        width: '120px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-bolder font-weight-normal m-0 text-maxline-3 mr-4"
            >
              {row?.sign}
            </p>
          );
        },
      },
      {
        name: t('CodeNumber'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-3 d-flex align-items-center"
            >
              {row?.code_number}
            </div>
          );
        },
      },

      {
        name: t('Address'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-3 mr-4"
            >
              {row?.address}
            </p>
          );
        },
      },
      {
        name: t('ContactPersonName'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-3 mr-4"
            >
              {row?.contact_person_name}
            </p>
          );
        },
      },
      {
        name: t('Title'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-3 mr-4"
            >
              {row?.contact_person_title}
            </p>
          );
        },
      },
      {
        name: t('Phone'),
        sortable: false,
        width: '150px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-3 mr-4"
            >
              {row?.phone}
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
                  handleEditCustomer(row);
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
                  handleDeleteCustomer(row);
                }}
              >
                <i className="far fa-trash p-0 icon-1x" />
              </a>
            </KTTooltip>
          </div>
        ),
      },
    ];

    if (current?.role != 'ADMIN' && current?.role !== 'OPERATOR')
      return tableColumns.slice(0, tableColumns.length - 1);
    return tableColumns;
  }, [current, LanguageHelper.getCurrentLanguage()]);
  const [selectedCustomerItem, setSelectedCustomerItem] = useState(null);
  const [modalCustomerEditShowing, setModalEditCustomerShowing] = useState(false);

  // MARK: --- Functions ---
  // Get Customer list
  async function getCustomerList() {
    refLoading.current = true;
    try {
      const res = unwrapResult(await dispatch(thunkGetListCustomer(filters)));
    } catch (error) {
      console.log(`${sTag} get Customer list error: ${error.message}`);
    }
    refLoading.current = false;
  }

  function handleSelectedCustomersChanged(state) {
    const selectedCustomers = state.selectedRows;
    setSelectedCustomers(selectedCustomers);
  }

  function clearSelectedCustomers() {
    setSelectedCustomers([]);
    setToggledClearCustomers(!toggledClearCustomers);
  }

  function handleEditCustomer(customer) {
    setSelectedCustomerItem(customer);
    setModalEditCustomerShowing(true);
  }

  function handleDeleteMultiCustomers() {
    const arrIdsToDelete = selectedCustomers.map((item) => item.id);
    console.log(`${sTag} handle delete multi customers: ${arrIdsToDelete}`);

    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteMultiCustomer', {
        customers: JSON.stringify(arrIdsToDelete.length),
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
        const customerIds = arrIdsToDelete;
        try {
          const res = await customerApi.deleteCustomer({
            customerIds: customerIds,
          });
          const { result } = res;
          if (result === 'success') {
            clearSelectedCustomers();
            Global.gNeedToRefreshCustomerList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersCustomerList = { ...filters };
            setFilters({ ...filters });
            dispatch(thunkGetAllCustomer());
          }
        } catch (error) {
          console.log(`${sTag} delete faq error: ${error.message}`);
        }
      }
    });
  }

  function handleSelectedCustomersChanged(state) {
    const selectedCustomers = state.selectedRows;
    setSelectedCustomers(selectedCustomers);
  }

  function handleDeleteCustomer(customer) {
    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteCustomer', { name: customer?.name }),
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
          const res = await customerApi.deleteCustomer({
            customerIds: [customer['id']],
          });
          const { result } = res;
          if (result == 'success') {
            Global.gNeedToRefreshCustomerList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersCustomerList = { ...filters };
            setFilters({ ...filters });
            dispatch(thunkGetAllCustomer());
          }
        } catch (error) {
          console.log(`Delete Customer error: ${error?.message}`);
        }
      }
    });
  }

  function handleNavigateDetailScreen(row) {
    router.navigate(`detail/${row?.id}`);
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    if (!refLoading.current && (needToRefreshData.current || Global.gNeedToRefreshCustomerList)) {
      getCustomerList();
      Global.gNeedToRefreshCustomerList = false;
    }
  }, [filters]);

  return (
    <div>
      <div className="card-title ">
        <h1 className="card-label">{`${t('CustomerList')} ${
          pagination?.total ? `(${pagination?.total})` : ''
        }`}</h1>
      </div>

      <div className="card card-custom border">
        {/* card header */}
        <div className="card-header border-0 pt-6 pb-6">
          {/* header toolbar */}

          <KeenSearchBarNoFormik
            name="searchQuery"
            className="my-2"
            placeholder={`${t('Search')}...`}
            value={Global.gFiltersCustomerList.q}
            onSubmit={(text) => {
              needToRefreshData.current = true;
              Global.gFiltersCustomerList = {
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
          {current?.role === 'GUEST' ? null : (
            <div className="card-toolbar gap-2">
              <a
                href="#"
                className={`${
                  selectedCustomers.length === 0 ? 'd-none' : 'd-flex'
                } btn btn-light-danger font-weight-bold align-items-center mr-2`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteMultiCustomers();
                }}
              >
                <i className="far fa-ban"></i>
                {`${t('Delete')} (${selectedCustomers.length})`}
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalEditCustomerShowing(true);
                }}
                className="btn btn-primary font-weight-bold d-flex align-items-center"
              >
                <i className="far fa-plus"></i>
                {t('NewCustomer')}
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
            data={customers}
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
            progressPending={isGettingCustomerList}
            progressComponent={<Loading showBackground={false} message={`${t('Loading')}...`} />}
            onSelectedRowsChange={handleSelectedCustomersChanged}
            clearSelectedRows={toggledClearCustomers}
            onRowClicked={(row) => {
              // handleEditCustomer(row);
              handleNavigateDetailScreen(row);
            }}
            pointerOnHover
            highlightOnHover
            selectableRowsHighlight
          />

          {/* Pagination */}
          {pagination && customers?.length > 0 && (
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
                  Global.gFiltersCustomerList = { ...filters, page: iNewPage };
                  setFilters({
                    ...filters,
                    page: iNewPage,
                  });
                }}
                onChangeRowsPerPage={(newPerPage) => {
                  const iNewPerPage = parseInt(newPerPage);
                  dispatch(setPaginationPerPage(iNewPerPage));
                  needToRefreshData.current = true;
                  Global.gFiltersCustomerList = {
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

      <ModalEditCustomer
        show={modalCustomerEditShowing}
        onClose={() => {
          setModalEditCustomerShowing(false);
        }}
        onExistDone={() => {
          setSelectedCustomerItem(null);
        }}
        customerItem={selectedCustomerItem}
        onRefreshCustomerList={() => {
          setSelectedCustomerItem(null);
          getCustomerList();
        }}
      />
    </div>
  );
}

export default CustomerHomePage;
