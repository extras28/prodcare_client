import authApi from 'api/authApi';
import { FastField, Formik } from 'formik';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import KTFormInput, {
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import ToastHelper from 'shared/helpers/ToastHelper';
import Utils from 'shared/utils/Utils';
import * as Yup from 'yup';

ModalChangePassword.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
};

function ModalChangePassword({ show = false, onClose = null }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // MARK: --- Functions ---
  function handleClose() {
    if (onClose) {
      onClose();
    }
  }

  async function requestChangePassword(params) {
    params.oldPassword = Utils.sha256(params.oldPassword);
    params.newPassword = Utils.sha256(params.newPassword);
    try {
      setLoading(true);
      const res = await authApi.changePassword(params);
      const { result } = res;
      if (result === 'success') {
        ToastHelper.showSuccess(t('Success'));
        handleClose();
      }
      setLoading(false);
    } catch (error) {
      console.log('Change password error: ' + error.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <Formik
        initialValues={{
          oldPassword: '',
          newPassword: '',
          reNewPassword: '',
        }}
        validationSchema={Yup.object({
          oldPassword: Yup.string().required(t('PasswordIsRequired')),
          newPassword: Yup.string()
            .required(t('NewPasswordIsRequired'))
            .min(6, t('Short_Password')),
          reNewPassword: Yup.string()
            .required(t('ReNewPasswordIsRequired'))
            .oneOf([Yup.ref('newPassword')], t('NewPasswordNotMatch')),
        })}
        enableReinitialize
        onSubmit={(values) => {
          requestChangePassword(values);
        }}
      >
        {(formikProps) => (
          <Modal show={show} onHide={handleClose} centered onExit={formikProps.handleReset}>
            <Modal.Header>
              <Modal.Title>{t('ChangePassword')}</Modal.Title>
              <div
                className="btn btn-xs btn-icon btn-light btn-hover-secondary cursor-pointer"
                onClick={handleClose}
              >
                <i className="far fa-times"></i>
              </div>
            </Modal.Header>

            <Modal.Body>
              <div className="row">
                {/* Old Password */}
                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('OldPassword')} <span className="text-danger">(*)</span>
                      </>
                    }
                    inputName="oldPassword"
                    inputElement={
                      <FastField name="oldPassword">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => form.setFieldValue(field.name, value)}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            type={KTFormInputType.password}
                            placeholder={`${_.capitalize(t('OldPassword'))}...`}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>
                {/* New Password */}
                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('NewPassword')} <span className="text-danger">(*)</span>
                      </>
                    }
                    inputName="newPassword"
                    inputElement={
                      <FastField name="newPassword">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => form.setFieldValue(field.name, value)}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            type={KTFormInputType.password}
                            placeholder={`${_.capitalize(t('NewPassword'))}...`}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>
                {/* Re-enter New Password */}
                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('ReNewPassword')} <span className="text-danger">(*)</span>
                      </>
                    }
                    inputName="reNewPassword"
                    inputElement={
                      <FastField name="reNewPassword">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => form.setFieldValue(field.name, value)}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            type={KTFormInputType.password}
                            placeholder={`${_.capitalize(t('ReNewPassword'))}...`}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <div className="w-100 d-flex row">
                <Button
                  className="font-weight-bold flex-grow-1 col mr-3"
                  variant="secondary"
                  onClick={handleClose}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  className={`font-weight-bold flex-grow-1 col ml-3 ${loading ? 'disabled' : ''}`}
                  variant="primary"
                  onClick={formikProps.handleSubmit}
                >
                  {loading ? t('PleaseWait') : t('Change')}
                </Button>
              </div>
            </Modal.Footer>
          </Modal>
        )}
      </Formik>
    </div>
  );
}

export default ModalChangePassword;
