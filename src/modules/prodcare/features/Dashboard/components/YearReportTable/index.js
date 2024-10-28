import { unwrapResult } from '@reduxjs/toolkit';
import { Table } from 'antd';
import moment from 'moment';
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
import Utils from 'shared/utils/Utils';
import { thunkGetYearReport } from '../../dashboardSlice';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
const { Column, ColumnGroup } = Table;

YearReportTable.propTypes = {};

function YearReportTable(props) {
  // MARK: --- Params ---
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    ...Global.gFiltersStatisticByYear,
    year: moment().year(),
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
  });
  const { year, isGettingYearReport } = useSelector((state) => state?.dashboard);
  const { currentProject } = useSelector((state) => state?.app);

  const data = useMemo(() => {
    return [
      {
        product: year?.project?.project_name,
        customerCount: year?.project?.customerCount,
        receptionIssues: year?.issueCounts?.receptionIssues,
        criticalIssues: year?.issueCounts?.criticalIssues,
        stopFightingIssues: year?.issueCounts?.stopFightingIssues,
        moderateIssues: year?.issueCounts?.moderateIssues,
        minorIssues: year?.issueCounts?.minorIssues,
        impactReadyFightingIssue: year?.issueCounts?.impactReadyFightingIssue,
        processedIssuesInYear: year?.issueCounts?.processedIssuesInYear,
        receptionIssuesPercent: year?.issueCounts?.['%']
          ? Utils.formatNumber(year?.issueCounts?.['%'])
          : 0,
        remainIssues: year?.issueCounts?.remainIssues,
        cummulativeIssues: year?.cummulative?.cummulativeIssues,
        processedIssues: year?.cummulative?.processedIssues,
        processedIssuesInPrevYear: year?.cummulative?.processedIssuesInPrevYear,
        needToProcessInPrevYear: year?.cummulative?.needToProcessInPrevYear,
        cummulativeIssuesPercent: year?.cummulative?.['%']
          ? Utils.formatNumber(year?.cummulative?.['%'])
          : 0,
        remainIssues: year?.cummulative?.remainIssues,
        warrantyForImpactFightingIssue: year?.issueCounts?.warrantyForImpactFightingIssue
          ? Utils.formatNumber(year?.issueCounts?.warrantyForImpactFightingIssue)
          : 0,
        warrantyAllError: year?.issueCounts?.warrantyAllError
          ? Utils.formatNumber(year?.issueCounts?.warrantyAllError)
          : 0,
      },
    ];
  }, [year]);

  // MARK: --- Functions ---
  async function getStatisticByYear() {
    try {
      const res = unwrapResult(await dispatch(thunkGetYearReport(filters)));
    } catch (error) {
      console.error(error);
    }
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    if (Global.gNeedToRefreshStatisticByYear) {
      getStatisticByYear();
      Global.gNeedToRefreshStatisticByYear = false;
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
    Global.gFiltersStatisticByYear = baseFilters;

    Global.gNeedToRefreshStatisticByYear = true;
  }, [currentProject]);

  return (
    <div>
      <div style={{ width: 'fit-content' }} className="m-4">
        <KTFormInput
          name="report_year"
          value={filters.year.toString()}
          onChange={(value) => {
            setFilters({
              projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
              year: value,
            });
            Global.gFiltersStatisticByYear = {
              projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
              year: value,
            };
            Global.gNeedToRefreshStatisticByYear = true;
          }}
          placeholder={`${_.capitalize(t('Year'))}...`}
          type={KTFormInputType.btdPicker}
          btdPickerType={KTFormInputBTDPickerType.year}
          inputGroupType={KTFormInputGroupType.button}
        />
      </div>
      <div className="p-4">
        <div className="overflow-auto">
          <Table loading={isGettingYearReport} dataSource={data} pagination={false} bordered>
            <Column title={t('Product')} dataIndex="product" key="product" />
            <Column
              title={t('CurrentOperatingQuantity')}
              dataIndex="customerCount"
              key="customerCount"
            />
            <ColumnGroup title={t('IncidentalError')}>
              <Column
                title={t('RecevedInYear')}
                dataIndex="receptionIssues"
                key="receptionIssues"
              />
              <Column title={t('CriticalError')} dataIndex="criticalIssues" key="criticalIssues" />
              <Column
                title={t('StopFightingError')}
                dataIndex="stopFightingIssues"
                key="stopFightingIssues"
              />
              <Column title={t('ModerateError')} dataIndex="moderateIssues" key="moderateIssues" />
              <Column title={t('MinorError')} dataIndex="minorIssues" key="minorIssues" />
              <Column
                title={t('NotReadyForFightingError')}
                dataIndex="impactReadyFightingIssue"
                key="impactReadyFightingIssue"
              />
              <Column
                title={t('ErrorsProcessedDuringTheYear')}
                dataIndex="processedIssuesInYear"
                key="processedIssuesInYear"
              />
              <Column
                title={t('%')}
                dataIndex="receptionIssuesPercent"
                key="receptionIssuesPercent"
              />
              <Column
                title={t('UnprocessedErrorsForNextYear')}
                dataIndex="remainIssues"
                key="remainIssues"
              />
            </ColumnGroup>
            <ColumnGroup
              title={t('CummulativeErrorsUpToTheEndOfYear', { year: filters?.year - 1 })}
            >
              <Column
                title={t('CummulativeErrorsReceivedUpToTheEndOfYear', { year: filters?.year - 1 })}
                dataIndex="cummulativeIssues"
                key="cummulativeIssues"
              />
              <Column
                title={t('TheTotalNumberOfErrorsProcessedByTheEndOfYear', {
                  year: filters?.year - 1,
                })}
                dataIndex="processedIssues"
                key="processedIssues"
              />
              <Column
                title={t('TheTotalErrorsProcessedInTheYear')}
                dataIndex="processedIssuesInPrevYear"
                key="processedIssuesInPrevYear"
              />
              <Column
                title={t('TheTotalErrorsToBeProcessedInTheYear')}
                dataIndex="needToProcessInPrevYear"
                key="needToProcessInPrevYear"
              />
              <Column
                title={t('%')}
                dataIndex="cummulativeIssuesPercent"
                key="cummulativeIssuesPercent"
              />
              <Column
                title={t('IssuesCarriedOverToYear', { year: filters?.year - 1 })}
                dataIndex="remainIssues"
                key="remainIssues"
              />
            </ColumnGroup>
            <ColumnGroup title={t('AverageWarrantyTime')}>
              <Column
                title={t('NotReadyFightingError')}
                dataIndex="warrantyForImpactFightingIssue"
                key="warrantyForImpactFightingIssue"
              />
              <Column title={t('AllError')} dataIndex="warrantyAllError" key="warrantyAllError" />
            </ColumnGroup>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default YearReportTable;
