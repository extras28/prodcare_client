import componentApi from 'api/componentApi';
import { FastField, Field, Formik } from 'formik';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
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
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import * as Yup from 'yup';
import { thunkGetListComponent } from '../../componentSlice';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import eventApi from 'api/eventApi';
import { thunkGetAllComponent } from 'app/appSlice';

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
          content: JSON.stringify({ title: t('EditComponent'), ...changeObj }),
        });
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListComponent(Global.gFiltersComponentList));
        dispatch(
          thunkGetAllComponent({
            projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
          })
        );
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getListComponentParent(level) {
    try {
      const res = await componentApi.getListComponent({
        level,
        projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
      });
      if (res.result == 'success') {
        setComponentParents(res.components);
      }
    } catch (error) {
      console.error(error);
    }
  }

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
              <Modal.Title>{componentItem ? t('EditComponent') : t('NewComponent')}</Modal.Title>
              <div
                className="btn btn-xs btn-icon btn-light btn-hover-secondary cursor-pointer"
                onClick={handleClose}
              >
                <i className="far fa-times"></i>
              </div>
            </Modal.Header>

            <Modal.Body className="overflow-auto" style={{ maxHeight: '70vh' }}>
              <div className="row">
                {/* id */}
                {/* <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('ID')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="componentId"
                    inputElement={
                      <FastField name="componentId">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => form.setFieldValue(field.name, value)}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('ID'))}...`}
                            type={KTFormInputType.text}
                            disabled={
                              (current?.role !== 'USER' && current?.role !== 'ADMIN') || isEditMode
                            }
                          />
                        )}
                      </FastField>
                    }
                  />
                </div> */}

                {/* ComponentName */}
                {
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
                              disabled={current?.role !== 'USER' && current?.role !== 'ADMIN'}
                            />
                          )}
                        </FastField>
                      }
                    />
                  </div>
                }

                {/* serial */}
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
                                  [`${t('Serial')}`]: `${componentItem?.serial ?? ''} -> ${value}`,
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
                            disabled={current?.role !== 'USER' && current?.role !== 'ADMIN'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* Equipment */}
                <div className="col-12">
                  <KTFormGroup
                    label={
                      <>
                        {t('Equipment')} <span className="text-danger">*</span>
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
                                }`,
                                value: item.id,
                              };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                const prevProd = products.find(
                                  (item) => item.id == componentItem?.product_id
                                );
                                const nextProd = products.find((item) => item.id == newValue);
                                return {
                                  ...prev,
                                  [`${t('Equipment')}`]: `${prevProd?.['name']} ${
                                    prevProd?.serial ? '(' + prevProd?.serial + ')' : ''
                                  } -> ${nextProd?.['name']} ${
                                    nextProd?.serial ? '(' + nextProd?.serial + ')' : ''
                                  }`,
                                };
                              });
                            }}
                            disabled={current?.role !== 'USER' && current?.role !== 'ADMIN'}
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
                                    AppData.responsibleType.find(
                                      (item) => item.value === componentItem?.['type']
                                    )?.name
                                  )} -> ${t(
                                    AppData.responsibleType.find((item) => item.value === newValue)
                                      ?.name
                                  )}`,
                                };
                              });
                            }}
                            disabled={current?.role !== 'USER' && current?.role !== 'ADMIN'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* Version */}
                {formikProps.getFieldProps('type').value === 'SOFTWARE' ? (
                  <div className="col-12">
                    <KTFormGroup
                      label={<>{t('Version')}</>}
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
                                    [`${t('Version')}`]: `${
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
                              placeholder={`${_.capitalize(t('Version'))}...`}
                              type={KTFormInputType.text}
                              disabled={current?.role !== 'USER' && current?.role !== 'ADMIN'}
                            />
                          )}
                        </FastField>
                      }
                    />
                  </div>
                ) : null}

                {/* level */}
                <div className="col-12">
                  <KTFormGroup
                    label={<>{t('ComponentLevel')}</>}
                    inputName="level"
                    inputElement={
                      <Field name="level">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => {
                              getListComponentParent(value - 1);
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('ComponentLevel')}`]: `${
                                    componentItem?.level ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('ComponentLevel'))}...`}
                            type={KTFormInputType.number}
                            disabled={current?.role !== 'USER' && current?.role !== 'ADMIN'}
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
                                  value: item.id,
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
                              disabled={current?.role !== 'USER' && current?.role !== 'ADMIN'}
                            />
                          )}
                        </Field>
                      }
                    />
                  </div>
                ) : null}

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
                            disabled={current?.role !== 'USER' && current?.role !== 'ADMIN'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>
              </div>
            </Modal.Body>

            {current?.role === 'ADMIN' || current?.role === 'USER' ? (
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
