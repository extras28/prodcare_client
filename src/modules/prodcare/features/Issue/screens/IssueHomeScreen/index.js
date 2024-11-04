import { unwrapResult } from '@reduxjs/toolkit';
import issueApi from 'api/issueApi';
import customDataTableStyle from 'assets/styles/customDataTableStyle';
import useRouter from 'hooks/useRouter';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Empty from 'shared/components/Empty';
import Loading from 'shared/components/Loading';
import KTFormSelect from 'shared/components/OtherKeenComponents/Forms/KTFormSelect';
import KTTooltip from 'shared/components/OtherKeenComponents/KTTooltip';
import Pagination from 'shared/components/Pagination';
import AppData from 'shared/constants/AppData';
import AppResource from 'shared/constants/AppResource';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import LanguageHelper from 'shared/helpers/LanguageHelper';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import Utils from 'shared/utils/Utils';
import Swal from 'sweetalert2';
import ModalEditIssue from '../../components/ModalEditIssue';
import ModalUploadIssueFile from '../../components/ModalUploadIssueFile';
import { setPaginationPerPage, thunkGetListIssue } from '../../issueSlice';
import { thunkGetAllComponent, thunkGetAllCustomer, thunkGetAllProduct } from 'app/appSlice';
import ModalEvaluateIssue from '../../components/ModalEvaluateIssue';

IssueHomePage.propTypes = {};

const sTag = '[IssueHomePage]';

