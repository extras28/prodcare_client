import useRouter from 'hooks/useRouter';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AppData from 'shared/constants/AppData';
import Utils from 'shared/utils/Utils';
import IssueActivityTab from '../../components/IssueActivityTab';
import ModalEditIssue from '../../components/ModalEditIssue';
import { thunkGetIssueDetail } from '../../issueSlice';

IssueDetailScreen.propTypes = {};

function IssueDetailScreen(props) {
  // MARK: --- Params ---
  const { components, customers, products } = useSelector((state) => state?.app);
  const router = useRouter();
  const { issueDetail } = useSelector((state) => state?.issue);
  const { current } = useSelector((state) => state?.auth);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [modalIssueEditShowing, setModalEditIssueShowing] = useState(false);
  const { reasons } = useSelector((state) => state?.app);

  const rows = useMemo(() => {
    return [
      { label: t('Status'), value: t(_.capitalize(issueDetail?.status)) ?? '' },
      {
        label: t('Customer'),
        value: issueDetail?.customer?.name
          ? `${issueDetail?.customer?.military_region} - ${issueDetail?.customer?.name}`
          : '',
      },
      {
        label: t('Equipment'),
        value: `${issueDetail?.product?.name} ${
          issueDetail?.product?.serial ? '(' + issueDetail?.product?.serial + ')' : ''
        }`,
      },
      {
        label: t('Component'),
        value: issueDetail?.component?.name ?? '',
      },
      {
        label: t('DescriptionByCustomer'),
        value: issueDetail?.description ?? '',
      },
      {
        label: t('ErrorType'),
        value: issueDetail?.responsible_type
          ? t(
              AppData.responsibleType.find((item) => item.value === issueDetail?.responsible_type)
                ?.name
            )
          : '',
      },
      {
        label: t('ErrorLevel'),
        value: issueDetail?.level
          ? t(
              _.capitalize(
                AppData.errorLevel.find((item) => item.value === issueDetail?.level)?.name
              )
            )
          : '',
      },
      {
        label: t('ReceptionTime'),
        value: issueDetail?.reception_time
          ? Utils.formatDateTime(issueDetail?.reception_time, 'YYYY-MM-DD')
          : '',
      },
      {
        label: t('Note'),
        value: issueDetail?.note ?? '',
      },
      {
        label: t('ResponsibleTypeDescription'),
        value: issueDetail?.responsible_type_description ?? '',
      },
      {
        label: t('ReasonCausingError'),
        value: issueDetail?.reason ?? '',
      },
      {
        label: t('UnHandleReasonDescription'),
        value: issueDetail?.unhandle_reason_description ?? '',
      },
      {
        label: t('ErrorEquipmentCount'),
        value: issueDetail?.product_count ?? '',
      },
      {
        label: t('Cost'),
        value: issueDetail?.price ?? '',
      },
      {
        label: t('UnitPrice'),
        value: issueDetail?.unit_price ?? '',
      },
      {
        label: t('HandlingMeasures'),
        value:
          t(
            AppData.handlingMeasures.find((item) => item.value === issueDetail?.handling_measures)
              ?.name
          ) ?? '',
      },
      {
        label: t('RepairPart'),
        value: issueDetail?.repair_part ?? '',
      },
      {
        label: t('Amount'),
        value: issueDetail?.repair_part_count ?? '',
      },
      {
        label: t('UnitCount'),
        value: issueDetail?.unit ?? '',
      },
      {
        label: t('ProductStatus'),
        value:
          t(
            AppData.productStatus.find((item) => item.value === issueDetail?.product_status)?.name
          ) ?? '',
      },
      {
        label: t('ExpDate'),
        value: issueDetail?.exp_date
          ? Utils.formatDateTime(issueDetail?.exp_date, 'YYYY-MM-DD')
          : '',
      },
      {
        label: t('CompletionTime'),
        value: issueDetail?.completion_time
          ? Utils.formatDateTime(issueDetail?.completion_time, 'YYYY-MM-DD')
          : '',
      },
      {
        label: t('HandlingTime'),
        value: issueDetail?.handling_time ? Utils.formatNumber(issueDetail?.handling_time) : '',
      },
      {
        label: t('ResponsibleHandlingUnit'),
        value: issueDetail?.responsible_handling_unit ?? '',
      },
      {
        label: t('ReportingPerson'),
        value: issueDetail?.reporting_person ?? '',
      },
      {
        label: t('WarrantyStatus'),
        value: issueDetail?.warranty_status
          ? t(
              [
                { name: 'UnderWarranty', value: 'UNDER' },
                { name: 'OutOfWarranty', value: 'OVER' },
              ].find((item) => item.value === issueDetail?.['warranty_status'])?.name
            )
          : '',
      },
      {
        label: t('SSCDImpact'),
        value: issueDetail?.impact
          ? t(
              [
                { name: 'Restriction', value: 'RESTRICTION' },
                { name: 'Yes', value: 'YES' },
                { name: 'No', value: 'No' },
              ].find((item) => item.value === issueDetail?.['impact'])?.name
            )
          : '',
      },
      {
        label: t('StopFighting'),
        value: issueDetail?.stop_fighting
          ? t(
              [
                { name: 'Yes', value: true },
                { name: 'No', value: false },
              ].find((item) => item.value === issueDetail?.['stop_fighting'])?.name
            )
          : '',
      },
      {
        label: t('StopFightingDays'),
        value: issueDetail?.stop_fighting_days ?? '',
      },
      {
        label: t('UnhandleReason'),
        value: issueDetail?.warranty_status
          ? t(
              AppData.errorUnhandleReason.find(
                (item) => item.value === issueDetail?.['unhandle_reason']
              )?.name
            )
          : '',
      },
      {
        label: t('MaterialStatus'),
        value: issueDetail?.material_status ?? '',
      },
      {
        label: t('HandlingPlan'),
        value: issueDetail?.handling_plan ?? '',
      },
      {
        label: t('ScopeOfImpact'),
        value: issueDetail?.scope_of_impact
          ? t(
              AppData.scopeOfImpacts.find((item) => item.value == issueDetail?.['scope_of_impact'])
                ?.name
            )
          : '',
      },
      {
        label: t('ImpactPoint'),
        value: issueDetail?.impact_point
          ? t(
              AppData.impactPoints.find((item) => item.value == issueDetail?.['impact_point'])?.name
            )
          : '',
      },
      {
        label: t('UrgencyLevel'),
        value: issueDetail?.urgency_level
          ? t(
              AppData.urgencyLevels.find((item) => item.value == issueDetail?.['urgency_level'])
                ?.name
            )
          : '',
      },
      {
        label: t('UrgencyPoint'),
        value: issueDetail?.urgency_point
          ? t(
              AppData.urgencyPoints.find((item) => item.value == issueDetail?.['urgency_point'])
                ?.name
            )
          : '',
      },
      {
        label: t('ProductStatus'),
        value: issueDetail?.product_status
          ? t(
              AppData.productStatus.find((item) => item.value == issueDetail?.['product_status'])
                ?.name
            )
          : '',
      },
    ];
  }, [issueDetail]);

  useEffect(() => {
    dispatch(thunkGetIssueDetail({ issueId: router.query.issueId }));
  }, []);

  return (
    <div>
      <div className="row">
        {/* product detail */}
        <div className="col-4">
          <div className="bg-white rounded px-4 mb-4">
            {rows?.map((item, index) => (
              <div
                key={index}
                className={`${
                  current?.role !== 'USER' &&
                  current?.role !== 'ADMIN' &&
                  index === rows?.length - 1
                    ? ''
                    : 'border-bottom'
                } py-2`}
              >
                <p className="font-weight-bolder mb-1">{item?.label}</p>
                <p className={`m-0`}>{item?.value || <>&nbsp;</>}</p>
              </div>
            ))}
            {current?.role === 'USER' || current?.role === 'ADMIN' ? (
              <button
                type="button"
                className="btn btn-outline-secondary my-2 w-100"
                onClick={(e) => {
                  e.preventDefault();
                  setModalEditIssueShowing(true);
                }}
              >
                {t('Edit')}
              </button>
            ) : null}
          </div>
        </div>

        <div className="col-8">
          <div className="bg-white rounded">
            <div className="p-4">
              <IssueActivityTab />
            </div>
          </div>
        </div>
      </div>

      <ModalEditIssue
        components={components}
        customers={customers}
        products={products}
        show={modalIssueEditShowing}
        onClose={() => {
          setModalEditIssueShowing(false);
        }}
        onExistDone={() => {
          dispatch(thunkGetIssueDetail({ issueId: router.query.issueId }));
        }}
        issueItem={issueDetail}
        reasons={reasons}
      />
    </div>
  );
}

export default IssueDetailScreen;
