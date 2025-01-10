import { accountApi } from 'api/accountApi';
import { thunkGetCurrentColumn } from 'app/appSlice';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KTBSDropdown from '../OtherKeenComponents/KTBSDropdown';

AppSelectField.propTypes = {};

function AppSelectField({ fields = [], defaultColumns = [] }) {
  // MARK: --- params -
  const { t } = useTranslation();
  const { currentColumns } = useSelector((state) => state?.app);
  const dispatch = useDispatch();

  // MARK: --- functions ---
  async function handleChange(e, item) {
    const current = currentColumns?.columns
      ? [...currentColumns?.columns?.split(',').map((cl) => Number(cl))]
      : [];
    const checked = e.target.checked;

    let columns = [];

    if (checked) {
      columns = fields.filter((cl) => cl.id == item.id || current.find((ccl) => ccl == cl.id));
    } else {
      columns = current.filter((cl) => cl != item.id);
    }

    await accountApi.adjustIssueColumns({
      columnIds: columns.map((cl) => (cl?.id ? cl?.id : cl)),
    });
    dispatch(thunkGetCurrentColumn());
  }

  return (
    <div>
      <KTBSDropdown
        toggleElement={
          <div className="btn btn-sm btn-success font-weight-bold d-flex align-items-center">
            <i className="fa-regular fa-filter-list"></i>
            {t('CustomizeColumns')}
          </div>
        }
        dropdownMenuClassName="min-w-200px"
        contentEl={
          <div>
            {fields?.map((item) => (
              <label className="checkbox checkbox-success px-2 pb-2">
                <input
                  type="checkbox"
                  name="Checkboxes5"
                  checked={currentColumns?.columns
                    ?.split(',')
                    .map((cl) => Number(cl))
                    .find((cl) => cl == item.id)}
                  onChange={(e) => handleChange(e, item)}
                />
                <span></span>
                <div className="ml-2">{item?.name}</div>
              </label>
            ))}
          </div>
        }
        autoCloseBehavior={'false'}
        staticDisplay={true}
      />
    </div>
  );
}

export default AppSelectField;