function IssueHomePage(props) {
  // MARK: --- Params ---
  const { productId, componentId } = props;
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    ...Global.gFiltersIssueList,
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
    productId: productId,
    componentId: componentId,
  });
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [toggledClearIssues, setToggledClearIssues] = useState(true);
  const { issues, isGettingIssueList, pagination } = useSelector((state) => state.issue);
  const { current } = useSelector((state) => state.auth);
  const needToRefreshData = useRef(issues?.length === 0);
  const refLoading = useRef(false);
  const { currentProject, projects } = useSelector((state) => state?.app);
  const { products, customers, components } = useSelector((state) => state?.app);
  const columns = useMemo(() => {
    const tableColumns = [
      {
        name: t('ErrorStatus'),
        sortable: false,
        // minWidth: '250px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className={`m-0 badge bg-${
                row?.status === 'PROCESSED'
                  ? 'success'
                  : row?.status === 'PROCESSING'
                  ? 'info'
                  : 'warning'
              }`}
            >
              {t(_.capitalize(row?.status))}
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
        name: t('Equipment'),
        sortable: false,
        // minWidth: '150px',
        cell: (row) => {
          const pd = products.find((item) => item.id == row?.product_id);
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-bold m-0 text-maxline-5 d-flex align-items-center"
            >
              {`${pd?.name} ${pd?.serial ? '(' + pd?.serial + ')' : ''}`}
            </div>
          );
        },
      },
      {
        name: t('Component'),
        sortable: false,
        // minWidth: '150px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {components?.find((item) => item.id == row?.component_id)?.name}
            </p>
          );
        },
      },
      {
        name: t('Description'),
        sortable: false,
        // minWidth: '250px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75  font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {row?.description}
            </p>
          );
        },
      },
      {
        name: t('ErrorType'),
        sortable: false,
        // minWidth: '150px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {t(
                AppData.responsibleType.find((item) => item.value === row?.responsible_type)?.name
              )}
            </div>
          );
        },
      },
      {
        name: t('ErrorLevel'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          function getErrorLevelColor() {
            switch (row?.level) {
              case 'CRITICAL':
                return '#FF4C4C';
              case 'MAJOR':
                return '#FF7043';
              case 'MODERATE':
                return '#FFD54F';
              case 'MINOR':
                return '#A5D6A7';

              default:
                break;
            }
          }

          return (
            <p
              data-tag="allowRowEvents"
              className="m-0 badge"
              style={{ backgroundColor: getErrorLevelColor() }}
            >
              {t(_.capitalize(AppData.errorLevel.find((item) => item.value === row?.level)?.name))}
            </p>
          );
        },
      },
      // {
      //   name: t('KPI_h'),
      //   sortable: false,
      //   // minWidth: '120px',
      //   right: true,
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.kpi_h}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('HandlingMeasures'),
      //   sortable: false,
      //   minWidth: '180px',
      //   right: true,
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.handling_measures}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('RepairPart'),
      //   sortable: false,
      //   minWidth: '150px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.repair_part}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('Amount'),
      //   sortable: false,
      //   // minWidth: '150px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.repair_part_count}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('UnitCount'),
      //   sortable: false,
      //   // minWidth: '150px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.unit}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('Project'),
      //   sortable: false,
      //   // minWidth: '150px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {projects.find((item) => item.id == row?.project_id)?.id}
      //       </div>
      //     );
      //   },
      // },

      // {
      //   name: t('S/N'),
      //   sortable: false,
      //   // minWidth: '150px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {customers.find((item) => item.id == row?.customer_id)?.code_number}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('EquipmentStatus'),
      //   sortable: false,
      //   minWidth: '150px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.product_status}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('ExpDate'),
      //   sortable: false,
      //   // minWidth: '120px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.exp_date ? Utils.formatDateTime(row?.exp_date, 'YYYY-MM-DD') : ''}
      //       </div>
      //     );
      //   },
      // },
      {
        name: t('ReceptionTime'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {row?.reception_time ? Utils.formatDateTime(row?.reception_time, 'YYYY-MM-DD') : ''}
            </div>
          );
        },
      },
      // {
      //   name: t('CompletionTime'),
      //   sortable: false,
      //   // minWidth: '120px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.completion_time ? Utils.formatDateTime(row?.completion_time, 'YYYY-MM-DD') : ''}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('HandlingTime'),
      //   sortable: false,
      //   // minWidth: '120px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.handling_time}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('ResponsibleHandlingUnit'),
      //   sortable: false,
      //   // minWidth: '120px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.responsible_handling_unit}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('ReportingPerson'),
      //   sortable: false,
      //   // minWidth: '120px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.reporting_person}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('RemainStatus'),
      //   sortable: false,
      //   // minWidth: '120px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {t(
      //           AppData.errorRemainStatus.find((item) => item.value === row?.['remain_status'])
      //             ?.name
      //         )}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('OverdueKpi'),
      //   sortable: false,
      //   // minWidth: '120px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {t(_.capitalize(row?.overdue_kpi ? 'Yes' : 'No'))}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('WarrantyStatus'),
      //   sortable: false,
      //   // minWidth: '120px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {t(
      //           row?.warranty_status === 'UNDER'
      //             ? 'UnderWarranty'
      //             : row?.warranty_status === 'OVER'
      //             ? 'OutOfWarranty'
      //             : ''
      //         )}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   name: t('OverdueKpiReason'),
      //   sortable: false,
      //   minWidth: '150px',
      //   cell: (row) => {
      //     return (
      //       <div
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
      //       >
      //         {row?.overdue_kpi_reason}
      //       </div>
      //     );
      //   },
      // },

      // {
      //   name: t('SSCDImpact'),
      //   sortable: false,
      //   // minWidth: '120px',
      //   cell: (row) => {
      //     return (
      //       <p
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
      //       >
      //         {t(`${_.capitalize(row?.impact)}`)}
      //       </p>
      //     );
      //   },
      // },
      // {
      //   name: t('StopFighting'),
      //   sortable: false,
      //   // minWidth: '120px',
      //   cell: (row) => {
      //     return (
      //       <p
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
      //       >
      //         {t(`${_.capitalize(row?.stop_fighting ? 'Yes' : 'No')}`)}
      //       </p>
      //     );
      //   },
      // },
      // {
      //   name: t('UnhandleReason'),
      //   sortable: false,
      //   minWidth: '150px',
      //   cell: (row) => {
      //     return (
      //       <p
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
      //       >
      //         {t(
      //           AppData.errorUnhandleReason.find((item) => item.value == row?.unhandle_reason)?.name
      //         )}
      //       </p>
      //     );
      //   },
      // },
      // {
      //   name: t('LetterSendVmc'),
      //   sortable: false,
      //   width: '120px',
      //   cell: (row) => {
      //     return (
      //       <p
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
      //       >
      //         {row?.letter_send_vmc}
      //       </p>
      //     );
      //   },
      // },
      // {
      //   name: t('Date'),
      //   sortable: false,
      //   width: '110px',
      //   cell: (row) => {
      //     return (
      //       <p
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
      //       >
      //         {row?.date ? Utils.formatDateTime(row?.date, 'YYYY-MM-DD') : ''}
      //       </p>
      //     );
      //   },
      // },
      // {
      //   name: t('MaterialStatus'),
      //   sortable: false,
      //   // width: '150px',
      //   cell: (row) => {
      //     return (
      //       <p
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
      //       >
      //         {row?.material_status}
      //       </p>
      //     );
      //   },
      // },
      // {
      //   name: t('HandlingPlan'),
      //   sortable: false,
      //   minWidth: '250px',
      //   cell: (row) => {
      //     return (
      //       <p
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
      //       >
      //         {row?.handling_plan}
      //       </p>
      //     );
      //   },
      // },
      // {
      //   name: t('ErrorAlert'),
      //   sortable: false,
      //   minWidth: '250px',
      //   cell: (row) => {
      //     return (
      //       <p
      //         data-tag="allowRowEvents"
      //         className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
      //       >
      //         {row?.error_alert}
      //       </p>
      //     );
      //   },
      // },

      {
        name: t('Action'),
        center: 'true',
        width: '120px',
        cell: (row) => (
          <div className="d-flex align-items-center">
            <KTTooltip text={t('Evaluate')}>
              <a
                className="btn btn-icon btn-sm btn-success btn-hover-success mr-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleEvaluateIssue(row);
                }}
              >
                <i className="fa-regular fa-pen-to-square p-0 icon-1x" />
              </a>
            </KTTooltip>
            <KTTooltip text={t('Edit')}>
              <a
                className="btn btn-icon btn-sm btn-primary btn-hover-primary "
                onClick={(e) => {
                  e.preventDefault();
                  handleEditIssue(row);
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
                  handleDeleteIssue(row);
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
  }, [current, LanguageHelper.getCurrentLanguage(), products, projects, components]);
  const [selectedIssueItem, setSelectedIssueItem] = useState(null);
  const [modalIssueEditShowing, setModalEditIssueShowing] = useState(false);
  const [modalIssueEvaluateShowing, setModalEvaluateIssueShowing] = useState(false);
  const [modalIssueUploadShowing, setModalUploadIssueShowing] = useState(false);
  const { componentDetail } = useSelector((state) => state.component);
  const { productDetail } = useSelector((state) => state.product);

  // MARK: --- Functions ---
  // Get Issue list
  async function getIssueList() {
    refLoading.current = true;
    try {
      const res = unwrapResult(await dispatch(thunkGetListIssue(filters)));
    } catch (error) {
      console.log(`${sTag} get Issue list error: ${error.message}`);
    }
    refLoading.current = false;
  }

  function handleSelectedIssuesChanged(state) {
    const selectedIssues = state.selectedRows;
    setSelectedIssues(selectedIssues);
  }

  function clearSelectedIssues() {
    setSelectedIssues([]);
    setToggledClearIssues(!toggledClearIssues);
  }

  function handleEditIssue(issue) {
    setSelectedIssueItem(issue);
    setModalEditIssueShowing(true);
  }

  function handleEvaluateIssue(issue) {
    setSelectedIssueItem(issue);
    setModalEvaluateIssueShowing(true);
  }

  function handleDeleteMultiIssues() {
    const arrIdsToDelete = selectedIssues.map((item) => item.id);
    console.log(`${sTag} handle delete multi issues: ${arrIdsToDelete}`);

    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteMultiIssue', {
        issues: JSON.stringify(arrIdsToDelete.length),
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
        const issueIds = arrIdsToDelete;
        try {
          const res = await issueApi.deleteIssue({
            issueIds: issueIds,
          });
          const { result } = res;
          if (result === 'success') {
            clearSelectedIssues();
            Global.gNeedToRefreshIssueList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersIssueList = { ...filters };
            setFilters({ ...filters });
          }
        } catch (error) {
          console.log(`${sTag} delete faq error: ${error.message}`);
        }
      }
    });
  }

  function handleSelectedIssuesChanged(state) {
    const selectedIssues = state.selectedRows;
    setSelectedIssues(selectedIssues);
  }

  function handleDeleteIssue(issue) {
    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteIssue', { name: issue?.name }),
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
          const res = await issueApi.deleteIssue({
            issueIds: [issue['id']],
          });
          const { result } = res;
          if (result == 'success') {
            Global.gNeedToRefreshIssueList = true;
            ToastHelper.showSuccess(t('Success'));
            Global.gFiltersIssueList = { ...filters };
            setFilters({ ...filters });
          }
        } catch (error) {
          console.log(`Delete Issue error: ${error?.message}`);
        }
      }
    });
  }

  function handleViewIsseDetail(row) {
    router.navigate(`/prodcare/operating/issue/detail/${row?.id}`);
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    const shouldRefreshData =
      !refLoading.current && (needToRefreshData.current || Global.gNeedToRefreshIssueList);

    if (!shouldRefreshData) return;

    const isDetailPage = router.pathname.includes('detail');
    const hasDetailId = productDetail?.id || componentDetail?.id;

    if (isDetailPage && !hasDetailId) return;

    // Refresh issue list
    getIssueList();
    Global.gNeedToRefreshIssueList = false;
  }, [filters]);

  useEffect(() => {
    const currentProjectId = JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id;

    if (!currentProjectId) return; // Ensure project ID is available

    const commonFilters = {
      ...filters,
      projectId: currentProjectId,
    };

    if (router.pathname.includes('detail')) {
      if (productDetail?.id || componentDetail?.id) {
        const detailFilters = {
          ...commonFilters,
          productId: productDetail?.id,
          componentId: componentDetail?.id,
        };

        setFilters(detailFilters);
        Global.gFiltersIssueList = detailFilters;
        Global.gNeedToRefreshIssueList = true;
      }
    } else {
      setFilters(commonFilters);
      Global.gFiltersIssueList = commonFilters;
      Global.gNeedToRefreshIssueList = true;
    }
  }, [currentProject, productDetail, componentDetail]);

  return (
    <div>
      <div className="card-title ">
        <h1 className="card-label">{`${t('IssueList')} ${
          pagination?.total ? `(${pagination?.total})` : ''
        }`}</h1>
      </div>

      <div className="card card-custom border">
        {/* card header */}
        <div className="card-header border-0 pt-6 pb-6">
          {/* header toolbar */}
          <div className="d-flex flex-wrap gap-2">
            {/* <KeenSearchBarNoFormik
              name="searchQuery"
              className="my-2"
              placeholder={`${t('Search')}...`}
              value={Global.gFiltersIssueList.q}
              onSubmit={(text) => {
                needToRefreshData.current = true;
                Global.gFiltersIssueList = {
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
            /> */}
            {/* <div className="d-flex flex-wrap align-items-center">
              <label className="mr-2 mb-0" htmlFor="project">
                {_.capitalize(t('Project'))}
              </label>
              <KTFormSelect
                name="project"
                isCustom
                options={[
                  { name: 'All', value: '' },
                  ...projects.map((item) => {
                    return { name: item.project_name, value: item.id };
                  }),
                ]}
                value={Global.gFiltersIssueList.projectId}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersIssueList = {
                    ...filters,
                    page: 0,
                    projectId: newValue,
                  };
                  setFilters({
                    ...Global.gFiltersIssueList,
                  });
                }}
              />
            </div> */}
            {!!productId || !!componentId ? null : (
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
                  value={Global.gFiltersIssueList.customerId}
                  onChange={(newValue) => {
                    needToRefreshData.current = true;
                    Global.gFiltersIssueList = {
                      ...filters,
                      page: 0,
                      customerId: newValue,
                    };
                    setFilters({
                      ...Global.gFiltersIssueList,
                    });
                  }}
                />
              </div>
            )}
            {!!productId || !!componentId ? null : (
              <div className="d-flex flex-wrap align-items-center">
                <label className="mr-2 mb-0" htmlFor="product">
                  {_.capitalize(t('Equipment'))}
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
                  value={Global.gFiltersIssueList.productId?.toString()}
                  onChange={(newValue) => {
                    needToRefreshData.current = true;
                    Global.gFiltersIssueList = {
                      ...filters,
                      page: 0,
                      productId: newValue,
                    };
                    setFilters({
                      ...Global.gFiltersIssueList,
                    });
                  }}
                />
              </div>
            )}
            <div className="d-flex flex-wrap align-items-center">
              <label className="mr-2 mb-0" htmlFor="status">
                {_.capitalize(t('ErrorStatus'))}
              </label>
              <KTFormSelect
                name="status"
                isCustom
                options={[
                  { name: 'All', value: '' },
                  ...AppData.errorStatus.map((item) => {
                    return { name: item.name, value: item.value };
                  }),
                ]}
                value={Global.gFiltersIssueList.status}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersIssueList = {
                    ...filters,
                    page: 0,
                    status: newValue,
                  };
                  setFilters({
                    ...Global.gFiltersIssueList,
                  });
                }}
              />
            </div>
            <div className="d-flex flex-wrap align-items-center">
              <label className="mr-2 mb-0" htmlFor="status">
                {_.capitalize(t('ErrorType'))}
              </label>
              <KTFormSelect
                name="errorType"
                isCustom
                options={[
                  { name: 'All', value: '' },
                  ...AppData.responsibleType.map((item) => {
                    return { name: item.name, value: item.value };
                  }),
                ]}
                value={Global.gFiltersIssueList.responsibleType}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersIssueList = {
                    ...filters,
                    page: 0,
                    responsibleType: newValue,
                  };
                  setFilters({
                    ...Global.gFiltersIssueList,
                  });
                }}
              />
            </div>
            <div className="d-flex flex-wrap align-items-center">
              <label className="mr-2 mb-0" htmlFor="status">
                {_.capitalize(t('ErrorLevel'))}
              </label>
              <KTFormSelect
                name="level"
                isCustom
                options={[
                  { name: 'All', value: '' },
                  ...AppData.errorLevel.map((item) => {
                    return { name: item.name, value: item.value };
                  }),
                ]}
                value={Global.gFiltersIssueList.level}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersIssueList = {
                    ...filters,
                    page: 0,
                    level: newValue,
                  };
                  setFilters({
                    ...Global.gFiltersIssueList,
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
                  selectedIssues.length === 0 ? 'd-none' : 'd-flex'
                } btn btn-light-danger font-weight-bold align-items-center mr-2`}
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteMultiIssues();
                }}
              >
                <i className="far fa-ban"></i>
                {`${t('Delete')} (${selectedIssues.length})`}
              </a>
              {/* <button
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalUploadIssueShowing(true);
                }}
                className="btn btn-success font-weight-bold d-flex align-items-center"
              >
                <i className="fa-regular fa-file-arrow-up"></i>
                {t('Upload')}
              </button> */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalEditIssueShowing(true);
                }}
                className="btn btn-primary font-weight-bold d-flex align-items-center"
              >
                <i className="far fa-plus"></i>
                {t('NewIssue')}
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
            data={issues}
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
            progressPending={isGettingIssueList}
            progressComponent={<Loading showBackground={false} message={`${t('Loading')}...`} />}
            onSelectedRowsChange={handleSelectedIssuesChanged}
            clearSelectedRows={toggledClearIssues}
            onRowClicked={(row) => {
              // handleEditIssue(row);
              // router.navigate(`detail/${row?.id}`);
              handleViewIsseDetail(row);
            }}
            pointerOnHover
            highlightOnHover
            selectableRowsHighlight
          />

          {/* Pagination */}
          {pagination && issues?.length > 0 && (
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
                  Global.gFiltersIssueList = { ...filters, page: iNewPage };
                  setFilters({
                    ...filters,
                    page: iNewPage,
                  });
                }}
                onChangeRowsPerPage={(newPerPage) => {
                  const iNewPerPage = parseInt(newPerPage);
                  dispatch(setPaginationPerPage(iNewPerPage));
                  needToRefreshData.current = true;
                  Global.gFiltersIssueList = {
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

      <ModalEditIssue
        productId={productId}
        components={components}
        customers={customers}
        projects={projects}
        products={products}
        show={modalIssueEditShowing}
        onClose={() => {
          setModalEditIssueShowing(false);
        }}
        onExistDone={() => {
          setSelectedIssueItem(null);
        }}
        issueItem={selectedIssueItem}
        onRefreshIssueList={() => {
          setSelectedIssueItem(null);
          getIssueList();
        }}
      />

      <ModalEvaluateIssue
        show={modalIssueEvaluateShowing}
        onClose={() => {
          setModalEvaluateIssueShowing(false);
        }}
        onExistDone={() => {
          setSelectedIssueItem(null);
        }}
        issueItem={selectedIssueItem}
      />

      <ModalUploadIssueFile
        show={modalIssueUploadShowing}
        onClose={() => {
          setModalUploadIssueShowing(false);
        }}
        onExistDone={() => {
          dispatch(
            thunkGetAllProduct({
              projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
            })
          );
          dispatch(
            thunkGetAllComponent({
              projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
            })
          );
          dispatch(
            thunkGetAllCustomer({
              projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
            })
          );
        }}
      />
    </div>
  );
}

export default IssueHomePage;
