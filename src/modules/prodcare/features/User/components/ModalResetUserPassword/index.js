import userApi from 'api/userApi';
import { FastField, Formik } from 'formik';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { thunkGetListUser } from '../../userSlice';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import KTFormInput, {
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import Utils from 'shared/utils/Utils';

ModalResetUserPassword.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  userItem: PropTypes.object,
  onExistDone: PropTypes.func,
};

function ModalResetUserPassword({
  show = false,
  onClose = null,
  userItem = null,
  onExistDone = null,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  function handleClose() {
    if (onClose) {
      onClose();
    }
  }

  function handleExistDone() {
    if (onExistDone) {
      onExistDone();
    }
  }

  async function requestResetPassword(values) {
    try {
      let params = { ...values };
      params.password = Utils.sha256(params.password);
      const res = await userApi.updateUser(params);
      const { result } = res;
      if (result === 'success') {
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListUser(Global.gFiltersUserList));
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <Formik
        initialValues={{
          email: userItem ? userItem.email : '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={Yup.object({
          password: Yup.string()
            .required(t('Required'))
            .min(6, t('ThePasswordMustContainAtLeast6Characters'))
            .matches(/^\S*$/, t('ThePasswordMustNotContainWhitespace')),
          confirmPassword: Yup.string()
            .required(t('Required'))
            .oneOf([Yup.ref('password'), null], t('PasswordsDoNotMatch')),
        })}
        enableReinitialize
        onSubmit={(values) => {
          requestResetPassword(values);
        }}
      >
        {(formikProps) => (
          <Modal
            show={show}
            backdrop="static"
            size="lg"
            onHide={handleClose}
            centered
            onExit={formikProps.handleReset}
            onExited={handleExistDone}
            enforceFocus={false}
          >
            <Modal.Header className="px-5 py-5">
              <Modal.Title>{t('ResetPassword')}</Modal.Title>
              <div
                className="btn btn-xs btn-icon btn-light btn-hover-secondary cursor-pointer"
                onClick={handleClose}
              >
                <i className="far fa-times"></i>
              </div>
            </Modal.Header>

            <Modal.Body className="overflow-auto" style={{ maxHeight: '70vh' }}>
              <div className="row">
                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('NewPassword')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="password"
                    inputElement={
                      <FastField name="password">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            name={field.name}
                            value={field.value}
                            onChange={(value) => form.setFieldValue(field.name, value)}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            rows={5}
                            placeholder={`${_.capitalize(t('NewPassword'))}...`}
                            type={KTFormInputType.password}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('ReNewPassword')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="confirmPassword"
                    inputElement={
                      <FastField name="confirmPassword">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            name={field.name}
                            value={field.value}
                            onChange={(value) => form.setFieldValue(field.name, value)}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            rows={5}
                            placeholder={`${_.capitalize(t('ReNewPassword'))}...`}
                            type={KTFormInputType.password}
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
                  variant="primary"
                  onClick={formikProps.handleSubmit}
                >
                  {t('Save')}
                </Button>

                <Button
                  className="font-weight-bold flex-grow-1 col"
                  variant="secondary"
                  onClick={handleClose}
                >
                  {t('Close')}
                </Button>
              </div>
            </Modal.Footer>
          </Modal>
        )}
      </Formik>
    </div>
  );
}

export default ModalResetUserPassword;
