import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import KTFormInput, {
  KTFormInputBTDPickerType,
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import Global from 'shared/utils/Global';

MonthReportTable.propTypes = {};

function MonthReportTable(props) {
  // MARK: --- Params ---
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    ...Global.gFiltersStatisticByMonth,
    month: moment().format('YYYY-MM'),
    projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
  });

  return (
    <div>
      <div className="m-4" style={{ width: 'fit-content' }}>
        <KTFormInput
          name="report_month"
          value={filters.month.toString()}
          onChange={(value) => {
            setFilters({
              projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
              year: value,
            });
            Global.gFiltersStatisticByMonth = {
              projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
              year: value,
            };
            Global.gNeedToRefreshStatisticByMonth = true;
          }}
          placeholder={`${_.capitalize(t('Month'))}...`}
          type={KTFormInputType.btdPicker}
          btdPickerType={KTFormInputBTDPickerType.month}
        />
      </div>
    </div>
  );
}

export default MonthReportTable;
