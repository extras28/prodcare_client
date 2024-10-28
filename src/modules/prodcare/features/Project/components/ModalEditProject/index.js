import projectApi from 'api/projectApi';
import { FastField, Formik } from 'formik';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import KTFormInput, {
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import KTFormTextArea from 'shared/components/OtherKeenComponents/Forms/KTFormTextArea';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import * as Yup from 'yup';
import { thunkGetListProject } from '../../projectSlice';
import KTFormSelect from 'shared/components/OtherKeenComponents/Forms/KTFormSelect';
import KeenSelectOption from 'shared/components/OtherKeenComponents/Forms/KeenSelectOption';

function ModalEditProject({
  show = false,
  onClose = null,
  onRefreshProjectList = null,
  projectItem = null,
  onExistDone = null,
  users = [],
  customers = [],
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state?.auth);
  const isEditMode = !_.isNull(projectItem);

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

  async function requestCreateProject(values) {
    try {
      const params = { ...values };
      const res = await projectApi.createProject(params);
      if (res.result === 'success') {
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListProject(Global.gFiltersProjectList));
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function requestUpdateProject(values) {
    try {
      const params = { ...values };
      const res = await projectApi.updateProject(params);
      if (res.result === 'success') {
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListProject(Global.gFiltersProjectList));
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Formik
      initialValues={{
        projectId: projectItem?.id || '',
        projectPm: projectItem?.project_pm || '',
        projectName: projectItem?.project_name || '',
        note: projectItem?.note || '',
        customerIds: projectItem?.customer_id || '',
      }}
      validationSchema={Yup.object({
        projectId: Yup.string().required(t('Required')),
        projectName: Yup.string().required(t('Required')),
        // projectPm: Yup.string().required(t('Required')),
      })}
      enableReinitialize
      onSubmit={(values) => {
        if (isEditMode) {
          requestUpdateProject(values);
        } else {
          requestCreateProject(values);
        }
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
            <Modal.Title>{projectItem ? t('EditProduct') : t('NewProduct')}</Modal.Title>
            <div
              className="btn btn-xs btn-icon btn-light btn-hover-secondary cursor-pointer"
              onClick={handleClose}
            >
              <i className="far fa-times"></i>
            </div>
          </Modal.Header>

          <Modal.Body className="overflow-auto" style={{ maxHeight: '70vh' }}>
            <div className="row">
              {/* Id */}
              <div className="col-12">
                <KTFormGroup
                  label={
                    <>
                      {t('ProductId')} <span className="text-danger">*</span>
                    </>
                  }
                  inputName="projectId"
                  inputElement={
                    <FastField name="projectId">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('ProductId'))}...`}
                          type={KTFormInputType.text}
                          disabled={current?.role != 'ADMIN' || isEditMode}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* ProductName */}
              {
                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('ProductName')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="projectName"
                    inputElement={
                      <FastField name="projectName">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => form.setFieldValue(field.name, value)}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('ProductName'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role != 'ADMIN'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>
              }

              {/* Customer */}
              {/* <div className="col-12">
                <KTFormGroup
                  label={
                    <>
                      {t('Customer')} <span className="text-danger">*</span>
                    </>
                  }
                  inputName="customerIds"
                  inputElement={
                    <FastField name="customerIds">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          tagifyDataWhiteList={customers.map((item) => item.id)}
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('Customer'))}...`}
                          type={KTFormInputType.tagify}
                          disabled={current?.role != 'ADMIN' || isEditMode}
                        />
                      )}
                    </FastField>
                  }
                />
              </div> */}

              {/* ProjectPm */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('ProjectPm')}</>}
                  inputName="projectPm"
                  inputElement={
                    <FastField name="projectPm">
                      {({ field, form, meta }) => (
                        <KeenSelectOption
                          searchable={true}
                          fieldProps={field}
                          fieldHelpers={formikProps.getFieldHelpers(field.name)}
                          fieldMeta={meta}
                          name={field.name}
                          options={users?.map((item) => {
                            return {
                              name: item.name,
                              value: item.email,
                            };
                          })}
                          onValueChanged={(newValue) => {
                            form.setFieldValue(field.name, newValue);
                          }}
                          disabled={current?.role != 'ADMIN'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* Note */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('Note')}</>}
                  inputName="note"
                  inputElement={
                    <FastField name="note">
                      {({ field, form, meta }) => (
                        <KTFormTextArea
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('Note'))}...`}
                          type={KTFormInputType.text}
                          disabled={current?.role != 'ADMIN'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>
            </div>
          </Modal.Body>

          {current?.role !== 'ADMIN' ? null : (
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
          )}
        </Modal>
      )}
    </Formik>
  );
}

ModalEditProject.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onRefreshProjectList: PropTypes.func,
  projectItem: PropTypes.object,
  onExistDone: PropTypes.func,
};

export default ModalEditProject;
