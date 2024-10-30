import userApi from 'api/userApi';
import { FastField, Formik } from 'formik';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KTImageInput from 'shared/components/OtherKeenComponents/FileUpload/KTImageInput';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import KTFormInput, {
  KTFormInputBTDPickerType,
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import AppConfigs from 'shared/constants/AppConfigs';
import AppData from 'shared/constants/AppData';
import AppResource from 'shared/constants/AppResource';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import Utils from 'shared/utils/Utils';
import * as Yup from 'yup';
import { thunkGetListUser } from '../../userSlice';
import KeenSelectOption from 'shared/components/OtherKeenComponents/Forms/KeenSelectOption';

function ModalEditUser({
  show = false,
  onClose = null,
  onRefreshUserList = null,
  userItem = null,
  onExistDone = null,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state?.auth);
  const isEditMode = !_.isNull(userItem);

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

  async function requestCreateUser(values) {
    try {
      const params = { ...values, password: Utils.sha256(values.password) };
      const res = await userApi.createUser(params);
      if (res.result === 'success') {
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListUser(Global.gFiltersUserList));
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function requestUpdateUser(values) {
    try {
      const params = { ...values };
      const res = await userApi.updateUser(params);
      if (res.result === 'success') {
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListUser(Global.gFiltersUserList));
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Formik
      initialValues={{
        email: userItem?.email || '',
        name: userItem?.name || '',
        employeeId: userItem?.employee_id || '',
        phone: userItem?.phone || '',
        title: userItem ? userItem.title : '',
        role: userItem ? userItem.role : 'USER',
        dob: userItem?.dob ? Utils.formatDateTime(userItem.dob, 'YYYY-MM-DD') : '',
        avatar: userItem?.avatar || '',
        avatarLink: userItem ? userItem.avatar : null,
      }}
      validationSchema={Yup.object({
        email: Yup.string()
          .email(t('InvalidEmail')) // Kiểm tra định dạng email hợp lệ
          .matches(/^[a-zA-Z0-9._%+-]+@viettel\.com\.vn$/, t('InvalidEmail')) // Kiểm tra định dạng email cụ thể
          .required(t('Required')),
        name: Yup.string().required(t('Required')),
        employeeId: Yup.string().required(t('Required')),
        dob: Yup.string().required(t('Required')),
        password: isEditMode
          ? null
          : Yup.string()
              .required(t('Required'))
              .min(6, t('ThePasswordMustContainAtLeast6Characters'))
              .matches(/^\S*$/, t('ThePasswordMustNotContainWhitespace')),
        phone: Yup.string().required(t('Required')),
      })}
      enableReinitialize
      onSubmit={(values) => {
        if (isEditMode) {
          requestUpdateUser(values);
        } else {
          requestCreateUser(values);
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
            <Modal.Title>{userItem ? t('EditUser') : t('NewUser')}</Modal.Title>
            <div
              className="btn btn-xs btn-icon btn-light btn-hover-secondary cursor-pointer"
              onClick={handleClose}
            >
              <i className="far fa-times"></i>
            </div>
          </Modal.Header>

          <Modal.Body className="overflow-auto" style={{ maxHeight: '70vh' }}>
            <div className="row">
              {/* Avatar */}
              <div className="col-12 ">
                <KTFormGroup
                  // label={
                  //   <>
                  //     {t('Avatar')} <span className="text-danger">*</span>
                  //   </>
                  // }
                  inputName="avatarLink"
                  inputElement={
                    <FastField name="avatarLink">
                      {({ field, form, meta }) => (
                        <KTImageInput
                          defaultImage={AppResource.images.imgDefaultAvatar}
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          acceptImageTypes={AppConfigs.acceptImages}
                          onSelectedFile={(file) => form.setFieldValue('avatar', file)}
                          onRemovedFile={() => form.setFieldValue('avatar', null)}
                          disabled={current?.role != 'ADMIN'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>
              {/* Email */}
              <div className="col-12">
                <KTFormGroup
                  label={
                    <>
                      {t('Email')} <span className="text-danger">*</span>
                    </>
                  }
                  inputName="email"
                  inputElement={
                    <FastField name="email">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('Email'))}...`}
                          type={KTFormInputType.text}
                          disabled={current?.role != 'ADMIN' || isEditMode}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* Password */}
              {!isEditMode && (
                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('Password')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="password"
                    inputElement={
                      <FastField name="password">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => form.setFieldValue(field.name, value)}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('Password'))}...`}
                            type={KTFormInputType.password}
                            disabled={current?.role != 'ADMIN'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>
              )}

              {/* EmployeeId */}
              <div className="col-12">
                <KTFormGroup
                  label={
                    <>
                      {t('EmployeeId')} <span className="text-danger">*</span>
                    </>
                  }
                  inputName="employeeId"
                  inputElement={
                    <FastField name="employeeId">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('EmployeeId'))}...`}
                          type={KTFormInputType.text}
                          disabled={current?.role != 'ADMIN'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* Fullname */}
              <div className="col-12">
                <KTFormGroup
                  label={
                    <>
                      {t('Fullname')} <span className="text-danger">*</span>
                    </>
                  }
                  inputName="name"
                  inputElement={
                    <FastField name="name">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('Fullname'))}...`}
                          type={KTFormInputType.text}
                          disabled={current?.role != 'ADMIN'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* DateOfBirth */}
              <div className="col-12">
                <KTFormGroup
                  label={
                    <>
                      {t('DateOfBirth')} <span className="text-danger">*</span>
                    </>
                  }
                  inputName="dob"
                  inputElement={
                    <FastField name="dob">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => {
                            const isValidFormat = moment(value, 'YYYY-MM-DD', true).isValid();
                            if (isValidFormat) {
                              form.setFieldValue(field.name, value);
                            }
                          }}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('DateOfBirth'))}...`}
                          type={KTFormInputType.btdPicker}
                          btdPickerType={KTFormInputBTDPickerType.date}
                          disabled={current?.role != 'ADMIN'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* Phone */}
              <div className="col-12">
                <KTFormGroup
                  label={
                    <>
                      {t('Phone')} <span className="text-danger">*</span>
                    </>
                  }
                  inputName="phone"
                  inputElement={
                    <FastField name="phone">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('Phone'))}...`}
                          type={KTFormInputType.telephone}
                          disabled={current?.role != 'ADMIN'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* Role */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('Role')}</>}
                  inputName="role"
                  inputElement={
                    <FastField name="role">
                      {({ field, form, meta }) => (
                        <KeenSelectOption
                          searchable={true}
                          fieldProps={field}
                          fieldHelpers={formikProps.getFieldHelpers(field.name)}
                          fieldMeta={meta}
                          name={field.name}
                          options={AppData.userRole?.map((item) => {
                            return {
                              name: t(item.name),
                              value: item.value,
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

              {/* Title */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('Title')}</>}
                  inputName="title"
                  inputElement={
                    <FastField name="title">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('Title'))}...`}
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

ModalEditUser.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onRefreshUserList: PropTypes.func,
  userItem: PropTypes.object,
  onExistDone: PropTypes.func,
};

export default ModalEditUser;
