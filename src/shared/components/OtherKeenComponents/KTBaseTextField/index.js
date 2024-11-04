import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';
import { useState } from 'react';

KTBaseTextField.propTypes = {
  name: PropTypes.string.isRequired,
  fieldProps: PropTypes.object,
  fieldMeta: PropTypes.object,
  fieldHelper: PropTypes.object,

  type: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string,
  spellCheck: PropTypes.bool,
  additionLabelClassName: PropTypes.string,
  additionalInputClassName: PropTypes.string,
  autoComplete: PropTypes.string,
  labelStyle: PropTypes.object,
  require: PropTypes.bool,
  onBlur: PropTypes.func,
};

KTBaseTextField.defaultProps = {
  type: 'text',
  label: '',
  placeholder: '',
  disabled: false,
  text: '',
  spellCheck: false,

  fieldProps: {},
  fieldHelper: {},
  fieldMeta: {},

  className: 'form-group',
  additionLabelClassName: 'text-remaining',
  additionalInputClassName: '',
  autoComplete: 'on',
  labelStyle: {},
  require: false,
  onBlur: null,
};

function KTBaseTextField(props) {
  // MARK: --- Params ---
  const {
    name,
    fieldProps,
    fieldHelper,
    fieldMeta,
    type,
    label,
    placeholder,
    disabled,
    text,
    className,
    spellCheck,
    additionLabelClassName,
    additionalInputClassName,
    autoComplete,
    labelStyle,
    require,
    onBlur,
  } = props;
  const { error, touched } = fieldMeta;
  const isError = error && touched;

  const [currentType, setCurrentType] = useState(type);

  function handleShowPass() {
    if (currentType === 'password') {
      setCurrentType('text');
    } else if (currentType === 'text') {
      setCurrentType('password');
    }
  }

  function handleBlur(e) {
    if (onBlur) {
      onBlur(e?.target?.value);
    }
  }

  return (
    <div className="KTBaseTextField">
      <div className={className}>
        {label && (
          <div className={`${require && 'd-flex flex-row'}`}>
            <label className={additionLabelClassName} htmlFor={name} style={labelStyle}>
              {label}
            </label>
            {require && (
              <span className="font-weight-boldest ml-1" style={{ color: '#E92E4E' }}>{`*`}</span>
            )}
          </div>
        )}
        <div
          className={`KTBaseTextField_Group rounded input-group ${
            !disabled && 'bg-white'
          }  d-flex flex-row  justify-content-between ${disabled && 'KTBaseTextField_Disabled'}`}
        >
          <input
            className={`ps-3 KTBaseTextField_Input w-100 rounded border-0 bg-transparent ${
              isError && 'is-invalid'
            } ${additionalInputClassName}`}
            id={name}
            disabled={disabled}
            type={currentType}
            name={name}
            placeholder={placeholder}
            spellCheck={spellCheck}
            {...fieldProps}
            autoComplete={autoComplete}
            style={disabled ? { color: '#4A5677', fontWeight: '500' } : {}}
          />
          {type === 'password' && fieldProps.value.length != 0 && (
            <div
              className="KTBaseTextField_Eye d-flex align-items-center justify-content-center cursor-pointer"
              onClick={handleShowPass}
            >
              <i className={`fas fa-eye${currentType === 'text' ? '-slash' : ''}`}></i>
            </div>
          )}
        </div>
        {text.length > 0 && <span className="form-text text-muted">{text}</span>}
        {isError && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KTBaseTextField;
