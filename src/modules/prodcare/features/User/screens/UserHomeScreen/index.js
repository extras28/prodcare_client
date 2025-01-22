import { unwrapResult } from '@reduxjs/toolkit';
import customDataTableStyle from 'assets/styles/customDataTableStyle';
import useRouter from 'hooks/useRouter';
import { useEffect, useMemo, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { setPaginationPerPage, thunkGetListUser } from '../../userSlice';
// import ModalResetPasswordUser from '../../Components/ModelResetPasswordUser';
import userApi from 'api/userApi';
import Empty from 'shared/components/Empty';
import Loading from 'shared/components/Loading';
import KTTooltip from 'shared/components/OtherKeenComponents/KTTooltip';
import KeenSearchBarNoFormik from 'shared/components/OtherKeenComponents/KeenSearchBarNoFormik';
import Pagination from 'shared/components/Pagination';
import AppResource from 'shared/constants/AppResource';
import LanguageHelper from 'shared/helpers/LanguageHelper';
import ToastHelper from 'shared/helpers/ToastHelper';
import { UserHelper } from 'shared/helpers/UserHelper';
import Global from 'shared/utils/Global';
import Utils from 'shared/utils/Utils';
import ModalEditUser from '../../components/ModalEditUser';
import ModalResetUserPassword from '../../components/ModalResetUserPassword';
import { thunkGetListProject } from 'modules/prodcare/features/Project/projectSlice';

UserHomePage.propTypes = {};

const sTag = '[UserHomePage]';

function UserHomePage(props) {
  // MARK: --- Params ---
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState(Global.gFiltersUserList);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [toggledClearUsers, setToggledClearUsers] = useState(true);
  const { users, isGettingUserList, pagination } = useSelector((state) => state.user);
  const { current } = useSelector((state) => state.auth);
  const needToRefreshData = useRef(users?.length === 0);
  const refLoading = useRef(false);
  const columns = useMemo(() => {
    const tableColumns = [
      {
        name: t('STT'),
        width: '60px',
        sortable: false,
        cell: (row) => {
          return (
            <p data-tag="allowRowEvents" className={`font-weight-normal m-0 text-maxline-3`}>
              {t(_.capitalize(row?.orderNumber))}
            </p>
          );
        },
      },
      {
        name: t('Email'),
        sortable: false,
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-bold m-0 text-maxline-3 d-flex align-items-center"
            >
              {row?.email}
            </div>
          );
        },
      },
      {
        name: t('Fullname'),
        sortable: false,
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-3"
            >
              {row?.name}
            </p>
          );
        },
      },
      {
        name: t('EmployeeId'),
        sortable: false,
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-bolder font-weight-normal m-0 text-maxline-3"
            >
              {row?.employee_id}
            </p>
          );
        },
      },
      {
        name: t('Title'),
        sortable: false,
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-3 d-flex align-items-center"
            >
              {row?.title}
            </div>
          );
        },
      },

      {
        name: t('Phone'),
        sortable: false,
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-3"
            >
              {row?.phone}
            </p>
          );
        },
      },
      {
        name: t('DateOfBirth'),
        sortable: false,
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-3"
            >
              {Utils.formatDateTime(row?.dob, 'YYYY-MM-DD')}
            </p>
          );
        },
      },
      {
        name: t('Role'),
        sortable: false,
        cell: (row) => {
          return (
            <span className={`badge bg-${UserHelper.getUserRoleColor(row?.role)}`}>
              {t(UserHelper.getUserRoleText(row?.role))}
            </span>
          );
        },
      },
      {
        name: t('Action'),
        center: 'true',
        cell: (row) => (
          <div className="d-flex align-items-center">
            <KTTooltip text={t('Edit')}>
              <a
                className="btn btn-icon btn-xs btn-primary btn-hover-primary mr-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleEditUser(row);
                }}
              >
                <i className="fa-regular fa-user-pen p-0 icon-1x" />
              </a>
            </KTTooltip>

            <KTTooltip text={t('Delete')}>
              <a
                className="btn btn-icon btn-xs btn-danger btn-hover-danger mr-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteUser(row);
                }}
              >
                <i className="far fa-trash p-0 icon-1x" />
              </a>
            </KTTooltip>
            <KTTooltip text={t('ResetPassword')}>
              <a
                className="btn btn-icon btn-xs btn-warning btn-hover-warning mr-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleResetPasswordUser(row);
                }}
              >
                <i className="fa-regular fa-key p-0 icon-1x" />
              </a>
            </KTTooltip>
            {/* <KTTooltip text={t('Call')}>
              <a
                className="btn btn-icon btn-xs btn-success btn-hover-success"
                href={`tel:${row.phone}`}
              >
                <i className="far fa-phone p-0 icon-1x" />
              </a>
            </KTTooltip> */}
          </div>
        ),
      },
    ];

    if (current?.role != 'ADMIN') return tableColumns.slice(0, tableColumns.length - 1);
    return tableColumns;
  }, [current, LanguageHelper.getCurrentLanguage()]);
  const [selectedUserItem, setSelectedUserItem] = useState(null);
  const [modalUserEditShowing, setModalEditUserShowing] = useState(false);
  const [modalUserResetPasswordShowing, setModalUserResetPasswordShowing] = useState(false);

  // MARK: --- Functions ---
  // Get User list
  async function getUserList() {
    refLoading.current = true;
    try {
      const res = unwrapResult(await dispatch(thunkGetListUser(filters)));
    } catch (error) {
      console.log(`${sTag} get User list error: ${error.message}`);
    }
    refLoading.current = false;
  }

  function handleSelectedUsersChanged(state) {
    const selectedUsers = state.selectedRows;
    setSelectedUsers(selectedUsers);
  }

  function clearSelectedUsers() {
    setSelectedUsers([]);
    setToggledClearUsers(!toggledClearUsers);
  }

  function handleEditUser(User) {
    setSelectedUserItem(User);
    setModalEditUserShowing(true);
  }

  function handleViewUserDetail(row) {
    router.navigate(`/prodcare/admin/user/detail/${row?.employee_id}`);
  }

  function handleDeleteMultiUsers() {
    const arrIdsToDelete = selectedUsers.map((item) => item['employee_id']);
    const arrAvatarsToDelete = selectedUsers.map((item) => item['avatar']);
    console.log(`${sTag} handle delete multi users: ${arrIdsToDelete}`);

    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteMultiUser', {
        users: JSON.stringify(arrIdsToDelete.length),
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
        const userIds = arrIdsToDelete;
        try {
          const res = await userApi.deleteUser({
            employeeIds: userIds,
            avatars: arrAvatarsToDelete,
          });
          const { result } = res;
          if (result === 'success') {
            clearSelectedUsers();
            Global.gNeedToRefreshUserList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersUserList = { ...filters };
            setFilters({ ...filters });
            dispatch(thunkGetListProject(Global.gFiltersProjectList));
          }
        } catch (error) {
          console.log(`${sTag} delete faq error: ${error.message}`);
        }
      }
    });
  }

  function handleSelectedUsersChanged(state) {
    const selectedUsers = state.selectedRows;
    setSelectedUsers(selectedUsers);
  }

  function handleResetPasswordUser(User) {
    setSelectedUserItem(User);
    setModalUserResetPasswordShowing(true);
  }

  function handleDeleteUser(User) {
    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteUser', { name: User?.name }),
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
          const res = await userApi.deleteUser({
            employeeIds: [User['employee_id']],
            avatars: [User.avatar],
          });
          const { result } = res;
          if (result == 'success') {
            Global.gNeedToRefreshUserList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersUserList = { ...filters };
            setFilters({ ...filters });
            dispatch(thunkGetListProject(Global.gFiltersProjectList));
          }
        } catch (error) {
          console.log(`Delete User error: ${error?.message}`);
        }
      }
    });
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    if (!refLoading.current && (needToRefreshData.current || Global.gNeedToRefreshUserList)) {
      getUserList();
      Global.gNeedToRefreshUserList = false;
    }
  }, [filters]);

  return (
    <div>
      <div className="card-title ">
        <h1 className="card-label">{`${t('UserList')} ${
          pagination?.total ? `(${pagination?.total})` : ''
        }`}</h1>
      </div>

      <div className="card card-custom border">
        {/* card header */}
        <div className="card-header border-0 ">
          {/* <div className="w-100 d-flex justify-content-between"> */}
          {/* header toolbar */}
          {/* <div className="card-toolbar">
              <a
                href="#"
                className={`${
                  selectedUsers.length === 0 ? 'd-none' : 'd-flex'
                } btn btn-light-danger font-weight-bold align-items-center`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteMultiUsers();
                }}
              >
                <i className="far fa-ban"></i>
                {`${t('Delete')} (${selectedUsers.length})`}
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalEditUserShowing(true);
                }}
                className="btn btn-primary font-weight-bold d-flex align-items-center ml-2"
              >
                <i className="far fa-plus"></i>
                {t('NewUser')}
              </a>
            </div> */}
          {/* </div> */}

          {/* <div className="d-flex flex-wrap"> */}
          <KeenSearchBarNoFormik
            name="searchQuery"
            className="my-2"
            placeholder={`${t('Search')}...`}
            value={Global.gFiltersUserList.q}
            onSubmit={(text) => {
              needToRefreshData.current = true;
              Global.gFiltersUserList = {
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
          {current?.role != 'ADMIN' ? null : (
            <div className="card-toolbar gap-2">
              <a
                href="#"
                className={`${
                  selectedUsers.length === 0 ? 'd-none' : 'd-flex'
                } btn btn-sm btn-light-danger font-weight-bold align-items-center mr-2`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteMultiUsers();
                }}
              >
                <i className="far fa-ban"></i>
                {`${t('Delete')} (${selectedUsers.length})`}
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalEditUserShowing(true);
                }}
                className="btn btn-sm btn-primary font-weight-bold d-flex align-items-center"
              >
                <i className="far fa-plus"></i>
                {t('NewUser')}
              </a>
            </div>
          )}
          {/* </div> */}
        </div>

        {/* card body */}
        <div className="card-body pt-0">
          <DataTable
            // fixedHeader
            // fixedHeaderScrollHeight="60vh"
            columns={columns}
            data={users}
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
            progressPending={isGettingUserList}
            progressComponent={<Loading showBackground={false} message={`${t('Loading')}...`} />}
            onSelectedRowsChange={handleSelectedUsersChanged}
            clearSelectedRows={toggledClearUsers}
            onRowClicked={(row) => {
              // handleEditUser(row);
              handleViewUserDetail(row);
            }}
            pointerOnHover
            highlightOnHover
            selectableRowsHighlight
          />

          {/* Pagination */}
          {pagination && users?.length > 0 && (
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
                  Global.gFiltersUserList = { ...filters, page: iNewPage };
                  setFilters({
                    ...filters,
                    page: iNewPage,
                  });
                }}
                onChangeRowsPerPage={(newPerPage) => {
                  const iNewPerPage = parseInt(newPerPage);
                  dispatch(setPaginationPerPage(iNewPerPage));
                  needToRefreshData.current = true;
                  Global.gFiltersUserList = {
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

      <ModalEditUser
        show={modalUserEditShowing}
        onClose={() => {
          setModalEditUserShowing(false);
        }}
        onExistDone={() => {
          setSelectedUserItem(null);
        }}
        userItem={selectedUserItem}
        onRefreshUserList={() => {
          setSelectedUserItem(null);
          getUserList();
        }}
      />
      <ModalResetUserPassword
        show={modalUserResetPasswordShowing}
        onClose={() => {
          setModalUserResetPasswordShowing(false);
        }}
        onExistDone={() => {
          setSelectedUserItem(null);
        }}
        userItem={selectedUserItem}
        onRefreshUserList={() => {
          setSelectedUserItem(null);
          getUserList();
        }}
      />
    </div>
  );
}

export default UserHomePage;
