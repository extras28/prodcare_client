import PropTypes from 'prop-types';
import React, { useState } from 'react';
import './style.scss';
import AppResource from 'shared/constants/AppResource';

/**
 * 
 * @param {{
 * field: object.isRequired,
 * form: object.isRequired,
 * type?: string,
 * label?: string,
 * appendLabelElement?: element,
 * placeholder?: string,
 * disabled?: boolean,
 * }} props 
 * @returns 
 */
function BigInputField({
    field,
    form,
    type = 'text',
    label = '',
    appendLabelElement = <></>,
    placeholder = '',
    disabled = false,
}) {
    const { name } = field;
    const { errors, touched } = form;
    const showError = (errors[name] && touched[name]) ?? false;

    const [currentType, setCurrentType] = useState(type);

    function handleShowPass() {
        setCurrentType(currentType === 'password' ? 'text' : 'password');
    }

    return (
        <div className="form-group fv-plugins-icon-container">
            <div className='d-flex flex-row align-items-center justify-content-between'>
                <label
                    className="font-size-h6 font-weight-bolder mb-2"
                    htmlFor={name}
                    style={{
                        color: AppResource.colors.darkGrey
                    }}
                >
                    {label}
                </label>
                {appendLabelElement && appendLabelElement}
            </div>

            <div className='BigInputField'>
                <input
                    className={`form-control h-auto py-6 rounded-lg ${showError ? 'is-invalid' : (touched[name] ? '' : '')}`}
                    id={name}
                    {...field}
                    type={currentType}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete="new-password"
                />
                {(type === 'password' && field.value.length !== 0) && (
                    <div
                        className="BigInputField_Eye d-flex align-items-center justify-content-center cursor-pointer"
                        onClick={handleShowPass}
                    >
                        <i className={`fas fa-eye${currentType === 'text' ? '-slash' : ''}`}></i>
                    </div>
                )}
            </div>

            {/* <div className="fv-plugins-message-container">
                <div className="fv-help-block" style={{
                    color: AppResource.colors.grey50
                }}>
                    {errors[name]}
                </div>
            </div> */}
        </div>
    );
}

BigInputField.propTypes = {
    field: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    type: PropTypes.string,
    label: PropTypes.string,
    appendLabelElement: PropTypes.element,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
};

export default BigInputField;
