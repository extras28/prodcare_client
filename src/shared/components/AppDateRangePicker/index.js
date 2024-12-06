import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { useTranslation } from 'react-i18next';
import Utils from 'shared/utils/Utils';
import './style.scss';
import $, { isEmptyObject } from 'jquery';

function DateRangePickerInput({
  format = 'YYYY-MM-DD',
  className = '',
  getDateRange = null,
  showingRange = '',
  initialLabel = 'All',
  initialStartDate = null,
  initialEndDate = null,
  customRanges = {},
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
      startDate: label === t('All') ? '' : moment(start._d).format('YYYY-MM-DD'),
      endDate: label === t('All') ? '' : moment(end._d).format('YYYY-MM-DD'),
    };

    if (getDateRange) {
      getDateRange(dateRange);
    }
  }

  function handleShowCalendar(event, picker) {}

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
          startDate: initialStartDate ? initialStartDate : moment(),
          endDate: initialEndDate ? initialEndDate : moment(),
          alwaysShowCalendars: true,
          opens: 'left',
          locale: {
            format: format,
            cancelLabel: t('Cancel'),
            applyLabel: t('Apply'),
            customRangeLabel: t('Customize'),
          },
          ranges: !isEmptyObject(customRanges)
            ? customRanges
            : {
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
  customRanges: PropTypes.object,
};

export default DateRangePickerInput;
