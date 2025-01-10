import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

/**
 *
 * @param {{
 * text?: string,
 * buttonText?: string,
 * onClickButton?: function,
 * buttonIcon?: string,
 * imageEmpty?: string|element,
 * visible?: boolean,
 * imageEmptyPercentWidth?: number,
 * }} props
 * @returns
 */
function Empty({
  text = 'No data to display',
  buttonText = 'Refresh',
  onClickButton = null,
  buttonIcon = 'fad fa-redo-alt',
  imageEmpty = '',
  visible = true,
  imageEmptyPercentWidth = 30,
}) {
  const handleButtonClick = () => {
    if (onClickButton) {
      onClickButton();
    }
  };

  return (
    <div className="d-flex flex-column align-items-center">
      {!_.isEmpty(imageEmpty) && (
        <img
          alt="empty"
          src={imageEmpty}
          style={{
            width: `${imageEmptyPercentWidth}%`,
          }}
        />
      )}
      <p className="text-dark-50 font-size-lg mt-4">{text}</p>
      <a
        href="#"
        onClick={handleButtonClick}
        className={`btn btn-xs btn-light-primary font-weight-bolder py-2 px-3 ${
          visible ? '' : 'd-none'
        }`}
      >
        <i className={`${buttonIcon} mr-2`}></i>
        {buttonText}
      </a>
    </div>
  );
}

Empty.propTypes = {
  text: PropTypes.string,
  buttonText: PropTypes.string,
  onClickButton: PropTypes.func,
  buttonIcon: PropTypes.string,
  imageEmpty: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  visible: PropTypes.bool,
  imageEmptyPercentWidth: PropTypes.number,
};

export default Empty;
