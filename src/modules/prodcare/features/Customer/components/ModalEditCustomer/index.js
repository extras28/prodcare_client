import customerApi from 'api/customerApi';
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
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import * as Yup from 'yup';
import { thunkGetListCustomer } from '../../customerSlice';
import { thunkGetAllCustomer } from 'app/appSlice';

function ModalEditCustomer({
  show = false,
  onClose = null,
  customerItem = null,
  onExistDone = null,
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state?.auth);
  const isEditMode = !_.isNull(customerItem);

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

  async function requestCreateCustomer(values) {
    try {
      const params = { ...values };
      const res = await customerApi.createCustomer(params);
      if (res.result === 'success') {
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListCustomer(Global.gFiltersCustomerList));
        dispatch(thunkGetAllCustomer());
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function requestUpdateCustomer(values) {
    try {
      const params = { ...values };
      const res = await customerApi.updateCustomer(params);
      if (res.result === 'success') {
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListCustomer(Global.gFiltersCustomerList));
        dispatch(thunkGetAllCustomer());
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Formik
      initialValues={{
        id: customerItem?.id || '',
        sign: customerItem?.sign || '',
        militaryRegion: customerItem?.military_region || '',
        name: customerItem?.name || '',
        contactPersonName: customerItem?.contact_person_name || '',
        contactPersonTitle: customerItem ? customerItem.contact_person_title : '',
        codeNumber: customerItem ? customerItem.code_number : '',
        phone: customerItem ? customerItem.phone : '',
        address: customerItem ? customerItem.address : '',
      }}
      validationSchema={Yup.object({
        sign: Yup.string().required(t('Required')),
        name: Yup.string().required(t('Required')),
        // militaryRegion: Yup.string().required(t('Required')),
        // phone: Yup.string().matches(/^[0-9]+$/, t('PhoneMustBeAllNumbers')),
      })}
      enableReinitialize
      onSubmit={(values) => {
        if (isEditMode) {
          requestUpdateCustomer(values);
        } else {
          requestCreateCustomer(values);
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
            <Modal.Title>{customerItem ? t('EditCustomer') : t('NewCustomer')}</Modal.Title>
            <div
              className="btn btn-xs btn-icon btn-light btn-hover-secondary cursor-pointer"
              onClick={handleClose}
            >
              <i className="far fa-times"></i>
            </div>
          </Modal.Header>

          <Modal.Body className="overflow-auto" style={{ maxHeight: '70vh' }}>
            <div className="row">
              {/* sign */}
              <div className="col-12">
                <KTFormGroup
                  label={
                    <>
                      {t('Sign')} <span className="text-danger">*</span>
                    </>
                  }
                  inputName="sign"
                  inputElement={
                    <FastField name="sign">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('Sign'))}...`}
                          type={KTFormInputType.text}
                          disabled={current?.role != 'ADMIN' || isEditMode}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* CustomerUnitName */}
              {
                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('CustomerUnitName')} <span className="text-danger">*</span>
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
                            placeholder={`${_.capitalize(t('CustomerUnitName'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role != 'ADMIN'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>
              }

              {/* ManagingAuthority */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('ManagingAuthority')}</>}
                  inputName="militaryRegion"
                  inputElement={
                    <FastField name="militaryRegion">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('ManagingAuthority'))}...`}
                          type={KTFormInputType.text}
                          disabled={current?.role != 'ADMIN'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* contactPersonName */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('ContactPersonName')}</>}
                  inputName="contactPersonName"
                  inputElement={
                    <FastField name="contactPersonName">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('ContactPersonName'))}...`}
                          type={KTFormInputType.text}
                          disabled={current?.role != 'ADMIN'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* contactPersonTitle */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('Title')}</>}
                  inputName="contactPersonTitle"
                  inputElement={
                    <FastField name="contactPersonTitle">
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

              {/* CodeNumber */}
              {/* <div className="col-12">
                <KTFormGroup
                  label={<>{t('CodeNumber')}</>}
                  inputName="codeNumber"
                  inputElement={
                    <FastField name="codeNumber">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('CodeNumber'))}...`}
                          type={KTFormInputType.text}
                          disabled={current?.role != 'ADMIN'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div> */}

              {/* Phone */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('Phone')}</>}
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

              {/* Address */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('Address')}</>}
                  inputName="address"
                  inputElement={
                    <FastField name="address">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('Address'))}...`}
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

          {current?.role !== 'ADMIN' && current?.role !== 'OPERATOR' ? null : (
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

ModalEditCustomer.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onRefreshCustomerList: PropTypes.func,
  customerItem: PropTypes.object,
  onExistDone: PropTypes.func,
};

export default ModalEditCustomer;
