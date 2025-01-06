import componentApi from 'api/componentApi';
import eventApi from 'api/eventApi';
import { thunkGetAllComponent, thunkGetAllProduct } from 'app/appSlice';
import { FastField, Field, Formik } from 'formik';
import _ from 'lodash';
import { thunkGetListProduct } from 'modules/prodcare/features/Product/productSlice';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KeenSelectOption from 'shared/components/OtherKeenComponents/Forms/KeenSelectOption';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import KTFormInput, {
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import KTFormTextArea from 'shared/components/OtherKeenComponents/Forms/KTFormTextArea';
import AppData from 'shared/constants/AppData';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import * as Yup from 'yup';
import { thunkGetListComponent } from '../../componentSlice';

function ModalEditComponent({
  show = false,
  onClose = null,
  componentItem = null,
  onExistDone = null,
  products = [],
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state?.auth);
  const isEditMode = !_.isNull(componentItem);
  const [componentParents, setComponentParents] = useState([]);
  const refFormik = useRef();
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
        type: 'COMPONENT',
        projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function requestCreateComponent(values) {
    try {
      const params = { ...values };
      const res = await componentApi.createComponent(params);
      if (res.result === 'success') {
        createEvent({
          subType: 'CREATE',
          componentId: res?.component?.id,
          content: t('NewComponent'),
        });
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListComponent(Global.gFiltersComponentList));
        dispatch(
          thunkGetAllComponent({
            projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
          })
        );
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

  async function requestUpdateComponent(values) {
    try {
      const params = { ...values };
      const res = await componentApi.updateComponent(params);
      if (res.result === 'success') {
        createEvent({
          subType: 'EDIT',
          componentId: values.componentId,
          content: JSON.stringify({
            title: t('EditComponent', { name: `${componentItem?.name}(${componentItem?.serial})` }),
            ...changeObj,
          }),
        });
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListComponent(Global.gFiltersComponentList));
        dispatch(
          thunkGetAllComponent({
            projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
          })
        );
        dispatch(thunkGetListProduct(Global.gFiltersProductList));
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getListComponentParent(level, productId) {
    try {
      const res = await componentApi.getListComponent({
        level,
        projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
        productId,
      });
      if (res.result == 'success') {
        setComponentParents(res.components);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (Number(componentItem?.['level'] > 1)) {
      getListComponentParent(componentItem?.level - 1);
    }
  }, [componentItem]);

  return (
    <Formik
      initialValues={{
        componentId: componentItem?.id || '',
        parentId: componentItem?.parent_id || '',
        productId: componentItem?.product_id || '',
        type: componentItem?.type || 'HARDWARE',
        serial: componentItem ? componentItem.serial : '',
        description: componentItem?.description || '',
        category: componentItem ? componentItem.category : '',
        level: componentItem ? String(componentItem.level) : '1',
        name: componentItem ? componentItem.name : '',
        version: componentItem ? componentItem.version : '',
        status: componentItem ? componentItem.status : 'USING',
      }}
      validationSchema={Yup.object({
        name: Yup.string().required(t('Required')),
        serial: Yup.string().required(t('Required')),
        productId: Yup.string().required(t('Required')),
      })}
      enableReinitialize
      onSubmit={(values) => {
        if (isEditMode) {
          requestUpdateComponent(values);
        } else {
          requestCreateComponent(values);
        }
      }}
    >
      {(formikProps) => {
        refFormik.current = formikProps;
        return (
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
              <Modal.Title>
                {componentItem
                  ? t('EditComponent', { name: componentItem?.name })
                  : t('NewComponent')}
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
                {/* ComponentName */}
                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('ComponentName')} <span className="text-danger">*</span>
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
                                  [`${t('ComponentName')}`]: `${
                                    componentItem?.name ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('ComponentName'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* serial */}
                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('Serial')} <span className="text-danger">*</span>{' '}
                      </>
                    }
                    inputName="serial"
                    inputElement={
                      <div>
                        <FastField name="serial">
                          {({ field, form, meta }) => (
                            <KTFormInput
                              {...field}
                              onChange={(value) => {
                                form.setFieldValue(field.name, value);
                                setChangeObj((prev) => {
                                  return {
                                    ...prev,
                                    [`${t('Serial')}`]: `${
                                      componentItem?.serial ?? ''
                                    } -> ${value}`,
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
                        <span style={{ fontSize: '10px' }}>
                          {`(${t(
                            'Nhập "thiếu serial" nếu chưa có thông tin serial của thành phần'
                          )})`}
                        </span>
                      </div>
                    }
                  />
                </div>

                {/* Product */}
                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('Product')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="productId"
                    inputElement={
                      <FastField name="productId">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={products?.map((item) => {
                              return {
                                name: `${item?.['name']} ${
                                  item?.serial ? '(' + item?.serial + ')' : ''
                                } ${
                                  item?.componentCount
                                    ? '(' +
                                      item?.componentCount +
                                      ' ' +
                                      _.lowerCase(t('Component')) +
                                      ')'
                                    : ''
                                }`,
                                value: item.id,
                              };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              getListComponentParent(
                                formikProps.getFieldProps('level').value - 1,
                                newValue
                              );
                              formikProps.getFieldHelpers('parentId').setValue('');
                              setChangeObj((prev) => {
                                const prevProd = products.find(
                                  (item) => item.id == componentItem?.product_id
                                );
                                const nextProd = products.find((item) => item.id == newValue);
                                return {
                                  ...prev,
                                  [`${t('Product')}`]: `${prevProd?.['name']} ${
                                    prevProd?.serial ? '(' + prevProd?.serial + ')' : ''
                                  } -> ${nextProd?.['name']} ${
                                    nextProd?.serial ? '(' + nextProd?.serial + ')' : ''
                                  }`,
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

                {/* ComponentType */}
                <div className="col-12">
                  <KTFormGroup
                    label={<>{t('ComponentType')}</>}
                    inputName="type"
                    inputElement={
                      <FastField name="type">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.componentType?.map((item) => {
                              return {
                                name: t(item.name),
                                value: item.value,
                              };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('ComponentType')}`]: `${t(
                                    AppData.componentType.find(
                                      (item) => item.value === componentItem?.['type']
                                    )?.name
                                  )} -> ${t(
                                    AppData.componentType.find((item) => item.value === newValue)
                                      ?.name
                                  )}`,
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

                {/* SoftwareVersion */}

                <div className="col-12">
                  <KTFormGroup
                    label={<>{t('SoftwareVersion')}</>}
                    inputName="version"
                    inputElement={
                      <FastField name="version">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('SoftwareVersion')}`]: `${
                                    componentItem?.version ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('SoftwareVersion'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* level */}
                <div className="col-12">
                  <KTFormGroup
                    label={<>{t('ComponentLevel')}</>}
                    inputName="level"
                    inputElement={
                      <Field name="level">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.urgencyPoints.map((item) => {
                              return { name: item.name, value: item.value };
                            })}
                            onValueChanged={(newValue) => {
                              getListComponentParent(
                                newValue - 1,
                                formikProps.getFieldProps('productId').value
                              );
                              const { componentLevel } = AppData;

                              // Find new urgency level and impact points
                              const newLevel = componentLevel.find((lv) => lv.value == newValue);
                              const curentLevel = componentLevel.find(
                                (lv) => lv.value == componentItem?.['level']
                              );

                              // Set form field values
                              form.setFieldValue(field.name, newValue);

                              // Update the change object
                              setChangeObj((prev) => ({
                                ...prev,

                                [`${t('ComponentLevel')}`]: `${t(curentLevel?.name)} -> ${t(
                                  newLevel?.name
                                )}`,
                              }));
                            }}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </Field>
                    }
                  />
                </div>

                {/* parentId */}
                {formikProps.getFieldProps('level').value > 1 ? (
                  <div className="col-12">
                    <KTFormGroup
                      label={
                        <>
                          {t('ComponentParent')} <span className="text-danger">*</span>
                        </>
                      }
                      inputName="parentId"
                      inputElement={
                        <Field name="parentId">
                          {({ field, form, meta }) => (
                            <KeenSelectOption
                              searchable={true}
                              fieldProps={field}
                              fieldHelpers={formikProps.getFieldHelpers(field.name)}
                              fieldMeta={meta}
                              name={field.name}
                              options={componentParents?.map((item) => {
                                return {
                                  name: `${item['name']} ${
                                    item?.serial ? '(' + item?.serial + ')' : ''
                                  }`,
                                  value: item?.id,
                                };
                              })}
                              onValueChanged={(newValue) => {
                                form.setFieldValue(field.name, newValue);
                                setChangeObj((prev) => {
                                  const prevPar = componentParents.find(
                                    (item) => item?.id == componentItem?.parent_id
                                  );
                                  const nextPar = componentParents.find(
                                    (item) => item.id == newValue
                                  );
                                  if (!formikProps.getFieldProps('productId').value) {
                                    const newParent = componentParents.find(
                                      (np) => np?.id == newValue
                                    );
                                    const newProduct = products.find(
                                      (np) => np.id == newParent?.product_id
                                    );

                                    formikProps
                                      .getFieldHelpers('productId')
                                      .setValue(newProduct?.id);
                                  }
                                  return {
                                    ...prev,
                                    [`${t('ComponentParent')}`]: `${prevPar?.['name']} ${
                                      prevPar?.serial ? '(' + prevPar?.serial + ')' : ''
                                    } -> ${nextPar?.['name']} ${
                                      nextPar?.serial ? '(' + nextPar?.serial + ')' : ''
                                    }`,
                                  };
                                });
                              }}
                              disabled={current?.role === 'GUEST'}
                            />
                          )}
                        </Field>
                      }
                    />
                  </div>
                ) : null}

                {/* status */}
                <div className="col-12">
                  <KTFormGroup
                    label={<>{t('CurrentStatus')}</>}
                    inputName="status"
                    inputElement={
                      <FastField name="status">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            searchable={false}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.productCurrentStatus?.map((item) => {
                              return {
                                name: t(item.name),
                                value: item.value,
                              };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('CurrentStatus')}`]: `${
                                    t(
                                      AppData.productCurrentStatus.find(
                                        (item) => item.value == componentItem?.status
                                      )?.name
                                    ) ?? ''
                                  } -> ${t(
                                    AppData.productCurrentStatus.find(
                                      (item) => item.value == newValue
                                    )?.name
                                  )}`,
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

                {/* Description */}
                <div className="col-12">
                  <KTFormGroup
                    label={<>{t('Description')}</>}
                    inputName="description"
                    inputElement={
                      <FastField name="description">
                        {({ field, form, meta }) => (
                          <KTFormTextArea
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('Description')}`]: `${
                                    componentItem?.description ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('Description'))}...`}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>
              </div>
            </Modal.Body>

            {current?.role !== 'GUEST' ? (
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
            ) : null}
          </Modal>
        );
      }}
    </Formik>
  );
}

ModalEditComponent.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onRefreshComponentList: PropTypes.func,
  componentItem: PropTypes.object,
  onExistDone: PropTypes.func,
};

export default ModalEditComponent;
