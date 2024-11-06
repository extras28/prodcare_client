import { unwrapResult } from '@reduxjs/toolkit';
import { Table } from 'antd';
import Column from 'antd/es/table/Column';
import ColumnGroup from 'antd/es/table/ColumnGroup';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KTFormInput, {
  KTFormInputBTDPickerType,
  KTFormInputGroupType,
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import KTFormSelect from 'shared/components/OtherKeenComponents/Forms/KTFormSelect';
import AppData from 'shared/constants/AppData';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import Global from 'shared/utils/Global';
import Utils from 'shared/utils/Utils';
import { thunkGetQuarterReport } from '../../dashboardSlice';

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
    worksheet.mergeCells('A1:AA2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `BÁO CÁO CÔNG TÁC ĐẢM BẢO KỸ THUẬT SẢN PHẨM ${quarter?.project?.['project_name']} QUÝ ${filters.quarter} ${filters.year}`;
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
        t('QuarterlyKPIEvaluation'),
        '',
        '',
        '',
        t('AverageFailureOccurrenceTime'),
        '',
        t('ErrorHandlingRateWithinKPI'),
      ],
      [
        '',
        '',
        t('Reception'),
        t('Handled'),
        t('CriticalError'),
        t('ModerateError'),
        t('MinorError'),
        t('StopFightingError'),
        t('StopFightingTime'),
        t('StopFightingTime'),
        t('RemainCount'),
        t('CriticalError'),
        t('ModerateError'),
        t('MinorError'),
        t('QuarterlyHandled'),
        t('TotalErrorsHandled'),
        t('CumulativeRemain'),
        t('Handled'),
        t('ImpactOnReadyFightingError'),
        '',
        t('AverageWarrantyTime'),
        '',
        t('NotReadyFightingError'),
        '',
        t('NotReadyFightingError'),
        t('AllError'),
        '',
      ],
      [
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        t('NotReadyFightingError'),
        t('AllError'),
        t('Kcd'),
        t('Kkt'),
        '',
        '',
        '',
      ],
      [
        quarter?.project?.project_name,
        quarter?.project?.customerCount,
        quarter?.issueCount?.receptionIssues,
        quarter?.issueCount?.processedIssues,
        quarter?.issueCount?.notReadyFightingIssues,
        quarter?.remain?.count,
        quarter?.remain?.handleInQuarter,
        quarter?.remain?.totalProcessedIssue,
        quarter?.cummulative?.cummulativeIssues,
        quarter?.issueCount?.criticalIssue,
        quarter?.issueCount?.stopFightingIssue,
        quarter?.issueCount?.moderateIssue,
        quarter?.issueCount?.minorIssue,
        quarter?.issueCount?.stopFightingTime,

        quarter?.cummulative?.processedIssuesCount,
        quarter?.cummulative?.impactReadyFightingIssue,
        quarter?.remainIssue?.criticalIssue,
        quarter?.remainIssue?.moderateIssue,
        quarter?.remainIssue?.minorIssue,
        quarter?.totalHandledInQuarter,
        Utils.formatNumber(quarter?.warranty?.notReadyFightingWarrantyTime),
        Utils.formatNumber(quarter?.warranty?.allErrorWarrantyTime),
        `${quarter?.warranty?.kcd}%`,
        `${quarter?.warranty?.kkt}%`,
        Utils.formatNumber(quarter?.averageTimeError?.notReadyFightingError),
        quarter?.averageTimeError?.allError
          ? Utils.formatNumber(quarter?.averageTimeError?.allError)
          : 0,
        quarter?.warranty?.handlingRate,
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
    worksheet.mergeCells('A6:A8');
    worksheet.mergeCells('B6:B8');
    worksheet.mergeCells('C6:J6');
    worksheet.mergeCells('K6:P6');
    worksheet.mergeCells('Q6:S6');
    worksheet.mergeCells('U6:X6');
    worksheet.mergeCells('Y6:Z6');
    worksheet.mergeCells('T6:T8');
    worksheet.mergeCells('C7:C8');
    worksheet.mergeCells('D7:D8');
    worksheet.mergeCells('E7:E8');
    worksheet.mergeCells('F7:F8');
    worksheet.mergeCells('G7:G8');
    worksheet.mergeCells('H7:H8');
    worksheet.mergeCells('I7:I8');
    worksheet.mergeCells('J7:J8');
    worksheet.mergeCells('K7:K8');
    worksheet.mergeCells('L7:L8');
    worksheet.mergeCells('M7:M8');
    worksheet.mergeCells('N7:N8');
    worksheet.mergeCells('O7:O8');
    worksheet.mergeCells('P7:P8');
    worksheet.mergeCells('Q7:Q8');
    worksheet.mergeCells('R7:R8');
    worksheet.mergeCells('S7:S8');
    worksheet.mergeCells('U7:V7');
    worksheet.mergeCells('W7:X7');
    worksheet.mergeCells('Y7:Y8');
    worksheet.mergeCells('Z7:Z8');
    worksheet.mergeCells('AA6:AA8');

    // Applying bold to specific header cells in row 6
    worksheet.getRow(6).eachCell((cell, colNumber) => {
      if (
        [
          t('Product'),
          t('CurrentOperatingQuantity'),
          t('QuarterlyError'),
          t('Remain'),
          t('Cummulative'),
          t('TotalHandledThisQuarter'),
          t('QuarterlyKPIEvaluation'),
          t('AverageFailureOccurrenceTime'),
          t('ErrorHandlingRateWithinKPI'),
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
    saveAs(
      blob,
      `BÁO CÁO ĐBKT ${quarter?.project?.project_name} QUÝ ${filters.quarter} ${filters.year}.xlsx`
    );
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
      <div className="m-4 d-flex flex-wrap gap-4 justify-content-between">
        <div className="d-flex flex-wrap gap-4">
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
        {/* <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            exportToExcel();
          }}
          className="btn btn-success font-weight-bold d-flex align-items-center"
        >
          <i className="fa-regular fa-file-export"></i>
          {t('ExportReport')}
        </a> */}
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
