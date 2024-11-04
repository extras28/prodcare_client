import moment from 'moment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KTFormInput, {
  KTFormInputBTDPickerType,
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import Global from 'shared/utils/Global';

WeekReportTable.propTypes = {};

function WeekReportTable(props) {
  // MARK: --- Params ---
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    ...Global.gFiltersStatisticByWeek,
    week: moment().format('YYYY-Www'),
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
  });
  const { week, isGettingWeekReport } = useSelector((state) => state?.dashboard);
  const { currentProject } = useSelector((state) => state?.app);
  const dispatch = useDispatch();

  // MARK: --- Hooks ---

  return (
    <div>
      <div className="m-4" style={{ width: 'fit-content' }}>
        <KTFormInput
          name="report_week"
          //   value={filters.week}
          onChange={(value) => {
            const isValidWeek = moment(value, 'YYYY-Www', true).isValid();
            if (isValidWeek) {
              setFilters({
                projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
                week: value,
              });
              Global.gFiltersStatisticByWeek = {
                projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
                week: value,
              };
              Global.gNeedToRefreshStatisticByWeek = true;
            } else {
              console.error('Invalid week format');
            }
          }}
          placeholder={`${_.capitalize(t('Week'))}...`}
          type={KTFormInputType.dateRangePicker}
          btdPickerType={KTFormInputBTDPickerType.dateRange}
        />
      </div>
    </div>
  );
}

export default WeekReportTable;
