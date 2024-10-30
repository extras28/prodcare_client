import { unwrapResult } from '@reduxjs/toolkit';
import { Table } from 'antd';
import Column from 'antd/es/table/Column';
import ColumnGroup from 'antd/es/table/ColumnGroup';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KTFormInput, {
  KTFormInputBTDPickerType,
  KTFormInputGroupType,
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import Global from 'shared/utils/Global';
import { thunkGetQuarterReport } from '../../dashboardSlice';
import Utils from 'shared/utils/Utils';
import KTFormSelect from 'shared/components/OtherKeenComponents/Forms/KTFormSelect';
import AppData from 'shared/constants/AppData';

QuarterReportTable.propTypes = {};

function QuarterReportTable(props) {
  // MARK: --- Params ---
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    ...Global.gFiltersStatisticByQuarter,
    year: moment().format('YYYY'),
    quarter: moment().quarter().toString(),
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
  });
  const { quarter, isGettingQuarterReport } = useSelector((state) => state?.dashboard);
  const { currentProject } = useSelector((state) => state?.app);
  const dispatch = useDispatch();

  const data = useMemo(() => {
    return [
      {
        product: quarter?.project?.project_name,
        customerCount: quarter?.project?.customerCount,
        receptionIssues: quarter?.issueCount?.receptionIssues,
        processedIssues: quarter?.issueCount?.processedIssues,
        notReadyFightingIssues: quarter?.issueCount?.notReadyFightingIssues,
        remainCount: quarter?.remain?.count,
        remainHandleInQuarter: quarter?.remain?.handleInQuarter,
        remainTotalProcessedIssue: quarter?.remain?.totalProcessedIssue,
        cummulativeIssues: quarter?.cummulative?.cummulativeIssues,
        criticalIssue: quarter?.issueCount?.criticalIssue,
        stopFightingIssue: quarter?.issueCount?.stopFightingIssue,
        moderateIssue: quarter?.issueCount?.moderateIssue,
        minorIssue: quarter?.issueCount?.minorIssue,
        stopFightingTime: quarter?.issueCount?.stopFightingTime,

        processedIssuesCount: quarter?.cummulative?.processedIssuesCount,
        impactReadyFightingIssue: quarter?.cummulative?.impactReadyFightingIssue,
        criticalIssueRemain: quarter?.remainIssue?.criticalIssue,
        moderateIssueRemain: quarter?.remainIssue?.moderateIssue,
        minorIssueRemain: quarter?.remainIssue?.minorIssue,
        totalHandledInQuarter: quarter?.totalHandledInQuarter,
        notReadyFightingWarrantyTime: Utils.formatNumber(
          quarter?.warranty?.notReadyFightingWarrantyTime
        ),
        allErrorWarrantyTime: Utils.formatNumber(quarter?.warranty?.allErrorWarrantyTime),
        kcd: `${quarter?.warranty?.kcd}%`,
        kkt: `${quarter?.warranty?.kkt}%`,
        notReadyFightingError: Utils.formatNumber(quarter?.averageTimeError?.notReadyFightingError),
        allError: quarter?.averageTimeError?.allError
          ? Utils.formatNumber(quarter?.averageTimeError?.allError)
          : 0,
        handlingRate: quarter?.warranty?.handlingRate,
      },
    ];
  }, [quarter]);

  // MARK: --- Functions ---
  async function getStatisticByQuarter() {
    try {
      const res = unwrapResult(await dispatch(thunkGetQuarterReport(filters)));
    } catch (error) {
      console.error(error);
    }
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    if (Global.gNeedToRefreshStatisticByQuarter) {
      getStatisticByQuarter();
      Global.gNeedToRefreshStatisticByQuarter = false;
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
    Global.gFiltersStatisticByQuarter = baseFilters;

    Global.gNeedToRefreshStatisticByQuarter = true;
  }, [currentProject]);

  return (
    <div>
      <div className="m-4 d-flex flex-wrap gap-4" style={{ width: 'fit-content' }}>
        <KTFormInput
          name="report_year"
          value={filters.year.toString()}
          onChange={(value) => {
            const isValidYear = moment(value, 'YYYY', true).isValid();

            if (isValidYear) {
              setFilters({
                ...filters,
                projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
                year: value,
              });
              Global.gFiltersStatisticByQuarter = {
                ...filters,
                projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
                year: value,
              };
              Global.gNeedToRefreshStatisticByQuarter = true;
            } else {
              console.error("Invalid year format. Please enter a year in the 'YYYY' format.");
            }
          }}
          placeholder={`${_.capitalize(t('Year'))}...`}
          type={KTFormInputType.btdPicker}
          btdPickerType={KTFormInputBTDPickerType.year}
          inputGroupType={KTFormInputGroupType.button}
        />
        <KTFormSelect
          name="quarter"
          isCustom
          options={[
            ...AppData.quarters.map((item) => {
              return {
                name: `${t('Quarter')} ${item.name}`,
                value: item.value,
              };
            }),
          ]}
          value={filters.quarter}
          onChange={(newValue) => {
            Global.gNeedToRefreshStatisticByQuarter = true;

            Global.gFiltersStatisticByQuarter = {
              ...filters,
              quarter: newValue,
            };
            setFilters({
              ...Global.gFiltersStatisticByQuarter,
            });
          }}
        />
      </div>
      <div className="p-4">
        <div className="overflow-auto">
          <Table loading={isGettingQuarterReport} dataSource={data} pagination={false} bordered>
            <Column title={t('Product')} dataIndex="product" key="product" />
            <Column
              title={t('CurrentOperatingQuantity')}
              dataIndex="customerCount"
              key="customerCount"
            />
            <ColumnGroup title={t('QuarterlyError')}>
              <Column title={t('Reception')} dataIndex="receptionIssues" key="receptionIssues" />
              <Column title={t('Handled')} dataIndex="processedIssues" key="processedIssues" />
              <Column
                title={t('NotReadyFightingError')}
                dataIndex="notReadyFightingIssues"
                key="notReadyFightingIssues"
              />
              <Column title={t('CriticalError')} dataIndex="criticalIssue" key="criticalIssue" />
              <Column
                title={t('StopFightingError')}
                dataIndex="stopFightingIssue"
                key="stopFightingIssue"
              />
              <Column
                title={t('StopFightingTime')}
                dataIndex="stopFightingTime"
                key="stopFightingTime"
              />
              <Column title={t('ModerateError')} dataIndex="moderateIssue" key="moderateIssue" />
              <Column title={t('MinorError')} dataIndex="minorIssue" key="minorIssue" />
            </ColumnGroup>
            <ColumnGroup title={t('Remain')}>
              <Column title={t('RemainCount')} dataIndex="remainCount" key="remainCount" />
              <Column
                title={t('CriticalError')}
                dataIndex="criticalIssueRemain"
                key="criticalIssueRemain"
              />
              <Column
                title={t('ModerateError')}
                dataIndex="moderateIssueRemain"
                key="moderateIssueRemain"
              />
              <Column title={t('MinorError')} dataIndex="minorIssueRemain" key="minorIssueRemain" />
              <Column
                title={t('QuarterlyHandled')}
                dataIndex="remainHandleInQuarter"
                key="remainHandleInQuarter"
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
            </ColumnGroup>
            <Column
              title={t('TotalHandledThisQuarter')}
              dataIndex="totalHandledInQuarter"
              key="totalHandledInQuarter"
            />
            <ColumnGroup title={t('QuarterlyKPIEvaluation')}>
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

export default QuarterReportTable;
