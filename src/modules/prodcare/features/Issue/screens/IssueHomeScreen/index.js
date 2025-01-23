import { unwrapResult } from '@reduxjs/toolkit';
import issueApi from 'api/issueApi';
import { thunkGetAllComponent, thunkGetAllCustomer, thunkGetAllProduct } from 'app/appSlice';
import customDataTableStyle from 'assets/styles/customDataTableStyle';
import useRouter from 'hooks/useRouter';
import _ from 'lodash';
import { thunkGetComponentDetail } from 'modules/prodcare/features/Component/componentSlice';
import { thunkGetProductDetail } from 'modules/prodcare/features/Product/productSlice';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AppDateRangePicker from 'shared/components/AppDateRangePicker';
import AppSelectField from 'shared/components/AppSelectField';
import Empty from 'shared/components/Empty';
import Loading from 'shared/components/Loading';
import KeenSelectOption from 'shared/components/OtherKeenComponents/Forms/KeenSelectOption';
import KTFormSelect, {
  KTFormSelectSize,
} from 'shared/components/OtherKeenComponents/Forms/KTFormSelect';
import KeenSearchBarNoFormik from 'shared/components/OtherKeenComponents/KeenSearchBarNoFormik';
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
import ModalEvaluateIssue from '../../components/ModalEvaluateIssue';
import ModalUploadIssueFile from '../../components/ModalUploadIssueFile';
import { setPaginationPerPage, thunkGetListIssue } from '../../issueSlice';

IssueHomePage.propTypes = {};

const sTag = '[IssueHomePage]';

