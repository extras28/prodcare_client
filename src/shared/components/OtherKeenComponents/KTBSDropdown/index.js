import _ from 'lodash';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export const KTBSDropdownDirections = {
  left: 'dropleft',
  up: 'dropup',
  right: 'dropright',
  down: 'dropdown',
};

export const KTBSDropdownAlignments = {
  start: 'dropdown-menu-start',
  end: 'dropdown-menu-end',
};

export const KTBSDropdownAutoCloseBehavior = {
  true: 'true',
  false: 'false',
  inside: 'inside',
  outside: 'outside',
};

/**
 *
 * @param {{
 * toggleWrapperClassName?: string,
 * toggleElement?: element,
 * dropdownMenuClassName?: string,
 * dropdownMenuItems?: object[],
 * selectedValue?: string,
 * direction?: string,
 * alignment?: string,
 * offset?: {},
 * staticDisplay?: boolean,
 * autoCloseBehavior?: boolean,
 * contentEl?: element,
 * onChange?: function,
 * onBlur?: function,
 * onFocus?: function,
 * }} props
 * @returns
 */
function KTBSDropdown({
  toggleWrapperClassName = '',
  toggleElement = <></>,
  dropdownMenuClassName = '',
  dropdownMenuItems = [],
  selectedValue = null,
  direction = KTBSDropdownDirections.down,
  alignment = KTBSDropdownAlignments.start,
  offset = null,
  staticDisplay = true,
  autoCloseBehavior = KTBSDropdownAutoCloseBehavior.true,
  contentEl = null,
  onChange = null,
  onBlur = null,
  onFocus = null,
}) {
  const { t } = useTranslation();

  // MARK: --- Functions ---
  function handleChange(targetValue) {
    if (onChange) {
      onChange(targetValue);
    }
  }

  function handleBlur() {
    if (onBlur) {
      onBlur();
    }
  }

  function handleFocus() {
    if (onFocus) {
      onFocus();
    }
  }

  return (
    <div className={`${direction}`}>
      {/* Toggle element */}
      <div
        className={`${toggleWrapperClassName} ${direction}`}
        data-bs-toggle="dropdown"
        data-bs-display={staticDisplay ? 'static' : undefined}
        aria-expanded="false"
        data-bs-auto-close={autoCloseBehavior}
      >
        {toggleElement}
      </div>

      {/* Dropdown menu */}
      <div className={`dropdown-menu ${dropdownMenuClassName} ${alignment}`}>
        {!_.isEmpty(contentEl) ? (
          <div>{contentEl}</div>
        ) : (
          <div>
            {dropdownMenuItems.map((item, index) => (
              <div key={index}>
                <a
                  className={`dropdown-item ${
                    !_.isEmpty(selectedValue) && selectedValue === item.value ? 'active' : ''
                  }`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleChange(item.value);
                  }}
                >
                  {item.icon && (
                    <img alt="icon" src={item.icon} className="w-25px h-25px rounded mr-2" />
                  )}
                  {t(item.name)}
                </a>
                {item.showDivider && <div className="dropdown-divider"></div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

KTBSDropdown.propTypes = {
  toggleWrapperClassName: PropTypes.string,
  toggleElement: PropTypes.element,
  dropdownMenuClassName: PropTypes.string,
  dropdownMenuItems: PropTypes.array,
  selectedValue: PropTypes.string,
  direction: PropTypes.oneOf(Object.values(KTBSDropdownDirections)),
  alignment: PropTypes.oneOf(Object.values(KTBSDropdownAlignments)),
  offset: PropTypes.object,
  staticDisplay: PropTypes.bool,
  autoCloseBehavior: PropTypes.oneOf(Object.values(KTBSDropdownAutoCloseBehavior)),
  contentEl: PropTypes.element,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
};

export default KTBSDropdown;
