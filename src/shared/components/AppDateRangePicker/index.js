import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';

AppDateRangePicker.propTypes = {};

function AppDateRangePicker({ onApply }) {
  function handleApply(event, picker) {
    if (onApply) {
      onApply(
        moment(picker.startDate).format('YYYY-MM-DD'),
        moment(picker.endDate).format('YYYY-MM-DD')
      );
    }
  }
  return (
    <div>
      <DateRangePicker onApply={handleApply}>
        <input className="form-control" />
      </DateRangePicker>
    </div>
  );
}

export default AppDateRangePicker;
