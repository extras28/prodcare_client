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
import _ from 'lodash';
import AppData from 'shared/constants/AppData';
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
  const { products, customers, components, reasons } = useSelector((state) => state?.app);

  const data = useMemo(
    () => [
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
    ],
    [year]
  );

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
    const worksheet1 = workbook.addWorksheet(t('General'), {
      views: [{ zoomScale: 85 }], // Set default zoom to 85%
    });

    // Add title spanning from A1 to U2 with yellow background
    worksheet1.mergeCells('A1:S2');
    const titleCell1 = worksheet1.getCell('A1');
    titleCell1.value = `BÁO CÁO CÔNG TÁC ĐẢM BẢO KỸ THUẬT SẢN PHẨM ${year?.project?.project_name} NĂM ${filters.year}`;
    titleCell1.font = { name: 'Times New Roman', size: 14, bold: true };
    titleCell1.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell1.fill = {
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

    // Add data to worksheet1 starting from row 6
    data.forEach((row, rowIndex) => {
      const excelRow = worksheet1.getRow(rowIndex + 6); // Start adding rows from row 6
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
    worksheet1.mergeCells('A6:A7'); // "Sản phẩm"
    worksheet1.mergeCells('B6:B7'); // "Số lượng trên tuyến hiện nay"
    worksheet1.mergeCells('C6:K6'); // "Lỗi phát sinh"
    worksheet1.mergeCells('L6:Q6'); // "Lỗi lũy kế đến hết năm 2023"
    worksheet1.mergeCells('R6:S6'); // "Thời gian bảo hành trung bình"

    // Applying bold to specific header cells in row 6
    worksheet1.getRow(6).eachCell((cell, colNumber) => {
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
    worksheet1.getRow(1).height = 28; // Adjust the height value as needed
    worksheet1.getRow(6).height = 28; // Adjust the height value as needed

    // Adding borders to all data cells
    worksheet1.eachRow((row, rowNumber) => {
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
    worksheet1.columns.forEach((column) => {
      column.width = 10; // Adjust as necessary
    });

    const worksheet2 = workbook.addWorksheet(t('IncidentalError'), {
      views: [{ zoomScale: 85 }], // Set default zoom to 85%
    });
    const listData2 = [
      [
        t('STT'),
        t('Status'),
        t('Customer'),
        t('Equipment'),
        // t('Component'),
        t('DescriptionByCustomer'),
        t('ErrorType'),
        t('ErrorLevel'),
        t('KPI_h'),
        t('HandlingMeasures'),
        t('RepairPart'),
        t('Amount'),
        t('UnitCount'),
        t('S/N'),
        t('EquipmentStatus'),
        t('ExpDate'),
        t('ReceptionTime'),
        t('CompletionTime'),
        t('HandlingTime'),
        t('ResponsibleHandlingUnit'),
        t('ReportingPerson'),
        t('RemainStatus'),
        t('OverdueKpi'),
        t('WarrantyStatus'),
        t('OverdueKpiReason'),
        t('SSCDImpact'),
        t('StopFighting'),
        t('UnhandleReason'),
        t('LetterSendVmc'),
        t('MaterialStatus'),
        t('HandlingPlan'),
        // t('ErrorAlert'),
      ],
      ...year?.issueInYears?.map((row, index) => {
        const ct = customers.find((c) => c.id === row['customer_id']);
        const pd = products.find((p) => p.id == row?.product_id);
        return [
          index + 1,
          t(_.capitalize(row?.status)),
          ct ? `${ct?.['military_region']} - ${ct?.['name']}` : '',
          // `${pd?.name} ${pd?.serial ? '(' + pd?.serial + ')' : ''}`,
          // components?.find((item) => item.id == row?.component_id)?.name || '',
          `${pd?.name} ${pd?.serial ? '(' + pd?.serial + ')' : ''} ${row?.componentPath || ''}`,
          row?.description || '',
          t(
            AppData.responsibleType.find((item) => item.value === row?.responsible_type)?.name || ''
          ),
          t(_.capitalize(AppData.errorLevel.find((item) => item.value === row?.level)?.name || '')),
          row?.kpi_h || '',
          t(
            AppData.handlingMeasures.find((item) => item.value === row?.['handling_measures'])
              ?.name || ''
          ),
          row?.repair_part || '',
          row?.repair_part_count || '',
          row?.unit || '',
          customers.find((item) => item.id == row?.customer_id)?.code_number || '',
          t(AppData.productStatus.find((item) => item.value === row?.product_status)?.name) || '',
          row?.exp_date ? Utils.formatDateTime(row?.exp_date, 'YYYY-MM-DD') : '',
          row?.reception_time ? Utils.formatDateTime(row?.reception_time, 'YYYY-MM-DD') : '',
          row?.completion_time ? Utils.formatDateTime(row?.completion_time, 'YYYY-MM-DD') : '',
          row?.handling_time || '',
          row?.responsible_handling_unit || '',
          row?.reporting_person || '',
          t(
            AppData.errorRemainStatus.find((item) => item.value === row?.['remain_status'])?.name ||
              ''
          ),
          t(_.capitalize(row?.overdue_kpi ? 'Yes' : 'No')),
          t(
            row?.warranty_status === 'UNDER'
              ? 'UnderWarranty'
              : row?.warranty_status === 'OVER'
              ? 'OutOfWarranty'
              : ''
          ),
          t(
            AppData.overdueKpiReasons.find((item) => item.value === row?.['overdue_kpi_reason'])
              ?.name
          ) || '',
          t(`${_.capitalize(row?.impact || '')}`),
          t(`${_.capitalize(row?.stop_fighting ? 'Yes' : 'No')}`),
          t(
            AppData.errorUnhandleReason.find((item) => item.value == row?.unhandle_reason)?.name ||
              ''
          ),
          row?.letter_send_vmc || '',
          // row?.date ? Utils.formatDateTime(row?.date, 'YYYY-MM-DD') : '',
          row?.material_status || '',
          row?.handling_plan || '',
          // row?.error_alert || '',
        ];
      }),
    ];

    listData2.forEach((row, rowIndex) => {
      const excelRow = worksheet2.getRow(rowIndex + 1);
      row.forEach((value, colIndex) => {
        const cell = excelRow.getCell(colIndex + 1);
        cell.value = value;
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.font = { name: 'Times New Roman', size: 11 };
      });

      // Set row color based on status
      if (row[1] === t(_.capitalize('PROCESSING'))) {
        // Assuming 'Status' is at index 1
        excelRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEB9C' }, // Yellow color
          };
        });
      } else if (row[1] === t(_.capitalize('UNPROCESSED'))) {
        // Assuming 'Status' is at index 1
        excelRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC7CE' }, // Red color
          };
        });
      } else if (row[1] === t(_.capitalize('PROCESSED'))) {
        // Assuming 'Status' is at index 1
        excelRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'C6EFCE' }, // Green color
          };
        });
      }
    });

    // Apply background color to cells from A1 to AE1
    const headerRow2 = worksheet2.getRow(1); // First row

    headerRow2.eachCell((cell, colIndex) => {
      if (colIndex >= 1 && colIndex <= 31) {
        // Columns A to AE (31 columns)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '92D050' }, // Light green color
        };
      }
    });

    // Adding borders to list sheet cells
    worksheet2.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    worksheet2.getColumn(1).width = 6;
    worksheet2.getColumn(2).width = 12;
    worksheet2.getColumn(3).width = 15;
    worksheet2.getColumn(4).width = 30;
    worksheet2.getColumn(5).width = 30;
    worksheet2.getColumn(6).width = 14;
    worksheet2.getColumn(14).width = 14;
    worksheet2.getColumn(15).width = 12;
    worksheet2.getColumn(16).width = 12;
    worksheet2.getColumn(17).width = 12;
    worksheet2.getColumn(30).width = 40;

    const worksheet3 = workbook.addWorksheet(
      t('CummulativeErrorsUpToTheEndOfYear', { year: filters?.year - 1 }),
      {
        views: [{ zoomScale: 85 }], // Set default zoom to 85%
      }
    );
    const listData3 = [
      [
        t('STT'),
        t('Status'),
        t('Customer'),
        t('Equipment'),
        // t('Component'),
        t('DescriptionByCustomer'),
        t('ErrorType'),
        t('ErrorLevel'),
        t('KPI_h'),
        t('HandlingMeasures'),
        t('RepairPart'),
        t('Amount'),
        t('UnitCount'),
        t('S/N'),
        t('EquipmentStatus'),
        t('ExpDate'),
        t('ReceptionTime'),
        t('CompletionTime'),
        t('HandlingTime'),
        t('ResponsibleHandlingUnit'),
        t('ReportingPerson'),
        t('RemainStatus'),
        t('OverdueKpi'),
        t('WarrantyStatus'),
        t('OverdueKpiReason'),
        t('SSCDImpact'),
        t('StopFighting'),
        t('UnhandleReason'),
        t('LetterSendVmc'),
        t('MaterialStatus'),
        t('HandlingPlan'),
        // t('ErrorAlert'),
      ],
      ...year?.cummulativeIssues?.map((row, index) => {
        const ct = customers.find((c) => c.id === row['customer_id']);
        const pd = products.find((p) => p.id == row?.product_id);
        return [
          index + 1,
          t(_.capitalize(row?.status)),
          ct ? `${ct?.['military_region']} - ${ct?.['name']}` : '',
          // `${pd?.name} ${pd?.serial ? '(' + pd?.serial + ')' : ''}`,
          // components?.find((item) => item.id == row?.component_id)?.name || '',
          `${pd?.name} ${pd?.serial ? '(' + pd?.serial + ')' : ''} ${row?.componentPath || ''}`,
          row?.description || '',
          t(
            AppData.responsibleType.find((item) => item.value === row?.responsible_type)?.name || ''
          ),
          t(_.capitalize(AppData.errorLevel.find((item) => item.value === row?.level)?.name || '')),
          row?.kpi_h || '',
          t(
            AppData.handlingMeasures.find((item) => item.value === row?.['handling_measures'])
              ?.name || ''
          ),
          row?.repair_part || '',
          row?.repair_part_count || '',
          row?.unit || '',
          customers.find((item) => item.id == row?.customer_id)?.code_number || '',
          t(AppData.productStatus.find((item) => item.value === row?.product_status)?.name) || '',
          row?.exp_date ? Utils.formatDateTime(row?.exp_date, 'YYYY-MM-DD') : '',
          row?.reception_time ? Utils.formatDateTime(row?.reception_time, 'YYYY-MM-DD') : '',
          row?.completion_time ? Utils.formatDateTime(row?.completion_time, 'YYYY-MM-DD') : '',
          row?.handling_time || '',
          row?.responsible_handling_unit || '',
          row?.reporting_person || '',
          t(
            AppData.errorRemainStatus.find((item) => item.value === row?.['remain_status'])?.name ||
              ''
          ),
          t(_.capitalize(row?.overdue_kpi ? 'Yes' : 'No')),
          t(
            row?.warranty_status === 'UNDER'
              ? 'UnderWarranty'
              : row?.warranty_status === 'OVER'
              ? 'OutOfWarranty'
              : ''
          ),
          t(
            AppData.overdueKpiReasons.find((item) => item.value === row?.['overdue_kpi_reason'])
              ?.name
          ) || '',
          t(`${_.capitalize(row?.impact || '')}`),
          t(`${_.capitalize(row?.stop_fighting ? 'Yes' : 'No')}`),
          t(
            AppData.errorUnhandleReason.find((item) => item.value == row?.unhandle_reason)?.name ||
              ''
          ),
          row?.letter_send_vmc || '',
          // row?.date ? Utils.formatDateTime(row?.date, 'YYYY-MM-DD') : '',
          row?.material_status || '',
          row?.handling_plan || '',
          // row?.error_alert || '',
        ];
      }),
    ];

    listData3.forEach((row, rowIndex) => {
      const excelRow = worksheet3.getRow(rowIndex + 1);
      row.forEach((value, colIndex) => {
        const cell = excelRow.getCell(colIndex + 1);
        cell.value = value;
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.font = { name: 'Times New Roman', size: 11 };
      });

      // Set row color based on status
      if (row[1] === t(_.capitalize('PROCESSING'))) {
        // Assuming 'Status' is at index 1
        excelRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEB9C' }, // Yellow color
          };
        });
      } else if (row[1] === t(_.capitalize('UNPROCESSED'))) {
        // Assuming 'Status' is at index 1
        excelRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC7CE' }, // Red color
          };
        });
      } else if (row[1] === t(_.capitalize('PROCESSED'))) {
        // Assuming 'Status' is at index 1
        excelRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'C6EFCE' }, // Green color
          };
        });
      }
    });

    // Apply background color to cells from A1 to AE1
    const headerRow3 = worksheet3.getRow(1); // First row

    headerRow3.eachCell((cell, colIndex) => {
      if (colIndex >= 1 && colIndex <= 31) {
        // Columns A to AE (31 columns)
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '92D050' }, // Light green color
        };
      }
    });

    // Adding borders to list sheet cells
    worksheet3.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    worksheet3.getColumn(1).width = 6;
    worksheet3.getColumn(2).width = 12;
    worksheet3.getColumn(3).width = 15;
    worksheet3.getColumn(4).width = 30;
    worksheet3.getColumn(5).width = 30;
    worksheet3.getColumn(6).width = 14;
    worksheet3.getColumn(14).width = 14;
    worksheet3.getColumn(15).width = 12;
    worksheet3.getColumn(16).width = 12;
    worksheet3.getColumn(17).width = 12;
    worksheet3.getColumn(30).width = 40;

    // Generate Excel file as a Blob and save it using file-saver
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(
      blob,
      `BÁO CÁO ĐBKT ${year?.project?.project_name} ${filters.year} (${Utils.formatDateTime(
        moment(),
        'YYYY-MM-DD'
      )}).xlsx`
    );
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
