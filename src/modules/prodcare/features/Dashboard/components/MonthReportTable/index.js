import { unwrapResult } from '@reduxjs/toolkit';
import { Table } from 'antd';
import Column from 'antd/es/table/Column';
import ColumnGroup from 'antd/es/table/ColumnGroup';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KTFormInput, {
  KTFormInputBTDPickerType,
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import Global from 'shared/utils/Global';
import { thunkGetMonthReport } from '../../dashboardSlice';
import Utils from 'shared/utils/Utils';

MonthReportTable.propTypes = {};

function MonthReportTable(props) {
  // MARK: --- Params ---
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    ...Global.gFiltersStatisticByMonth,
    month: moment().format('YYYY-MM'),
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
  });
  const { month, isGettingMonthReport } = useSelector((state) => state?.dashboard);
  const { currentProject } = useSelector((state) => state?.app);
  const dispatch = useDispatch();

  const data = useMemo(() => {
    return [
      {
        product: month?.project?.project_name,
        customerCount: month?.project?.customerCount,
        receptionIssues: month?.issueCount?.receptionIssues,
        processedIssues: month?.issueCount?.processedIssues,
        notReadyFightingIssues: month?.issueCount?.notReadyFightingIssues,
        remainCount: month?.remain?.count,
        remainHandleInMonth: month?.remain?.handleInMonth,
        remainTotalProcessedIssue: month?.remain?.totalProcessedIssue,
        cummulativeIssues: month?.cummulative?.cummulativeIssues,

        processedIssuesCount: month?.cummulative?.processedIssuesCount,
        impactReadyFightingIssue: month?.cummulative?.impactReadyFightingIssue,
        stopFightingIssues: month?.cummulative?.stopFightingIssues,
        totalHandledInMonth: month?.totalHandledInMonth,
        notReadyFightingWarrantyTime: Utils.formatNumber(
          month?.warranty?.notReadyFightingWarrantyTime
        ),
        allErrorWarrantyTime: Utils.formatNumber(month?.warranty?.allErrorWarrantyTime),
        kcd: `${month?.warranty?.kcd}%`,
        kkt: `${month?.warranty?.kkt}%`,
        notReadyFightingError: Utils.formatNumber(month?.averageTimeError?.notReadyFightingError),
        allError: month?.averageTimeError?.allError
          ? Utils.formatNumber(month?.averageTimeError?.allError)
          : 0,
        handlingRate: month?.warranty?.handlingRate,
      },
    ];
  }, [month]);

  // MARK: --- Functions ---
  async function getStatisticByMonth() {
    try {
      const res = unwrapResult(await dispatch(thunkGetMonthReport(filters)));
    } catch (error) {
      console.error(error);
    }
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    if (Global.gNeedToRefreshStatisticByMonth) {
      getStatisticByMonth();
      Global.gNeedToRefreshStatisticByMonth = false;
    }
  }, [filters]);

  useEffect(() => {
    const currentProjectId = JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id;

    if (!currentProjectId) return; // Ensure project ID exists

    const baseFilters = {
      ...filters,
      projectId: currentProjectId,
    };

    setFilters(baseFilters);
    Global.gFiltersStatisticByMonth = baseFilters;

    Global.gNeedToRefreshStatisticByMonth = true;
  }, [currentProject]);

  return (
    <div>
      <div className="m-4" style={{ width: 'fit-content' }}>
        <KTFormInput
          name="report_month"
          value={filters.month.toString()}
          onChange={(value) => {
            const isValidMonth = moment(value, 'YYYY-MM', true).isValid();
            if (isValidMonth) {
              setFilters({
                projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
                month: value,
              });
              Global.gFiltersStatisticByMonth = {
                projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
                month: value,
              };
              Global.gNeedToRefreshStatisticByMonth = true;
            } else {
              console.error('Invalid month format');
            }
          }}
          placeholder={`${_.capitalize(t('Month'))}...`}
          type={KTFormInputType.btdPicker}
          btdPickerType={KTFormInputBTDPickerType.month}
        />
      </div>
      <div className="p-4">
        <div className="overflow-auto">
          <Table loading={isGettingMonthReport} dataSource={data} pagination={false} bordered>
            <Column title={t('Product')} dataIndex="product" key="product" />
            <Column
              title={t('CurrentOperatingQuantity')}
              dataIndex="customerCount"
              key="customerCount"
            />
            <ColumnGroup title={t('MonthlyError')}>
              <Column title={t('Reception')} dataIndex="receptionIssues" key="receptionIssues" />
              <Column title={t('Handled')} dataIndex="processedIssues" key="processedIssues" />
              <Column
                title={t('NotReadyFightingError')}
                dataIndex="notReadyFightingIssues"
                key="notReadyFightingIssues"
              />
            </ColumnGroup>
            <ColumnGroup title={t('Remain')}>
              <Column title={t('RemainCount')} dataIndex="remainCount" key="remainCount" />
              <Column
                title={t('MonthlyHandled')}
                dataIndex="remainHandleInMonth"
                key="remainHandleInMonth"
              />
              <Column
                title={t('TotalErrorsHandled')}
                dataIndex="remainTotalProcessedIssue"
                key="remainTotalProcessedIssue"
              />
            </ColumnGroup>
            <ColumnGroup title={t('Cummulative')}>
              <Column
                title={t('CumulativeRemain')}
                dataIndex="cummulativeIssues"
                key="cummulativeIssues"
              />
              <Column
                title={t('Handled')}
                dataIndex="processedIssuesCount"
                key="processedIssuesCount"
              />
              <Column
                title={t('ImpactOnReadyFightingError')}
                dataIndex="impactReadyFightingIssue"
                key="impactReadyFightingIssue"
              />
              <Column
                title={t('StopFightingError')}
                dataIndex="stopFightingIssues"
                key="stopFightingIssues"
              />
            </ColumnGroup>
            <Column
              title={t('TotalHandledThisMonth')}
              dataIndex="totalHandledInMonth"
              key="totalHandledInMonth"
            />
            <ColumnGroup title={t('MonthlyKPIEvaluation')}>
              <ColumnGroup title={t('AverageWarrantyTime')}>
                <Column
                  title={t('NotReadyFightingError')}
                  dataIndex="notReadyFightingWarrantyTime"
                  key="notReadyFightingWarrantyTime"
                />
                <Column
                  title={t('AllError')}
                  dataIndex="allErrorWarrantyTime"
                  key="allErrorWarrantyTime"
                />
              </ColumnGroup>
              <ColumnGroup title={t('NotReadyFightingError')}>
                <Column title={t('Kcd')} dataIndex="kcd" key="kcd" />
                <Column title={t('Kkt')} dataIndex="kkt" key="kkt" />
              </ColumnGroup>
            </ColumnGroup>
            <ColumnGroup title={t('AverageFailureOccurrenceTime')}>
              <Column
                title={t('NotReadyFightingError')}
                dataIndex="notReadyFightingError"
                key="notReadyFightingError"
              />
              <Column title={t('AllError')} dataIndex="allError" key="allError" />
            </ColumnGroup>
            <Column
              title={t('ErrorHandlingRateWithinKPI')}
              dataIndex="handlingRate"
              key="handlingRate"
            />
          </Table>
        </div>
      </div>
    </div>
  );
}

export default MonthReportTable;
