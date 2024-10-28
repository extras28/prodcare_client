import _ from 'lodash';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import KTTooltip from '../../KTTooltip';
import Utils from 'shared/utils/Utils';

KTImageInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  outlineStyle: PropTypes.bool,
  circleStyle: PropTypes.bool,
  acceptImageTypes: PropTypes.arrayOf(PropTypes.string),
  defaultImage: PropTypes.string,
  editable: PropTypes.bool,
  onSelectedFile: PropTypes.func,
  onRemovedFile: PropTypes.func,
  isAvatar: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  enableCheckValid: PropTypes.bool,
  isTouched: PropTypes.bool,
  isValid: PropTypes.bool,
  feedbackText: PropTypes.string,
  disabled: PropTypes.bool,
};

function KTImageInput({
  name,
  value = '',
  text = '',
  outlineStyle = true,
  circleStyle = false,
  acceptImageTypes = [],
  defaultImage = '',
  editable = false,
  onSelectedFile = null,
  onRemovedFile = null,
  isAvatar = true,
  onChange = null,
  onBlur = null,
  onFocus = null,
  enableCheckValid = false,
  isValid = true,
  isTouched = false,
  feedbackText = '',
  disabled = false,
  additionalClassName = '',
}) {
  const { t } = useTranslation();
  const isShowError = enableCheckValid && !isValid && isTouched && !_.isEmpty(feedbackText);

  function handleChange(e) {
    if (!_.isEmpty(value)) {
      URL.revokeObjectURL(value);
    }
    const images = e.target.files;
    if (images && images.length > 0) {
      const selectedImage = images[0];
      const imageInputValue = URL.createObjectURL(selectedImage);
      if (onChange) {
        onChange(imageInputValue);
      }
      if (onSelectedFile) {
        onSelectedFile(selectedImage);
      }
    }
    if (onFocus) {
      onFocus();
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

  function handleRemoveImage() {
    if (!_.isEmpty(value)) {
      URL.revokeObjectURL(value);
    }
    if (onChange) {
      onChange('');
    }
    if (onRemovedFile) {
      onRemovedFile();
    }
  }

  return (
    <div className="d-flex justify-content-center align-item-center">
      <div
        className={`image-input 
          ${outlineStyle ? 'image-input-outline' : ''} 
          ${circleStyle ? 'image-input-circle' : ''} 
          ${additionalClassName} 
          ${isAvatar ? '' : 'w-100'}
        `}
      >
        <div
          className={`image-input-wrapper ${isShowError ? 'border-1 border-danger' : ''}`}
          style={
            isAvatar
              ? {
                  backgroundImage: `url(${
                    !_.isEmpty(value) ? Utils.getFullUrl(value) : defaultImage
                  })`,
                }
              : {
                  maxWidth: '100%',
                  width: 'auto',
                  height: 'auto',
                }
          }
        >
          {!isAvatar && (
            <div
              className={`d-flex justify-content-center align-items-center ${
                _.isEmpty(value) ? 'py-10' : ''
              }`}
            >
              <img
                src={`${!_.isEmpty(value) ? Utils.getFullUrl(value) : defaultImage}`}
                style={{
                  objectFit: 'fill',
                  width: _.isEmpty(value) ? '30' : 'auto',
                  maxWidth: '100%',
                }}
              />
            </div>
          )}
        </div>
        {!disabled && (
          <KTTooltip text={t('Change')}>
            <label
              className="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
              data-action="change"
            >
              <i className="fa fa-pen icon-sm text-muted" />
              <input
                type="file"
                name={name}
                id={name}
                accept={_.join(acceptImageTypes, ', ')}
                onChange={handleChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
              />
              <input type="hidden" />
            </label>
          </KTTooltip>
        )}
        {editable && !_.isEmpty(value) && (
          <KTTooltip text={t('Remove')}>
            <span
              className="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
              data-action="remove"
              onClick={handleRemoveImage}
            >
              <i className="ki ki-bold-close icon-xs text-muted" />
            </span>
          </KTTooltip>
        )}
      </div>

      {isShowError && (
        <div className="fv-plugins-message-container">
          <div className="fv-help-block">{feedbackText}</div>
        </div>
      )}
      {!_.isEmpty(text) && <span className="form-text text-muted">{text}</span>}
    </div>
  );
}

export default KTImageInput;
