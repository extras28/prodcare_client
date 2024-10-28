import issueApi from 'api/issueApi';
import { FastField, Formik } from 'formik';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KTUploadFiles from 'shared/components/OtherKeenComponents/FileUpload/KTUploadFiles';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import * as Yup from 'yup';
import { thunkGetListIssue } from '../../issueSlice';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import Loading from 'shared/components/Loading';
import { useState } from 'react';

function ModalUploadIssueFile({ show = false, onClose = null, onExistDone = null }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state?.auth);
  const [loading, setLoading] = useState(false);

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

  async function requestUploadIssueFile(values) {
    setLoading(true);
    try {
      const params = { ...values };
      const res = await issueApi.uploadFile(params);
      if (res.result === 'success') {
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListIssue(Global.gFiltersIssueList));
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  return (
    <Formik
      initialValues={{
        file: null,
        projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
      }}
      validationSchema={Yup.object({
        file: Yup.string().required(t('NoFileSelectedYet')),
      })}
      enableReinitialize
      onSubmit={(values) => {
        requestUploadIssueFile(values);
      }}
    >
      {(formikProps) => (
        <Modal
          show={show}
          backdrop="static"
          size="md"
          onHide={handleClose}
          centered
          onExit={formikProps.handleReset}
          onExited={handleExistDone}
          enforceFocus={false}
        >
          <Modal.Header className="px-5 py-5">
            <Modal.Title>
              {t('Upload')}{' '}
              {loading ? (
                <span className="ml-4 spinner spinner-loader spinner-primary"></span>
              ) : null}
            </Modal.Title>
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
                  // label={
                  //   <>
                  //     {t('Project')} <span className="text-danger">*</span>
                  //   </>
                  // }
                  inputName="file"
                  additionalClassName="m-0"
                  inputElement={
                    <FastField name="file">
                      {({ field, form, meta }) => (
                        <KTUploadFiles
                          {...field}
                          value={field.value?.toString()}
                          onRemovedFile={() => form.setFieldValue(field.name, null)}
                          onSelectedFile={(file) => form.setFieldValue(field.name, file)}
                          buttonText={t('ChooseFile')}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          disabled={current?.role !== 'USER' && current?.role !== 'ADMIN'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>
            </div>
          </Modal.Body>

          {current?.role === 'GUEST' ? null : (
            <Modal.Footer>
              <div className="w-100 d-flex row">
                <Button
                  className="font-weight-bold flex-grow-1 col mr-3"
                  variant="primary"
                  onClick={formikProps.handleSubmit}
                >
                  {t('Upload')}
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
          )}
        </Modal>
      )}
    </Formik>
  );
}

ModalUploadIssueFile.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onRefreshIssueList: PropTypes.func,
  onExistDone: PropTypes.func,
};

export default ModalUploadIssueFile;
