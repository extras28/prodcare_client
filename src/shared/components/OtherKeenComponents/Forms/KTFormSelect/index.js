import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

export const KTFormSelectSize = {
  default: '',
  large: 'form-control-lg',
  small: 'form-control-sm',
};

KTFormSelect.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  value: PropTypes.string,
  text: PropTypes.string,
  disabled: PropTypes.bool,
  isCustom: PropTypes.bool,
  size: PropTypes.oneOf(Object.values(KTFormSelectSize)),
  multiple: PropTypes.bool,
  rows: PropTypes.number,
  showValidState: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  enableCheckValid: PropTypes.bool,
  isTouched: PropTypes.bool,
  isValid: PropTypes.bool,
  feedbackText: PropTypes.string,
};

function KTFormSelect({
  name,
  options = [],
  value = '',
  text = '',
  disabled = false,
  isCustom = false,
  size = KTFormSelectSize.default,
  multiple = false,
  rows = 1,
  showValidState = false,
  onChange = null,
  onBlur = null,
  onFocus = null,
  enableCheckValid = false,
  isValid = true,
  isTouched = false,
  feedbackText = '',
}) {
  const { t } = useTranslation();

  const handleChange = (targetValue) => {
    if (onChange) {
      onChange(targetValue);
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <div>
      <select
        id={name}
        name={name}
        className={`
                    form-control
                    ${isCustom ? 'custom-select shadow-none' : `form-select ${size}`}
                    ${
                      enableCheckValid && isTouched
                        ? isValid
                          ? showValidState
                            ? 'is-valid'
                            : ''
                          : 'is-invalid'
                        : ''
                    }
                `}
        value={value}
        disabled={disabled}
        multiple={multiple}
        size={multiple ? rows : undefined}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onFocus={handleFocus}
      >
        {options.map((item, index) => (
          <option key={index} value={item.value}>
            {t(item.name)}
          </option>
        ))}
      </select>
      {enableCheckValid && !isValid && isTouched && !_.isEmpty(feedbackText) && (
        <div className="fv-plugins-message-container">
          <div className="fv-help-block">{feedbackText}</div>
        </div>
      )}
      {!_.isEmpty(text) && <span className="form-text text-muted">{text}</span>}
    </div>
  );
}

export default KTFormSelect;
