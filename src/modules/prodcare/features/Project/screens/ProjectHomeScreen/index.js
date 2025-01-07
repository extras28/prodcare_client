import { unwrapResult } from '@reduxjs/toolkit';
import projectApi from 'api/projectApi';
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
import ModalEditProject from '../../components/ModalEditProject';
import { setPaginationPerPage, thunkGetListProject } from '../../projectSlice';
import userApi from 'api/userApi';
import customerApi from 'api/customerApi';
import { thunkGetListProduct } from 'modules/prodcare/features/Product/productSlice';
import { thunkGetAllProject } from 'app/appSlice';

ProjectHomePage.propTypes = {};

const sTag = '[ProjectHomePage]';

function ProjectHomePage(props) {
  // MARK: --- Params ---
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState(Global.gFiltersProjectList);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [toggledClearProjects, setToggledClearProjects] = useState(true);
  const { projects, isGettingProjectList, pagination } = useSelector((state) => state.project);
  const { current } = useSelector((state) => state.auth);
  const needToRefreshData = useRef(projects?.length === 0);
  const refLoading = useRef(false);
  const columns = useMemo(() => {
    const tableColumns = [
      {
        name: t('ProductId'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-bold m-0 text-maxline-3 d-flex align-items-center"
            >
              {row?.id}
            </div>
          );
        },
      },
      {
        name: t('ProductName'),
        sortable: false,
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-3"
            >
              {row?.project_name}
            </p>
          );
        },
      },
      {
        name: t('ProjectPm'),
        sortable: false,
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-bolder font-weight-normal m-0 text-maxline-3"
            >
              {row?.project_pm}
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
                  handleEditProject(row);
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
                  handleDeleteProject(row);
                }}
              >
                <i className="far fa-trash p-0 icon-1x" />
              </a>
            </KTTooltip>
          </div>
        ),
      },
    ];

    if (current?.role != 'ADMIN') return tableColumns.slice(0, tableColumns.length - 1);
    return tableColumns;
  }, [current, LanguageHelper.getCurrentLanguage()]);
  const [selectedProjectItem, setSelectedProjectItem] = useState(null);
  const [modalProjectEditShowing, setModalEditProjectShowing] = useState(false);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);

  // MARK: --- Functions ---
  // Get Project list
  async function getProjectList() {
    refLoading.current = true;
    try {
      const res = unwrapResult(await dispatch(thunkGetListProject(filters)));
    } catch (error) {
      console.log(`${sTag} get Project list error: ${error.message}`);
    }
    refLoading.current = false;
  }

  function handleSelectedProjectsChanged(state) {
    const selectedProjects = state.selectedRows;
    setSelectedProjects(selectedProjects);
  }

  function clearSelectedProjects() {
    setSelectedProjects([]);
    setToggledClearProjects(!toggledClearProjects);
  }

  function handleEditProject(project) {
    setSelectedProjectItem(project);
    setModalEditProjectShowing(true);
  }

  function handleDeleteMultiProjects() {
    const arrIdsToDelete = selectedProjects.map((item) => item['id']);
    console.log(`${sTag} handle delete multi projects: ${arrIdsToDelete}`);

    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteMultiProduct', {
        projects: JSON.stringify(arrIdsToDelete.length),
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
        const projectIds = arrIdsToDelete;
        try {
          const res = await projectApi.deleteProject({
            projectIds: projectIds,
          });
          const { result } = res;
          if (result === 'success') {
            clearSelectedProjects();
            Global.gNeedToRefreshProjectList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersProjectList = { ...filters };
            setFilters({ ...filters });
            dispatch(thunkGetListProduct(Global.gFiltersProductList));
            dispatch(thunkGetAllProject());
          }
        } catch (error) {
          console.log(`${sTag} delete faq error: ${error.message}`);
        }
      }
    });
  }

  function handleSelectedProjectsChanged(state) {
    const selectedProjects = state.selectedRows;
    setSelectedProjects(selectedProjects);
  }

  function handleDeleteProject(project) {
    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteProduct', { name: project['project_name'] }),
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
          const res = await projectApi.deleteProject({
            projectIds: [project['id']],
          });
          const { result } = res;
          if (result == 'success') {
            Global.gNeedToRefreshProjectList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersProjectList = { ...filters };
            setFilters({ ...filters });
            dispatch(thunkGetListProduct(Global.gFiltersProductList));
            dispatch(thunkGetAllProject());
          }
        } catch (error) {
          console.log(`Delete Project error: ${error?.message}`);
        }
      }
    });
  }

  async function getListUser() {
    try {
      const res = await userApi.getListUser();
      if (res.result == 'success') {
        setUsers(res.users);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getListCustomer() {
    try {
      const res = await customerApi.getListCustomer();
      if (res.result == 'success') {
        setCustomers(res.customers);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    if (!refLoading.current && (needToRefreshData.current || Global.gNeedToRefreshProjectList)) {
      getProjectList();
      Global.gNeedToRefreshProjectList = false;
    }
  }, [filters]);

  useEffect(() => {
    getListUser();
    getListCustomer();
  }, []);

  return (
    <div>
      <div className="card-title ">
        <h1 className="card-label">{`${t('ProductList')} ${
          pagination?.total ? `(${pagination?.total})` : ''
        }`}</h1>
      </div>

      <div className="card card-custom border">
        {/* card header */}
        <div className="card-header border-0 ">
          {/* header toolbar */}

          <KeenSearchBarNoFormik
            name="searchQuery"
            className="my-2"
            placeholder={`${t('Search')}...`}
            value={Global.gFiltersProjectList.q}
            onSubmit={(text) => {
              needToRefreshData.current = true;
              Global.gFiltersProjectList = {
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
                  selectedProjects.length === 0 ? 'd-none' : 'd-flex'
                } btn btn-light-danger font-weight-bold align-items-center mr-2`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteMultiProjects();
                }}
              >
                <i className="far fa-ban"></i>
                {`${t('Delete')} (${selectedProjects.length})`}
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalEditProjectShowing(true);
                }}
                className="btn btn-primary font-weight-bold d-flex align-items-center"
              >
                <i className="far fa-plus"></i>
                {t('NewProduct')}
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
            data={projects}
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
            progressPending={isGettingProjectList}
            progressComponent={<Loading showBackground={false} message={`${t('Loading')}...`} />}
            onSelectedRowsChange={handleSelectedProjectsChanged}
            clearSelectedRows={toggledClearProjects}
            onRowClicked={(row) => {
              handleEditProject(row);
            }}
            pointerOnHover
            highlightOnHover
            selectableRowsHighlight
          />

          {/* Pagination */}
          {pagination && projects?.length > 0 && (
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
                  Global.gFiltersProjectList = { ...filters, page: iNewPage };
                  setFilters({
                    ...filters,
                    page: iNewPage,
                  });
                }}
                onChangeRowsPerPage={(newPerPage) => {
                  const iNewPerPage = parseInt(newPerPage);
                  dispatch(setPaginationPerPage(iNewPerPage));
                  needToRefreshData.current = true;
                  Global.gFiltersProjectList = {
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

      <ModalEditProject
        users={users}
        customers={customers}
        show={modalProjectEditShowing}
        onClose={() => {
          setModalEditProjectShowing(false);
        }}
        onExistDone={() => {
          setSelectedProjectItem(null);
        }}
        projectItem={selectedProjectItem}
        onRefreshProjectList={() => {
          setSelectedProjectItem(null);
          getProjectList();
        }}
      />
    </div>
  );
}

export default ProjectHomePage;