function IssueHomePage(props) {
  // MARK: --- Params ---
  const { productId, componentId, email, name, customerId } = props;
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    ...Global.gFiltersIssueList,
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
    productId: productId,
    componentId: componentId,
    accountId: email,
    receptionTime: moment().format('YYYY-MM-DD'),
  });
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [toggledClearIssues, setToggledClearIssues] = useState(true);
  const { issues, isGettingIssueList, pagination } = useSelector((state) => state.issue);
  const { current } = useSelector((state) => state.auth);
  const needToRefreshData = useRef(issues?.length === 0);
  const refLoading = useRef(false);
  const {
    products,
    customers,
    components,
    reasons,
    currentProject,
    projects,
    users,
    currentColumns,
  } = useSelector((state) => state?.app);

  const fullColumns = useMemo(
    () => [
      {
        id: 37,
        name: t('STT'),
        width: '60px',
        center: 'true',
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
        id: 1,
        name: t('Status'),
        center: 'true',
        sortable: false,
        width: '100px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className={`m-0 badge bg-${
                row?.status === 'PROCESSED'
                  ? 'success'
                  : row?.status === 'PROCESSING'
                  ? 'info'
                  : 'danger'
              }`}
            >
              {t(_.capitalize(row?.status))}
            </p>
          );
        },
      },
      {
        id: 2,
        name: t('Customer'),
        sortable: false,
        cell: (row) => {
          const ct = customers.find((item) => item.id === row['customer_id']);
          return (
            <p data-tag="allowRowEvents" className="font-weight-normal m-0 text-maxline-3">
              {ct ? `${ct?.['name']} - ${ct?.['military_region']}` : ''}
            </p>
          );
        },
      },
      {
        id: 3,
        name: t('Product'),
        sortable: false,
        // minWidth: '150px',
        cell: (row) => {
          const pd = products.find((item) => item.id == row?.product_id);
          return (
            <KTTooltip text={t('Product')}>
              <a
                className=""
                onClick={(e) => {
                  e.preventDefault();
                  if (row?.componentPath) {
                    router.navigate(`/prodcare/operating/component/detail/${row?.component_id}`);
                  } else {
                    router.navigate(`/prodcare/operating/product/detail/${row?.product_id}`);
                  }
                }}
              >
                {`${pd?.name} ${pd?.serial ? ' (' + pd?.serial + ')' : ''}${
                  row?.componentPath ? '/' + row?.componentPath : ''
                }`}
              </a>
            </KTTooltip>
          );
        },
      },
      {
        id: 4,
        name: t('DescriptionByCustomer'),
        sortable: false,
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
        id: 5,
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
        id: 6,
        name: t('ErrorLevel'),
        sortable: false,
        width: '130px',
        center: 'true',
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
      {
        id: 7,
        name: t('ReceptionTime'),
        sortable: false,
        width: '100px',
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
      {
        id: 8,
        name: t('StopFighting'),
        sortable: false,
        width: '100px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {t(`${_.capitalize(row?.stop_fighting ? 'Yes' : 'No')}`)}
            </p>
          );
        },
      },
      {
        id: 9,
        name: t('Handler'),
        sortable: false,
        // minWidth: '120px',
        right: true,
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {users.find((item) => item.email === row?.['account_id'])?.name}
            </div>
          );
        },
      },
      {
        id: 10,
        name: t('ScopeOfImpact'),
        sortable: false,
        minWidth: '180px',
        right: true,
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {t(
                AppData.scopeOfImpacts.find((item) => item.value === row?.['scope_of_impact'])?.name
              )}
            </div>
          );
        },
      },
      {
        id: 11,
        name: t('ImpactPoint'),
        sortable: false,
        minWidth: '150px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {t(AppData.impactPoints.find((item) => item.value === row?.['impact_point'])?.name)}
            </div>
          );
        },
      },
      {
        id: 12,
        name: t('UrgencyLevel'),
        sortable: false,
        // minWidth: '150px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {t(AppData.urgencyLevels.find((item) => item.value === row?.['urgency_level'])?.name)}
            </div>
          );
        },
      },
      {
        id: 13,
        name: t('UrgencyPoint'),
        sortable: false,
        // minWidth: '150px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {t(AppData.urgencyPoints.find((item) => item.value === row?.['urgency_point'])?.name)}
            </div>
          );
        },
      },
      {
        id: 14,
        name: t('OverdueKpiReason'),
        sortable: false,
        // minWidth: '150px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {t(
                AppData.overdueKpiReasons.find((item) => item.value === row?.['overdue_kpi_reason'])
                  ?.name
              )}
            </div>
          );
        },
      },
      {
        id: 15,
        name: t('Note'),
        sortable: false,
        // minWidth: '150px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {row?.note}
            </div>
          );
        },
      },
      {
        id: 16,
        name: t('ResponsibleTypeDescription'),
        sortable: false,
        minWidth: '150px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {row?.responsible_type_description}
            </div>
          );
        },
      },
      {
        id: 17,
        name: t('ReasonCausingError'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {row?.reason}
            </div>
          );
        },
      },
      {
        id: 18,
        name: t('UnHandleReasonDescription'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {row?.unhandle_reason_description}
            </div>
          );
        },
      },
      {
        id: 19,
        name: t('ErrorEquipmentCount'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {row?.price}
            </div>
          );
        },
      },
      {
        id: 20,
        name: t('HandlingMeasures'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {t(
                AppData.handlingMeasures.find((item) => item.value === row?.['handling_measures'])
                  ?.name
              )}
            </div>
          );
        },
      },
      {
        id: 21,
        name: t('ProductStatus'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {t(
                AppData.productStatus.find((item) => item.value === row?.['product_status'])?.name
              )}
            </div>
          );
        },
      },
      {
        id: 22,
        name: t('RepairPart'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {row?.repair_part}
            </div>
          );
        },
      },
      {
        id: 23,
        name: t('Amount'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {row?.repair_part_count}
            </div>
          );
        },
      },
      {
        id: 24,
        name: t('UnitCount'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {row?.unit}
            </div>
          );
        },
      },
      {
        id: 25,
        name: t('CompletionTime'),
        sortable: false,
        minWidth: '150px',
        cell: (row) => {
          return (
            <div
              data-tag="allowRowEvents"
              className="text-dark-75 m-0 text-maxline-5 d-flex align-items-center"
            >
              {row?.completion_time ? Utils.formatDateTime(row?.completion_time, 'YYYY-MM-DD') : ''}
            </div>
          );
        },
      },
      {
        id: 26,
        name: t('HandlingTime'),
        sortable: false,
        // minWidth: '120px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {row?.handling_time}
            </p>
          );
        },
      },
      {
        id: 27,
        name: t('ResponsibleHandlingUnit'),
        sortable: false,
        minWidth: '150px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {row?.responsible_handling_unit}
            </p>
          );
        },
      },
      {
        id: 28,
        name: t('ReportingPerson'),
        sortable: false,
        width: '120px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {row?.reporting_person ?? ''}
            </p>
          );
        },
      },
      {
        id: 29,
        name: t('RemainStatus'),
        sortable: false,
        width: '110px',
        cell: (row) => {
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {AppData.errorRemainStatus.find((item) => item.value === row?.['remain_status'])}
            </p>
          );
        },
      },
      {
        name: t('OverdueKpi'),
        sortable: false,
        // width: '150px',
        cell: (row) => {
          const data = [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ];
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {t(data.find((item) => item.value === row?.['overdue_kpi'])?.name)}
            </p>
          );
        },
      },
      {
        id: 30,
        name: t('WarrantyStatus'),
        sortable: false,

        cell: (row) => {
          const data = [
            { name: 'UnderWarranty', value: 'UNDER' },
            { name: 'OutOfWarranty', value: 'OVER' },
          ];
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {t(data.find((item) => item.value === row?.['warranty_status'])?.name)}
            </p>
          );
        },
      },
      {
        id: 31,
        name: t('SSCDImpact'),
        sortable: false,

        cell: (row) => {
          const data = [
            { name: 'Restriction', value: 'RESTRICTION' },
            { name: 'Yes', value: 'YES' },
            { name: 'No', value: 'No' },
          ];
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {t(data.find((item) => item.value === row?.['impact'])?.name)}
            </p>
          );
        },
      },
      {
        id: 32,
        name: t('StopFightingDays'),
        sortable: false,

        cell: (row) => {
          const data = [
            { name: 'Restriction', value: 'RESTRICTION' },
            { name: 'Yes', value: 'YES' },
            { name: 'No', value: 'No' },
          ];
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {row?.stop_fighting_days}
            </p>
          );
        },
      },
      {
        id: 33,
        name: t('UnhandleReason'),
        sortable: false,

        cell: (row) => {
          const data = [
            { name: 'Restriction', value: 'RESTRICTION' },
            { name: 'Yes', value: 'YES' },
            { name: 'No', value: 'No' },
          ];
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {t(
                AppData.errorUnhandleReason.find((item) => item.value === row?.['unhandle_reason'])
                  ?.name
              )}
            </p>
          );
        },
      },
      {
        id: 34,
        name: t('MaterialStatus'),
        sortable: false,

        cell: (row) => {
          const data = [
            { name: 'Restriction', value: 'RESTRICTION' },
            { name: 'Yes', value: 'YES' },
            { name: 'No', value: 'No' },
          ];
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {row?.material_status}
            </p>
          );
        },
      },
      {
        id: 35,
        name: t('HandlingPlan'),
        sortable: false,
        cell: (row) => {
          const data = [
            { name: 'Restriction', value: 'RESTRICTION' },
            { name: 'Yes', value: 'YES' },
            { name: 'No', value: 'No' },
          ];
          return (
            <p
              data-tag="allowRowEvents"
              className="text-dark-75 font-weight-normal m-0 text-maxline-5 mr-4"
            >
              {row?.handling_plan}
            </p>
          );
        },
      },
      {
        id: 36,
        name: t('Action'),
        center: 'true',
        width: '120px',
        cell: (row) => (
          <div className="d-flex align-items-center">
            <KTTooltip text={t('Evaluate')}>
              <a
                className="btn btn-icon btn-xs btn-success btn-hover-success mr-2"
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
                className="btn btn-icon btn-xs btn-primary btn-hover-primary "
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
                className="btn btn-icon btn-xs btn-danger btn-hover-danger ml-2"
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
    ],
    [
      current,
      LanguageHelper.getCurrentLanguage(),
      products,
      projects,
      components,
      customers,
      currentColumns,
    ]
  );

  const columns = useMemo(() => {
    const columnIds = currentColumns?.columns?.split(',')?.map((item) => Number(item));
    const tableColumns = fullColumns.filter((item) => columnIds?.includes(item?.id));

    if (current?.role === 'GUEST') return tableColumns.slice(0, tableColumns.length - 1);
    return tableColumns;
  }, [
    current,
    LanguageHelper.getCurrentLanguage(),
    products,
    projects,
    components,
    customers,
    currentColumns,
  ]);
  const [selectedIssueItem, setSelectedIssueItem] = useState(null);
  const [modalIssueEditShowing, setModalEditIssueShowing] = useState(false);
  const [modalIssueEvaluateShowing, setModalEvaluateIssueShowing] = useState(false);
  const [modalIssueUploadShowing, setModalUploadIssueShowing] = useState(false);
  const { componentDetail } = useSelector((state) => state.component);
  const { productDetail } = useSelector((state) => state.product);
  const { userDetail } = useSelector((state) => state.user);

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
            // Global.gFiltersIssueList = { ...filters };
            setFilters({ ...Global.gFiltersIssueList });
            if (router.query.productId)
              dispatch(thunkGetProductDetail({ productId: router.query.productId }));
            else if (router.query.componentId)
              dispatch(thunkGetComponentDetail({ componentId: router.query.componentId }));
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
    const hasDetailId = productDetail?.id || componentDetail?.id || userDetail?.email;

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
      if (productDetail?.id || componentDetail?.id || userDetail?.email) {
        const detailFilters = {
          ...commonFilters,
          page: 0,
          limit: 30,
          productId: productDetail?.id,
          componentId: componentDetail?.id,
          accountId: userDetail?.email,
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
    return () => {
      Global.gNeedToRefreshIssueList = false;
      Global.gFiltersIssueList = {
        page: 0,
        limit: 30,
        q: '',
        status: '',
        errorType: '',
        level: '',
        projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
      };
    };
  }, [currentProject, productDetail, componentDetail, userDetail]);

  return (
    <div>
      <div className="card-title ">
        <h1 className="card-label">{`${
          name
            ? t('DetailIssueList', { name: name })
            : t('IssueList', { name: currentProject?.project_name })
        } ${pagination?.total ? `(${pagination?.total})` : ''}`}</h1>
      </div>

      <div className="card card-custom border">
        {/* card header */}
        <div className="flex-md-row d-md-flex card-header border-0 ">
          {/* header toolbar */}
          <div className="d-flex flex-wrap gap-2">
            <KeenSearchBarNoFormik
              name="searchQuery"
              className="my-2"
              placeholder={`${t('Serial')}...`}
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
            />

            {!!productId || !!componentId ? null : (
              <div className="d-flex flex-wrap align-items-center">
                <label className="mr-2 mb-0" htmlFor="customer">
                  {_.capitalize(t('Customer'))}
                </label>
                <KeenSelectOption
                  isFilter={true}
                  emptyLabel={t('All')}
                  containerClassName="m-0 min-w-200px"
                  searchable={true}
                  fieldProps={{ value: Global.gFiltersIssueList.customerId }}
                  fieldHelpers={{ setValue: () => {} }}
                  name="customer"
                  options={[
                    { name: 'All', value: '' },
                    ...customers.map((item) => {
                      return {
                        name: `${item?.['name']} - ${item?.['military_region']}`,
                        value: item.id.toString(),
                      };
                    }),
                  ]}
                  onValueChanged={(newValue) => {
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
                  disabled={current?.role === 'GUEST'}
                />
              </div>
            )}
            {!!productId || !!componentId ? null : (
              <div className="d-flex flex-wrap align-items-center">
                <label className="mr-2 mb-0" htmlFor="product">
                  {_.capitalize(t('Product'))}
                </label>
                <KTFormSelect
                  name="product"
                  isCustom={false}
                  size={KTFormSelectSize.small}
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
                {_.capitalize(t('Status'))}
              </label>
              <KTFormSelect
                name="status"
                isCustom={false}
                size={KTFormSelectSize.small}
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
              <label className="mr-2 mb-0" htmlFor="stopFighting">
                {_.capitalize(t('StopFighting'))}
              </label>
              <KTFormSelect
                name="stopFighting"
                isCustom={false}
                size={KTFormSelectSize.small}
                options={[
                  { name: 'All', value: '' },
                  { name: 'Yes', value: 'true' },
                  { name: 'No', value: 'false' },
                ]}
                value={Global.gFiltersIssueList.stopFighting}
                onChange={(newValue) => {
                  needToRefreshData.current = true;
                  Global.gFiltersIssueList = {
                    ...filters,
                    page: 0,
                    stopFighting: newValue,
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
                isCustom={false}
                size={KTFormSelectSize.small}
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
              <label className="mr-2 mb-0" htmlFor="level">
                {_.capitalize(t('ErrorLevel'))}
              </label>
              <KTFormSelect
                name="level"
                isCustom={false}
                size={KTFormSelectSize.small}
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
            {/* <div className="d-flex flex-wrap align-items-center">
              <label className="mr-2 mb-0" htmlFor="receptionTime">
                {_.capitalize(t('ReceptionTime'))}
              </label>
              <KTFormInput
                name="receptionTime"
                value={filters?.receptionTime}
                onChange={(value) => {
                  const isValidFormat = moment(value, 'YYYY-MM-DD', true).isValid();
                  if (isValidFormat) {
                  }
                }}
                placeholder={`${_.capitalize(t('ReceptionTime'))}...`}
                type={KTFormInputType.dateRangePicker}
                drpAutoUpdateInput={true}
                drpEnableTimePicker={true}
                drpSingleDatePicker={true}
                drpEnablePredefinedRange={true}
              />
            </div> */}
            {!!email ? null : (
              <div className="d-flex flex-wrap align-items-center">
                <label className="mr-2 mb-0" htmlFor="account">
                  {_.capitalize(t('Handler'))}
                </label>
                <KTFormSelect
                  name="account"
                  isCustom={false}
                  size={KTFormSelectSize.small}
                  options={[
                    { name: 'All', value: '' },
                    ...users.map((item) => {
                      return {
                        name: item?.['name'],
                        value: item.email,
                      };
                    }),
                  ]}
                  value={Global.gFiltersIssueList.accountId}
                  onChange={(newValue) => {
                    needToRefreshData.current = true;
                    Global.gFiltersIssueList = {
                      ...filters,
                      page: 0,
                      accountId: newValue,
                    };
                    setFilters({
                      ...Global.gFiltersIssueList,
                    });
                  }}
                />
              </div>
            )}
            <div className="d-flex flex-wrap align-items-center">
              {' '}
              <label className="mr-2 mb-0" htmlFor="receptionTime">
                {_.capitalize(t('ReceptionTime'))}
              </label>
              <AppDateRangePicker
                getDateRange={(dateRange) => {
                  needToRefreshData.current = true;
                  Global.gFiltersIssueList = {
                    ...filters,
                    startTime: dateRange.startDate,
                    endTime: dateRange.endDate,
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
              <AppSelectField
                fields={fullColumns}
                defaultColumns={fullColumns.filter((item) =>
                  [1, 2, 3, 4, 5, 6, 7, 8, 36].includes(item)
                )}
              />
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setModalEditIssueShowing(true);
                }}
                className="btn btn-sm btn-primary font-weight-bold d-flex align-items-center"
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
            columns={columns}
            data={issues}
            customStyles={customDataTableStyle}
            responsive={true}
            noHeader
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
              // handleViewIsseDetail(row);
              handleEditIssue(row);
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
        componentId={componentId}
        customerId={customerId}
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
          if (router.query.productId)
            dispatch(thunkGetProductDetail({ productId: router.query.productId }));
          else if (router.query.componentId)
            dispatch(thunkGetComponentDetail({ componentId: router.query.componentId }));
        }}
        issueItem={selectedIssueItem}
        onRefreshIssueList={() => {
          setSelectedIssueItem(null);
          getIssueList();
        }}
        reasons={reasons}
        users={users}
      />

      <ModalEvaluateIssue
        productId={productId}
        show={modalIssueEvaluateShowing}
        onClose={() => {
          setModalEvaluateIssueShowing(false);
        }}
        onExistDone={() => {
          setSelectedIssueItem(null);
          if (router.query.productId)
            dispatch(thunkGetProductDetail({ productId: router.query.productId }));
          else if (router.query.componentId)
            dispatch(thunkGetComponentDetail({ componentId: router.query.componentId }));
        }}
        issueItem={selectedIssueItem}
        reasons={reasons}
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
