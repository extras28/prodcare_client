import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { useTranslation } from 'react-i18next';
import Utils from 'shared/utils/Utils';
import './style.scss';
import $ from 'jquery';

function DateRangePickerInput({
  format = 'YYYY-MM-DD',
  className = '',
  getDateRange = null,
  showingRange = '',
  initialLabel = 'All',
  initialStartDate = null,
  initialEndDate = null,
  listMarkDays = [], // add listMarkDays prop
}) {
  const dateRangePickerInput = useRef(null);
  const { t } = useTranslation();
  const [range, setRange] = useState(t(initialLabel));

  function handleCallback(start, end, label) {
    let dateRange = {};
    const rangeLabel =
      label !== t('Customize')
        ? label
        : `${Utils.formatDateTime(start._d, 'YYYY-MM-DD')} - ${Utils.formatDateTime(
            end._d,
            'YYYY-MM-DD'
          )}`;

    setRange(rangeLabel);
    dateRange = {
      label: label,
      startDate: label === t('All') ? '' : Utils.formatDateTime(start._d, 'YYYY-MM-DD'),
      endDate: label === t('All') ? '' : Utils.formatDateTime(end._d, 'YYYY-MM-DD'),
    };

    if (getDateRange) {
      getDateRange(dateRange);
    }
  }

  function handleShowCalendar(event, picker) {
    // setTimeout(() => {
    //   // Get the month and year for the left and right calendars
    //   const leftMonthYearText = $('.drp-calendar.left .month').text().trim();
    //   const rightMonthYearText = $('.drp-calendar.right .month').text().trim();
    //   const leftMonth = moment(leftMonthYearText, 'MMM YYYY').month(); // e.g., November => 10
    //   const leftYear = moment(leftMonthYearText, 'MMM YYYY').year();
    //   const rightMonth = moment(rightMonthYearText, 'MMM YYYY').month();
    //   const rightYear = moment(rightMonthYearText, 'MMM YYYY').year();
    //   // Iterate over each day cell in both calendars
    //   $('.drp-calendar td').each(function () {
    //     const day = $(this).text().trim();
    //     // Determine the month and year based on which calendar we're in (left or right)
    //     const isLeftCalendar = $(this).closest('.drp-calendar').hasClass('left');
    //     const month = isLeftCalendar ? leftMonth : rightMonth;
    //     const year = isLeftCalendar ? leftYear : rightYear;
    //     // Construct the full date in 'YYYY-MM-DD' format
    //     const date = moment({ year, month, day }).format('YYYY-MM-DD');
    //     // Check if this date is in the listMarkDays array
    //     if (listMarkDays.includes(date)) {
    //       $(this).addClass('mark-day');
    //     } else {
    //       $(this).removeClass('mark-day');
    //     }
    //   });
    // }, 10);
  }

  useEffect(() => {
    if (showingRange) {
      setRange(showingRange);
    }
  }, [showingRange]);

  return (
    <div
      className={`DateRangePickerInput cursor-pointer d-flex flex-wrap align-items-center justify-content-between ${className}`}
      onClick={() => dateRangePickerInput.current.ref.focus()}
    >
      <div>
        <span className="font-size-base mx-2">
          {range}
          <i className="text-dark-75 fas fa-caret-down ml-2 mr-1"></i>
        </span>
      </div>

      <DateRangePicker
        onShow={handleShowCalendar}
        ref={dateRangePickerInput}
        onCallback={handleCallback}
        initialSettings={{
          startDate: initialStartDate ?? moment(),
          endDate: initialEndDate ?? moment(),
          alwaysShowCalendars: true,
          opens: 'left',
          locale: {
            format: format,
            cancelLabel: t('Cancel'),
            applyLabel: t('Apply'),
            customRangeLabel: t('Customize'),
          },
          ranges: {
            [t('All')]: [moment(), moment()],
            [t('ThisWeek')]: [moment().startOf('week').add(1, 'days'), moment()],
            [t('Last7Days')]: [moment().subtract(6, 'days'), moment()],
            [t('Last30Days')]: [moment().subtract(29, 'days'), moment()],
            [t('LastMonth')]: [
              moment().subtract(1, 'month').startOf('month'),
              moment().subtract(1, 'month').endOf('month'),
            ],
            [t('ThisMonth')]: [moment().startOf('month'), moment()],
          },
        }}
      >
        <input
          style={{
            color: 'transparent',
            height: '38px',
            width: '0px',
          }}
          className="cursor-pointer rounded p-0"
        />
      </DateRangePicker>
    </div>
  );
}

DateRangePickerInput.propTypes = {
  format: PropTypes.string,
  className: PropTypes.string,
  getDateRange: PropTypes.func,
  showingRange: PropTypes.string,
  initialLabel: PropTypes.string,
  initialStartDate: PropTypes.object,
  initialEndDate: PropTypes.object,
  listMarkDays: PropTypes.arrayOf(PropTypes.string), // declare prop type
};

export default DateRangePickerInput;
