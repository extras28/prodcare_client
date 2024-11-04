import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

SearchBarNoFormik.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  onSubmit: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  containerStyle: PropTypes.string,
  onDone: PropTypes.func,
  value: PropTypes.string,
};

function SearchBarNoFormik({
  type = 'text',
  name,
  placeholder = '',
  disabled = false,
  onSubmit = null,
  onBlur = null,
  onFocus = null,
  containerStyle = 'mr-2',
  onDone = null,
  value = '',
}) {
  // MARK: --- Params ---
  const typingTimeoutRef = useRef(null);
  const { t } = useTranslation();
  const [buttonDoneVisible, setButtonDoneVisible] = useState(false);

  // MARK: --- Functions ---
  function handleTextChanged(e) {
    const value = e.target.value;

    if (!onSubmit) {
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      const formValues = {
        searchTerm: value,
      };
      onSubmit(formValues);
    }, 500);
  }

  function handleBlur() {
    if (onBlur) {
      onBlur();
    }
    // setButtonDoneVisible(false);
  }

  function handleFocus() {
    if (onFocus) {
      onFocus();
    }
    // setButtonDoneVisible(true);
  }

  return (
    <div className="d-flex">
      <div className={`input-icon ${containerStyle}`}>
        <input
          id={name}
          type={type}
          className="form-control"
          placeholder={placeholder}
          autoComplete="off"
          onChange={handleTextChanged}
          onBlur={handleBlur}
          onFocus={handleFocus}
          defaultValue={value}
        />
        <span>
          <i className="fal fa-search text-muted ml-2"></i>
        </span>
      </div>
      {buttonDoneVisible && (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (onDone) {
              onDone();
            }
          }}
          className="btn btn-light-primary font-weight-bold d-flex align-items-center ml-2"
        >
          {t('Done')}
        </a>
      )}
    </div>
  );
}

export default SearchBarNoFormik;
