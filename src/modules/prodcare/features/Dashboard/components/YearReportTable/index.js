import { unwrapResult } from '@reduxjs/toolkit';
import { Table } from 'antd';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
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
        receptionIssuesPercent: `${
          year?.issueCounts?.['%'] ? Utils.formatNumber(year?.issueCounts?.['%']) : 0
        } %`,
        remainIssuesThisYear: year?.issueCounts?.remainIssues,
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
        t('IncidentalError'),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        t('CummulativeErrorsUpToTheEndOfYear', { year: filters?.year - 1 }),
        '',
        '',
        '',
        '',
        '',
        t('AverageWarrantyTime'),
        '',
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
      <div className="m-4 d-flex flex-wrap justify-content-between">
        <KTFormInput
          name="report_year"
          value={filters.year.toString()}
          onChange={(value) => {
            const isValidYear = moment(value, 'YYYY', true).isValid();

            if (isValidYear) {
              setFilters({
                projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
                year: value,
              });
              Global.gFiltersStatisticByYear = {
                projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
                year: value,
              };
              Global.gNeedToRefreshStatisticByYear = true;
            } else {
              console.error("Invalid year format. Please enter a year in the 'YYYY' format.");
            }
          }}
          placeholder={`${_.capitalize(t('Year'))}...`}
          type={KTFormInputType.btdPicker}
          btdPickerType={KTFormInputBTDPickerType.year}
          inputGroupType={KTFormInputGroupType.button}
        />

        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            exportToExcel();
          }}
          className="btn btn-success font-weight-bold d-flex align-items-center"
        >
          <i className="fa-regular fa-file-export"></i>
          {t('ExportReport')}
        </a>
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
              <Column title={t('ModerateError')} dataIndex="moderateIssues" key="moderateIssues" />
              <Column title={t('MinorError')} dataIndex="minorIssues" key="minorIssues" />
              <Column
                title={t('StopFightingError')}
                dataIndex="stopFightingIssues"
                key="stopFightingIssues"
              />
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
                title={t('HandledReateInYear')}
                dataIndex="receptionIssuesPercent"
                key="receptionIssuesPercent"
              />
              <Column
                title={t('UnprocessedErrorsForNextYear')}
                dataIndex="remainIssuesThisYear"
                key="remainIssuesThisYear"
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
                title={t('HandledReateInYear')}
                dataIndex="cummulativeIssuesPercent"
                key="cummulativeIssuesPercent"
              />
              <Column
                title={t('IssuesCarriedOverToYear', { year: filters?.year })}
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
