import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

KTFormGroup.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  inputName: PropTypes.string,
  inputElement: PropTypes.element,
  additionalClassName: PropTypes.string,
  additionalLabelClassName: PropTypes.string,
  labelAdditionalComponent: PropTypes.element,
};

function KTFormGroup({
  label = '',
  inputName = '',
  inputElement = <></>,
  additionalClassName = '',
  additionalLabelClassName = '',
  labelAdditionalComponent = null,
}) {
  return (
    <div className={`form-group ${additionalClassName}`}>
      <div className="d-flex justify-content-between">
        {label && (
          <label htmlFor={inputName} className={additionalLabelClassName}>
            {label}
          </label>
        )}
        {!_.isNull(labelAdditionalComponent) && labelAdditionalComponent}
      </div>
      {inputElement}
    </div>
  );
}

export default KTFormGroup;
