import eventApi from 'api/eventApi';
import productApi from 'api/productApi';
import { FastField, Formik } from 'formik';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KeenSelectOption from 'shared/components/OtherKeenComponents/Forms/KeenSelectOption';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import KTFormInput, {
  KTFormInputBTDPickerType,
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import Utils from 'shared/utils/Utils';
import * as Yup from 'yup';
import { thunkGetListProduct } from '../../productSlice';
import { thunkGetAllProduct } from 'app/appSlice';

function ModalEditProduct({
  customerId = null,
  show = false,
  onClose = null,
  productItem = null,
  onExistDone = null,
  customers = [],
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state?.auth);
  const isEditMode = !_.isNull(productItem);
  const [changeObj, setChangeObj] = useState({});

  function handleClose() {
    if (onClose) {
      onClose();
      setChangeObj({});
    }
  }

  function handleExistDone() {
    if (onExistDone) {
      onExistDone();
    }
  }

  async function createEvent(params) {
    try {
      await eventApi.createEvent({
        ...params,
        type: 'PRODUCT',
        projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function requestCreateProduct(values) {
    try {
      const params = { ...values };
      const res = await productApi.createProduct(params);
      if (res.result === 'success') {
        createEvent({
          subType: 'CREATE',
          productId: res?.product?.id,
          content: t('NewEquipment'),
        });
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListProduct(Global.gFiltersProductList));
        dispatch(
          thunkGetAllProduct({
            projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
          })
        );
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function requestUpdateProduct(values) {
    try {
      const params = { ...values };
      const res = await productApi.updateProduct(params);
      if (res.result === 'success') {
        createEvent({
          subType: 'EDIT',
          productId: values.productId,
          content: JSON.stringify({ title: t('EditEquipment'), ...changeObj }),
        });
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListProduct(Global.gFiltersProductList));
        dispatch(
          thunkGetAllProduct({
            projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
          })
        );
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Formik
      initialValues={{
        productId: productItem?.id || '',
        serial: productItem?.serial || '',
        name: productItem?.name || '',
        type: productItem?.type || 'HAND_OVER',
        customerId: productItem?.customer_id || customerId || '',
        projectId:
          productItem?.project_id ||
          JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
        // productionBatchesId: productItem?.production_batches_id || '',
        version: productItem?.version || '',
        // status: productItem?.status || '',
        mfg: productItem?.mfg ? Utils.formatDateTime(productItem?.mfg, 'YYYY-MM-DD') : '',
        handedOverTime: productItem?.handed_over_time
          ? Utils.formatDateTime(productItem?.handed_over_time, 'YYYY-MM-DD')
          : '',
      }}
      validationSchema={Yup.object({
        // productId: Yup.string().required(t('Required')),
        serial: Yup.string().required(t('Required')),
        name: Yup.string().required(t('Required')),
      })}
      enableReinitialize
      onSubmit={(values) => {
        if (isEditMode) {
          requestUpdateProduct(values);
        } else {
          requestCreateProduct(values);
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
            <Modal.Title>{productItem ? t('EditEquipment') : t('NewEquipment')}</Modal.Title>
            <div
              className="btn btn-xs btn-icon btn-light btn-hover-secondary cursor-pointer"
              onClick={handleClose}
            >
              <i className="far fa-times"></i>
            </div>
          </Modal.Header>

          <Modal.Body className="overflow-auto" style={{ maxHeight: '70vh' }}>
            <div className="row">
              {/* Serial */}
              <div className="col-12">
                <KTFormGroup
                  label={
                    <>
                      {t('Serial')} <span className="text-danger">*</span>
                    </>
                  }
                  inputName="serial"
                  inputElement={
                    <FastField name="serial">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => {
                            form.setFieldValue(field.name, value);
                            setChangeObj((prev) => {
                              return {
                                ...prev,
                                [`${t('Serial')}`]: `${productItem?.serial ?? ''} -> ${value}`,
                              };
                            });
                          }}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('Serial'))}...`}
                          type={KTFormInputType.text}
                          disabled={current?.role === 'GUEST'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* EquipmentName */}
              <div className="col-12">
                <KTFormGroup
                  label={
                    <>
                      {t('EquipmentName')} <span className="text-danger">*</span>
                    </>
                  }
                  inputName="name"
                  inputElement={
                    <FastField name="name">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => {
                            form.setFieldValue(field.name, value);
                            setChangeObj((prev) => {
                              return {
                                ...prev,
                                [`${t('EquipmentName')}`]: `${productItem?.name ?? ''} -> ${value}`,
                              };
                            });
                          }}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('EquipmentName'))}...`}
                          type={KTFormInputType.text}
                          disabled={current?.role === 'GUEST'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* customerId */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('Customer')}</>}
                  inputName="customerId"
                  inputElement={
                    <FastField name="customerId">
                      {({ field, form, meta }) => (
                        <KeenSelectOption
                          searchable={true}
                          fieldProps={field}
                          fieldHelpers={formikProps.getFieldHelpers(field.name)}
                          fieldMeta={meta}
                          name={field.name}
                          options={customers?.map((item) => {
                            return {
                              name: `${item?.military_region} - ${item.name}`,
                              value: item.id,
                            };
                          })}
                          onValueChanged={(newValue) => {
                            form.setFieldValue(field.name, newValue);
                            setChangeObj((prev) => {
                              return {
                                ...prev,
                                [`${t('Customer')}`]: `${
                                  customers.find((item) => item.id == productItem?.customer_id)
                                    ?.name ?? ''
                                } -> ${customers.find((item) => item.id == newValue)?.name}`,
                              };
                            });
                          }}
                          disabled={current?.role === 'GUEST'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* Mfg */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('Mfg')}</>}
                  inputName="mfg"
                  inputElement={
                    <FastField name="mfg">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => {
                            const isValidFormat = moment(value, 'YYYY-MM-DD', true).isValid();
                            if (isValidFormat) {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('Mfg')}`]: `${
                                    productItem?.mfg
                                      ? Utils.formatDateTime(productItem?.mfg, 'YYYY-MM-DD')
                                      : ''
                                  } -> ${Utils.formatDateTime(value, 'YYYY-MM-DD')}`,
                                };
                              });
                            }
                          }}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('Mfg'))}...`}
                          type={KTFormInputType.btdPicker}
                          btdPickerType={KTFormInputBTDPickerType.date}
                          disabled={current?.role === 'GUEST'}
                        />
                      )}
                    </FastField>
                  }
                />
              </div>

              {/* HandedOverTime */}
              <div className="col-12">
                <KTFormGroup
                  label={<>{t('HandedOverTime')}</>}
                  inputName="handedOverTime"
                  inputElement={
                    <FastField name="handedOverTime">
                      {({ field, form, meta }) => (
                        <KTFormInput
                          {...field}
                          onChange={(value) => {
                            const isValidFormat = moment(value, 'YYYY-MM-DD', true).isValid();
                            if (isValidFormat) {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('HandedOverTime')}`]: `${
                                    productItem?.handed_over_time
                                      ? Utils.formatDateTime(
                                          productItem?.handed_over_time,
                                          'YYYY-MM-DD'
                                        )
                                      : ''
                                  } -> ${Utils.formatDateTime(value, 'YYYY-MM-DD')}`,
                                };
                              });
                            }
                          }}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('HandedOverTime'))}...`}
                          type={KTFormInputType.btdPicker}
                          btdPickerType={KTFormInputBTDPickerType.date}
                          disabled={current?.role === 'GUEST'}
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

ModalEditProduct.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onRefreshProductList: PropTypes.func,
  productItem: PropTypes.object,
  onExistDone: PropTypes.func,
};

export default ModalEditProduct;
