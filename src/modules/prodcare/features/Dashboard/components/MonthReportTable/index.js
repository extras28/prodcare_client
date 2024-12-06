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
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import Global from 'shared/utils/Global';
import Utils from 'shared/utils/Utils';
import { thunkGetMonthReport } from '../../dashboardSlice';

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
        cumulativeIssues: month?.cumulative?.cumulativeIssues,

        processedIssuesCount: month?.cumulative?.processedIssuesCount,
        impactReadyFightingIssue: month?.cumulative?.impactReadyFightingIssue,
        stopFightingIssues: month?.cumulative?.stopFightingIssues,
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

  async function exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Sheet', {
      views: [{ zoomScale: 85 }], // Set default zoom to 85%
    });

    // Add title spanning from A1 to U2 with yellow background
    worksheet.mergeCells('A1:T2');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `BÁO CÁO CÔNG TÁC ĐẢM BẢO KỸ THUẬT SẢN PHẨM VSI3 THÁNG ${filters.month}`;
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
        t('MonthlyError'),
        '',
        '',
        t('Remain'),
        '',
        '',
        t('Cumulative'),
        '',
        '',
        '',
        t('TotalHandledThisMonth'),
        t('MonthlyKPIEvaluation'),
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
        t('NotReadyFightingError'),
        t('RemainCount'),
        t('MonthlyHandled'),
        t('TotalErrorsHandled'),
        t('CumulativeRemain'),
        t('Handled'),
        t('ImpactOnReadyFightingError'),
        t('StopFightingError'),
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
        t('NotReadyFightingError'),
        t('AllError'),
        t('Kcd'),
        t('Kkt'),
        '',
        '',
        '',
      ],
      [
        month?.project?.project_name,
        month?.project?.customerCount,
        month?.issueCount?.receptionIssues,
        month?.issueCount?.processedIssues,
        month?.issueCount?.notReadyFightingIssues,
        month?.remain?.count,
        month?.remain?.handleInMonth,
        month?.remain?.totalProcessedIssue,
        month?.cumulative?.cumulativeIssues,
        month?.cumulative?.processedIssuesCount,
        month?.cumulative?.impactReadyFightingIssue,
        month?.cumulative?.stopFightingIssues,
        month?.totalHandledInMonth,
        Utils.formatNumber(month?.warranty?.notReadyFightingWarrantyTime),
        Utils.formatNumber(month?.warranty?.allErrorWarrantyTime),
        `${month?.warranty?.kcd}%`,
        `${month?.warranty?.kkt}%`,
        Utils.formatNumber(month?.averageTimeError?.notReadyFightingError),
        month?.averageTimeError?.allError
          ? Utils.formatNumber(month?.averageTimeError?.allError)
          : 0,
        month?.warranty?.handlingRate,
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
    worksheet.mergeCells('C6:E6');
    worksheet.mergeCells('F6:H6');
    worksheet.mergeCells('I6:L6');
    worksheet.mergeCells('M6:M8');
    worksheet.mergeCells('N6:Q6');
    worksheet.mergeCells('R6:S6');
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
    worksheet.mergeCells('N7:O7');
    worksheet.mergeCells('P7:Q7');
    worksheet.mergeCells('R7:R8');
    worksheet.mergeCells('S7:S8');
    worksheet.mergeCells('T6:T8');

    // Applying bold to specific header cells in row 6
    worksheet.getRow(6).eachCell((cell, colNumber) => {
      if (
        [
          t('Product'),
          t('CurrentOperatingQuantity'),
          t('MonthlyError'),
          t('Remain'),
          t('Cumulative'),
          t('TotalHandledThisMonth'),
          t('MonthlyKPIEvaluation'),
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
    saveAs(blob, `BÁO CÁO ĐBKT ${month?.project?.project_name} ${filters.month}.xlsx`);
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
      <div className="m-4 d-flex flex-wrap justify-content-between">
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
            <ColumnGroup title={t('Cumulative')}>
              <Column
                title={t('CumulativeRemain')}
                dataIndex="cumulativeIssues"
                key="cumulativeIssues"
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
