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

  async function exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Sheet', {
      views: [{ zoomScale: 85 }], // Set default zoom to 85%
    });

    // Add title spanning from A1 to U2 with yellow background
    worksheet.mergeCells('A1:S2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'BÁO CÁO CÔNG TÁC ĐẢM BẢO KỸ THUẬT SẢN PHẨM VSI3 NĂM 2024';
    titleCell.font = { name: 'Times New Roman', size: 14, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' }, // Yellow background
    };

    // Sample data starting from row 6
    const data = [
      [
        t('Product'),
        t('CurrentOperatingQuantity'),
        t('QuarterlyError'),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        t('Remain'),
        '',
        '',
        '',
        '',
        '',
        t('Cummulative'),
        '',
        '',
        t('TotalHandledThisQuarter'),
      ],
      [
        '',
        '',
        t('RecevedInYear'),
        t('CriticalError'),
        t('ModerateError'),
        t('MinorError'),
        t('StopFightingError'),
        t('NotReadyForFightingError'),
        t('ErrorsProcessedDuringTheYear'),
        t('HandledReateInYear'),
        t('UnprocessedErrorsForNextYear'),
        t('CummulativeErrorsReceivedUpToTheEndOfYear', { year: filters?.year - 1 }),
        t('TheTotalNumberOfErrorsProcessedByTheEndOfYear', {
          year: filters?.year - 1,
        }),
        t('TheTotalErrorsProcessedInTheYear'),
        t('TheTotalErrorsToBeProcessedInTheYear'),
        t('HandledReateInYear'),
        t('IssuesCarriedOverToYear', { year: filters?.year }),
        t('NotReadyFightingError'),
        t('AllError'),
      ],
      [
        year?.project?.project_name,
        year?.project?.customerCount,
        year?.issueCounts?.receptionIssues,
        year?.issueCounts?.criticalIssues,
        year?.issueCounts?.moderateIssues,
        year?.issueCounts?.minorIssues,
        year?.issueCounts?.stopFightingIssues,
        year?.issueCounts?.impactReadyFightingIssue,
        year?.issueCounts?.processedIssuesInYear,
        `${year?.issueCounts?.['%'] ? Utils.formatNumber(year?.issueCounts?.['%']) : 0} %`,
        year?.issueCounts?.remainIssues,
        year?.cummulative?.cummulativeIssues,
        year?.cummulative?.processedIssues,
        year?.cummulative?.processedIssuesInPrevYear,
        year?.cummulative?.needToProcessInPrevYear,
        year?.cummulative?.['%'] ? Utils.formatNumber(year?.cummulative?.['%']) : 0,
        year?.cummulative?.remainIssues,
        year?.issueCounts?.warrantyForImpactFightingIssue
          ? Utils.formatNumber(year?.issueCounts?.warrantyForImpactFightingIssue)
          : 0,
        year?.issueCounts?.warrantyAllError
          ? Utils.formatNumber(year?.issueCounts?.warrantyAllError)
          : 0,
      ],
    ];

    // Add data to worksheet starting from row 6
    data.forEach((row, rowIndex) => {
      const excelRow = worksheet.getRow(rowIndex + 6); // Start adding rows from row 6
      row.forEach((value, colIndex) => {
        const cell = excelRow.getCell(colIndex + 1); // Get each cell in the row
        cell.value = value;
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        cell.font = { name: 'Times New Roman', size: 11 }; // Set font family to Times New Roman and size to 11
      });
    });

    // Merging cells for headers in row 6
    worksheet.mergeCells('A6:A7'); // "Sản phẩm"
    worksheet.mergeCells('B6:B7'); // "Số lượng trên tuyến hiện nay"
    worksheet.mergeCells('C6:K6'); // "Lỗi phát sinh"
    worksheet.mergeCells('L6:Q6'); // "Lỗi lũy kế đến hết năm 2023"
    worksheet.mergeCells('R6:S6'); // "Thời gian bảo hành trung bình"

    // Applying bold to specific header cells in row 6
    worksheet.getRow(6).eachCell((cell, colNumber) => {
      if (
        [
          t('Product'),
          t('CurrentOperatingQuantity'),
          t('IncidentalError'),
          t('CummulativeErrorsUpToTheEndOfYear', { year: filters?.year - 1 }),
          t('AverageWarrantyTime'),
        ].includes(cell.value)
      ) {
        cell.font = { name: 'Times New Roman', size: 11, bold: true }; // Set font family to Times New Roman, size to 11, and make it bold
      }
    });

    // Increase the row height for the title row
    worksheet.getRow(1).height = 28; // Adjust the height value as needed
    worksheet.getRow(6).height = 28; // Adjust the height value as needed

    // Adding borders to all data cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Adjust column width
    worksheet.columns.forEach((column) => {
      column.width = 10; // Adjust as necessary
    });

    // Generate Excel file as a Blob and save it using file-saver
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `BÁO CÁO ĐBKT ${year?.project?.project_name} ${filters.year}.xlsx`);
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
              <Column title={t('CriticalError')} dataIndex="criticalIssue" key="criticalIssue" />
              <Column title={t('ModerateError')} dataIndex="moderateIssue" key="moderateIssue" />
              <Column title={t('MinorError')} dataIndex="minorIssue" key="minorIssue" />
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
              <Column
                title={t('NotReadyFightingError')}
                dataIndex="notReadyFightingIssues"
                key="notReadyFightingIssues"
              />
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
