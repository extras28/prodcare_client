import eventApi from 'api/eventApi';
import issueApi from 'api/issueApi';
import { thunkGetAllReason } from 'app/appSlice';
import { FastField, Field, Formik } from 'formik';
import useRouter from 'hooks/useRouter';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KeenSelectOption from 'shared/components/OtherKeenComponents/Forms/KeenSelectOption';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import KTFormInput, {
  KTFormInputBTDPickerType,
  KTFormInputType,
} from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import KTFormTextArea from 'shared/components/OtherKeenComponents/Forms/KTFormTextArea';
import AppData from 'shared/constants/AppData';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import Utils from 'shared/utils/Utils';
import * as Yup from 'yup';
import { thunkGetListIssue } from '../../issueSlice';

function ModalEditIssue({
  components = [],
  customers = [],
  products = [],
  show = false,
  onClose = null,
  issueItem = null,
  onExistDone = null,
  productId = null,
  reasons = [],
  users = [],
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state?.auth);
  const isEditMode = !_.isNull(issueItem);
  const [changeObj, setChangeObj] = useState({});
  const refFormik = useRef(null);
  const router = useRouter();

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
        type: 'ISSUE',
        projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function requestCreateIssue(values) {
    try {
      const params = { ...values };
      if (!params.stopFighting) delete params.stopFightingDays;
      const res = await issueApi.createIssue(params);
      if (res.result === 'success') {
        createEvent({
          subType: 'CREATE',
          issueId: res?.issue?.id,
          content: t('NewIssue'),
        });
        if (!!params.reason) {
          dispatch(
            thunkGetAllReason({
              projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
            })
          );
        }
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListIssue(Global.gFiltersIssueList));
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function requestUpdateIssue(values) {
    try {
      const params = { ...values };
      if (!params.stopFighting) delete params.stopFightingDays;
      const res = await issueApi.updateIssue(params);
      if (res.result === 'success') {
        createEvent({
          subType: 'EDIT',
          issueId: values.id,
          content: JSON.stringify({ title: t('EditIssue'), ...changeObj }),
        });
        if (!!params.reason) {
          dispatch(
            thunkGetAllReason({
              projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
            })
          );
        }
        ToastHelper.showSuccess(t('Success'));
        dispatch(thunkGetListIssue(Global.gFiltersIssueList));
        handleClose();
      }
    } catch (error) {
      console.error(error);
    }
  }

  function fillTheFormByReason(value) {
    const reason = reasons?.find((item) => item.reason == value);
    const formikHelpers = refFormik.current;

    if (reason) {
      // Batch setting form values
      const fields = {
        level: reason.level,
        responsibleType: reason.responsible_type,
        overdueKpiReason: reason.overdue_kpi_reason,
        impact: reason.impact,
        stopFighting: reason.stop_fighting,
        unhandleReason: reason.unhandle_reason,
        productStatus: reason.product_status,
        handlingMeasures: reason.handling_measures,
        scopeOfImpact: reason.scope_of_impact,
        impactPoint: reason.impact_point?.toString(),
        urgencyLevel: reason.urgency_level,
        urgencyPoint: reason.urgency_point?.toString(),
      };

      Object.entries(fields).forEach(([key, value]) =>
        formikHelpers.getFieldHelpers(key).setValue(value)
      );
    }

    const { errorLevel, impactPoints, urgencyLevels, urgencyPoints } = AppData;

    // Cache lookup values for current and new states
    const currentValues = {
      errorLevel: errorLevel.find((item) => item.value === issueItem?.level),
      impactPoint: impactPoints.find((item) => item.value == issueItem?.impact_point),
      urgencyLevel: urgencyLevels.find((item) => item.value === issueItem?.urgency_level),
      urgencyPoint: urgencyPoints.find((item) => item.value == issueItem?.urgency_point),
    };

    const newValues = {
      errorLevel: errorLevel.find((item) => item.value === reason?.level),
      impactPoint: impactPoints.find((item) => item.value == reason?.impact_point),
      urgencyLevel: urgencyLevels.find((item) => item.value === reason?.urgency_level),
      urgencyPoint: urgencyPoints.find((item) => item.value == reason?.urgency_point),
    };

    // Define static options
    const impacts = [
      { name: 'Restriction', value: 'RESTRICTION' },
      { name: 'Yes', value: 'YES' },
      { name: 'No', value: 'No' },
    ];

    const stopFightings = [
      { name: 'Yes', value: true },
      { name: 'No', value: false },
    ];

    // Set changes with translations
    setChangeObj((prev) => ({
      ...prev,
      [`${t('ErrorLevel')}`]: `${t(currentValues.errorLevel?.name)} -> ${t(
        newValues.errorLevel?.name
      )}`,
      [`${t('ErrorType')}`]: `${t(
        AppData.responsibleType.find((item) => item.value === issueItem?.responsible_type)?.name
      )} -> ${t(
        AppData.responsibleType.find((item) => item.value === reason?.responsible_type)?.name
      )}`,
      [`${t('ScopeOfImpact')}`]: `${t(
        AppData.scopeOfImpacts.find((item) => item.value === issueItem?.scope_of_impact)?.name
      )} -> ${t(
        AppData.scopeOfImpacts.find((item) => item.value === reason?.scope_of_impact)?.name
      )}`,
      [`${t('ImpactPoint')}`]: `${t(currentValues.impactPoint?.name)} -> ${t(
        newValues.impactPoint?.name
      )}`,
      [`${t('UrgencyLevel')}`]: `${t(currentValues.urgencyLevel?.name)} -> ${t(
        newValues.urgencyLevel?.name
      )}`,
      [`${t('UrgencyPoint')}`]: `${t(currentValues.urgencyPoint?.name)} -> ${t(
        newValues.urgencyPoint?.name
      )}`,
      [`${t('SSCDImpact')}`]: `${t(
        impacts.find((item) => item.value === issueItem?.impact)?.name
      )} -> ${t(impacts.find((item) => item.value === reason?.impact)?.name)}`,
      [`${t('OverdueKpiReason')}`]: `${t(
        AppData.overdueKpiReasons.find((item) => item.value === issueItem?.overdue_kpi_reason)?.name
      )} -> ${t(
        AppData.overdueKpiReasons.find((item) => item.value === reason?.overdue_kpi_reason)?.name
      )}`,
      [`${t('UnhandleReason')}`]: `${t(
        AppData.errorUnhandleReason.find((item) => item.value === issueItem?.unhandle_reason)?.name
      )} -> ${t(
        AppData.errorUnhandleReason.find((item) => item.value === reason?.unhandle_reason)?.name
      )}`,
      [`${t('StopFighting')}`]: `${t(
        stopFightings.find((item) => item.value === issueItem?.stop_fighting)?.name
      )} -> ${t(stopFightings.find((item) => item.value === reason?.stop_fighting)?.name)}`,
      [`${t('HandlingMeasures')}`]: `${t(
        AppData.handlingMeasures.find((item) => item.value === issueItem?.handling_measures)?.name
      )} -> ${t(
        AppData.handlingMeasures.find((item) => item.value === reason?.handling_measures)?.name
      )}`,
      [`${t('ProductStatus')}`]: `${t(
        AppData.productStatus.find((item) => item.value === issueItem?.product_status)?.name
      )} -> ${t(
        AppData.productStatus.find((item) => item.value === reason?.product_status)?.name
      )}`,
    }));
  }

  return (
    <Formik
      initialValues={{
        id: issueItem?.id || '',
        projectId:
          issueItem?.project_id ||
          JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
        productId: issueItem?.product_id ? issueItem?.product_id : productId ? productId : '',
        customerId: issueItem?.customer_id?.toString() || '',
        componentId: issueItem?.component_id || '',
        accountId: issueItem?.account_id || '',
        description: issueItem?.description || '',
        responsibleType: issueItem?.responsible_type || 'USER',
        level: issueItem?.level || 'MINOR',
        unit: issueItem?.unit || '',
        kpiH: issueItem?.kpi_h || '',
        repairPart: issueItem?.repair_part || '',
        repairPartCount: issueItem?.repair_part_count || '',
        responsibleHandlingUnit: issueItem?.responsible_handling_unit || '',
        materialStatus: issueItem?.material_status || '',
        reportingPerson: issueItem?.reporting_person || '',
        remainStatus: issueItem?.remain_status || 'REMAIN',
        overdueKpi: issueItem?.overdue_kpi || '',
        warrantyStatus: issueItem?.warranty_status || '',
        overdueKpiReason: issueItem?.overdue_kpi_reason || '',
        impact: issueItem?.impact || 'YES',
        stopFighting: issueItem?.stop_fighting || false,
        stopFightingDays: issueItem?.stop_ighting_days || '1',
        unhandleReason: issueItem?.unhandle_reason || '',
        // letterSendVmc: issueItem?.letter_send_vmc || '',
        productStatus: issueItem?.product_status || 'DELIVERED',
        handlingMeasures: issueItem?.handling_measures || '',
        handlingPlan: issueItem?.handling_plan || '',
        // errorAlert: issueItem?.error_alert || '',
        status: issueItem?.status || 'UNPROCESSED',
        // date: issueItem?.date
        //   ? Utils.formatDateTime(issueItem?.date, 'YYYY-MM-DD')
        //   : '',
        expDate: issueItem?.exp_date ? Utils.formatDateTime(issueItem?.exp_date, 'YYYY-MM-DD') : '',
        receptionTime: issueItem?.reception_time
          ? Utils.formatDateTime(issueItem?.reception_time, 'YYYY-MM-DD')
          : Utils.formatDateTime(moment(), 'YYYY-MM-DD'),
        completionTime: issueItem?.completion_time
          ? Utils.formatDateTime(issueItem?.completion_time, 'YYYY-MM-DD')
          : '',
        handlingTime: issueItem?.handling_time?.toString() || '',
        note: issueItem?.note || '',
        responsibleTypeDescription: issueItem?.responsible_type_description || '',
        unHandleReasonDescription: issueItem?.unhandle_reason_description || '',
        price: issueItem?.price || '',
        unitPrice: issueItem?.unit_price || '',
        reason: issueItem?.reason || '',
        reasonType: issueItem?.reason || '',
        productCount: issueItem?.product_count?.toString() || '1',
        scopeOfImpact: issueItem?.scope_of_impact || '',
        impactPoint: issueItem?.impact_point || '1',
        urgencyLevel: issueItem?.urgency_level || '',
        urgencyPoint: issueItem?.urgency_point || '',
      }}
      validationSchema={Yup.object({
        // projectId: Yup.string().required(t('Required')),
        productId: Yup.string().required(t('Required')),
        customerId: Yup.string().required(t('Required')),
        description: Yup.string().required(t('Required')),
        status: Yup.string().required(t('Required')),
        responsibleType: Yup.string().required(t('Required')),
        level: Yup.string().required(t('Required')),
        receptionTime: Yup.string().required(t('Required')),
      })}
      enableReinitialize
      onSubmit={(values) => {
        if (isEditMode) {
          requestUpdateIssue(values);
        } else {
          requestCreateIssue(values);
        }
      }}
    >
      {(formikProps) => {
        refFormik.current = formikProps;
        return (
          <Modal
            show={show}
            backdrop="static"
            size="xl"
            onHide={handleClose}
            centered
            onExit={formikProps.handleReset}
            onExited={handleExistDone}
            enforceFocus={false}
          >
            <Modal.Header className="px-5 py-5">
              <Modal.Title>{issueItem ? t('EditIssue') : t('NewIssue')}</Modal.Title>
              <div
                className="btn btn-xs btn-icon btn-light btn-hover-secondary cursor-pointer"
                onClick={handleClose}
              >
                <i className="far fa-times"></i>
              </div>
            </Modal.Header>

            <Modal.Body className="overflow-auto" style={{ maxHeight: '70vh' }}>
              <div className="row">
                {/* Status */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={
                      <>
                        {t('Status')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="status"
                    inputElement={
                      <FastField name="status">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.errorStatus}
                            onValueChanged={(newValue) => {
                              const { errorStatus, errorRemainStatus } = AppData;

                              const newStatus = errorStatus.find((item) => item.value === newValue);
                              const currentStatus = errorStatus.find(
                                (item) => item.value === issueItem?.['status']
                              );
                              const currentRemainStatus = errorRemainStatus.find(
                                (item) => item.value === issueItem?.['remain_status']
                              );
                              const newRemainStatus = errorRemainStatus.find(
                                (item) => item.value == newStatus?.remainStatus
                              );

                              form.setFieldValue(field.name, newValue);
                              formikProps
                                .getFieldHelpers('remainStatus')
                                .setValue(newStatus?.remainStatus);

                              setChangeObj((prev) => ({
                                ...prev,
                                [`${t('Status')}`]: `${t(currentStatus?.name)} -> ${t(
                                  newStatus?.name
                                )}`,
                                [`${t('RemainStatus')}`]: `${t(currentRemainStatus?.name)} -> ${t(
                                  newRemainStatus?.name
                                )}`,
                              }));
                            }}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* Customer */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={
                      <>
                        {t('Customer')} <span className="text-danger">*</span>
                      </>
                    }
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
                                name: `${item?.['name']} - ${item?.['military_region']}`,
                                value: item.id.toString(),
                              };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('Customer')}`]: `${
                                    customers.find((item) => item.id == issueItem?.customer_id)
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

                {/* Product */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={
                      <>
                        {t('Product')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="productId"
                    inputElement={
                      <Field name="productId">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={products
                              ?.filter((item) =>
                                formikProps.getFieldProps('customerId')?.value
                                  ? item?.customer_id ==
                                    formikProps.getFieldProps('customerId')?.value
                                  : true
                              )
                              ?.map((item) => {
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
                                  (item) => item.id == issueItem?.product_id
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
                            disabled={current?.role === 'GUEST' || !!productId}
                          />
                        )}
                      </Field>
                    }
                  />
                </div>

                {/* DescriptionByCustomer */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={
                      <>
                        {t('DescriptionByCustomer')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="description"
                    inputElement={
                      <FastField name="description">
                        {({ field, form, meta }) => (
                          <KTFormTextArea
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);

                              if (
                                Utils.removeVietnameseTones(value)
                                  .toLowerCase()
                                  .slice(0, 4)
                                  .includes('hong')
                              ) {
                                form.setFieldValue('repairPart', value?.slice(4));
                              }

                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('DescriptionByCustomer')}`]: `${
                                    issueItem?.description ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('DescriptionByCustomer'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* ErrorType */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={
                      <>
                        {t('ErrorType')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="responsibleType"
                    inputElement={
                      <FastField name="responsibleType">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.responsibleType}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('ErrorType')}`]: `${t(
                                    AppData.responsibleType.find(
                                      (item) => item.value === issueItem?.['responsible_type']
                                    )?.name
                                  )} -> ${t(
                                    AppData.responsibleType.find((item) => item.value === newValue)
                                      .name
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

                {/* ErrorLevel */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={
                      <>
                        {t('ErrorLevel')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="level"
                    inputElement={
                      <FastField name="level">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.errorLevel}
                            onValueChanged={(newValue) => {
                              const { errorLevel, impactPoints } = AppData;

                              const newErrorLevel = errorLevel.find(
                                (item) => item.value === newValue
                              );
                              const currentErrorLevel = errorLevel.find(
                                (item) => item.value === issueItem?.['level']
                              );
                              const currentImpactPoint = impactPoints.find(
                                (item) => item.value == issueItem?.['impact_point']
                              );

                              form.setFieldValue(field.name, newValue);
                              formikProps
                                .getFieldHelpers('impactPoint')
                                .setValue(newErrorLevel?.score);

                              setChangeObj((prev) => ({
                                ...prev,
                                [`${t('ErrorLevel')}`]: `${t(currentErrorLevel?.name)} -> ${t(
                                  newErrorLevel?.name
                                )}`,
                                [`${t('ImpactPoint')}`]: `${t(currentImpactPoint?.name)} -> ${t(
                                  newErrorLevel?.score
                                )}`,
                              }));
                            }}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* ReceptionTime */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={
                      <>
                        {t('ReceptionTime')} <span className="text-danger">*</span>
                      </>
                    }
                    inputName="receptionTime"
                    inputElement={
                      <FastField name="receptionTime">
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
                                    [`${t('ReceptionTime')}`]: `${
                                      issueItem?.reception_time
                                        ? Utils.formatDateTime(
                                            issueItem?.reception_time,
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
                            placeholder={`${_.capitalize(t('ReceptionTime'))}...`}
                            type={KTFormInputType.btdPicker}
                            btdPickerType={KTFormInputBTDPickerType.date}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* Component */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('Component')}</>}
                    inputName="componentId"
                    inputElement={
                      <Field name="componentId">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={components
                              ?.filter((item) =>
                                formikProps.getFieldProps('productId').value
                                  ? item?.['product_id'] ===
                                    formikProps.getFieldProps('productId').value
                                  : true
                              )
                              ?.map((item) => {
                                return {
                                  name: `${item?.['name']}(${item?.serial})`,
                                  value: item.id,
                                };
                              })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('Component')}`]: `${
                                    components.find((item) => item.id == issueItem?.component_id)
                                      ?.name ?? ''
                                  } -> ${components.find((item) => item.id == newValue)?.name}`,
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

                {/* Handler */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('Handler')}</>}
                    inputName="accountId"
                    inputElement={
                      <FastField name="accountId">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={users.map((item) => {
                              return { name: item.name, value: item.email };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('Handler')}`]: `${t(
                                    users.find((item) => item.value === issueItem?.['account_id'])
                                      ?.name
                                  )} -> ${t(users.find((item) => item.value === newValue)?.name)}`,
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

                {/* ScopeOfImpact */}
                <div className="col-4">
                  <KTFormGroup
                    label={<>{t('ScopeOfImpact')}</>}
                    inputName="scopeOfImpact"
                    inputElement={
                      <FastField name="scopeOfImpact">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.scopeOfImpacts.map((item) => {
                              return { name: item.name, value: item.value };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('ScopeOfImpact')}`]: `${t(
                                    AppData.scopeOfImpacts.find(
                                      (item) => item.value === issueItem?.['scope_of_impact']
                                    )?.name
                                  )} -> ${t(
                                    AppData.scopeOfImpacts.find((item) => item.value === newValue)
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

                {/* ImpactPoint */}
                <div className="col-4">
                  <KTFormGroup
                    label={<>{t('ImpactPoint')}</>}
                    inputName="impactPoint"
                    inputElement={
                      <FastField name="impactPoint">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.impactPoints.map((item) => {
                              return { name: item.name, value: item.value };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('ImpactPoint')}`]: `${t(
                                    AppData.impactPoints.find(
                                      (item) => item.value === issueItem?.['impact_point']
                                    )?.name
                                  )} -> ${t(
                                    AppData.impactPoints.find((item) => item.value === newValue)
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

                {/* UrgencyLevel */}
                <div className="col-4">
                  <KTFormGroup
                    label={<>{t('UrgencyLevel')}</>}
                    inputName="urgencyLevel"
                    inputElement={
                      <FastField name="urgencyLevel">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.urgencyLevels.map((item) => {
                              return { name: item.name, value: item.value };
                            })}
                            onValueChanged={(newValue) => {
                              const { urgencyLevels, urgencyPoints } = AppData;

                              const newUrgencyLevel = urgencyLevels.find(
                                (item) => item.value === newValue
                              );
                              const currentUrgencyLevel = urgencyLevels.find(
                                (item) => item.value === issueItem?.['urgency_level']
                              );
                              const currentUrgencyPoint = urgencyPoints.find(
                                (item) => item.value == issueItem?.['urgency_point']
                              );

                              form.setFieldValue(field.name, newValue);
                              formikProps
                                .getFieldHelpers('urgencyPoint')
                                .setValue(newUrgencyLevel?.score);

                              setChangeObj((prev) => ({
                                ...prev,
                                [`${t('UrgencyLevel')}`]: `${t(currentUrgencyLevel?.name)} -> ${t(
                                  newUrgencyLevel?.name
                                )}`,
                                [`${t('UrgencyPoint')}`]: `${t(currentUrgencyPoint?.name)} -> ${t(
                                  newUrgencyLevel?.score
                                )}`,
                              }));
                            }}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* UrgencyPoint */}
                <div className="col-4">
                  <KTFormGroup
                    label={<>{t('UrgencyPoint')}</>}
                    inputName="urgencyPoint"
                    inputElement={
                      <FastField name="urgencyPoint">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.urgencyPoints.map((item) => {
                              return { name: item.name, value: item.value };
                            })}
                            onValueChanged={(newValue) => {
                              const { urgencyLevels, urgencyPoints } = AppData;

                              // Find new urgency level and impact points
                              const newUrgencyLevel = urgencyLevels.find(
                                (ul) => ul.score == newValue
                              );
                              const newUrgencyPoint = urgencyPoints.find(
                                (item) => item.value == newValue
                              );
                              const currentUrgencyPoint = urgencyPoints.find(
                                (item) => item.value == issueItem?.['urgency_point']
                              );
                              const currentUrgencyLevel = urgencyLevels.find(
                                (ul) => ul.value == issueItem?.['urgency_level']
                              );

                              // Set form field values
                              form.setFieldValue(field.name, newValue);
                              formikProps
                                .getFieldHelpers('urgencyLevel')
                                .setValue(newUrgencyLevel?.value);

                              // Update the change object
                              setChangeObj((prev) => ({
                                ...prev,
                                [`${t('UrgencyPoint')}`]: `${t(currentUrgencyPoint?.name)} -> ${t(
                                  newUrgencyPoint?.name
                                )}`,
                                [`${t('UrgencyLevel')}`]: `${t(currentUrgencyLevel?.name)} -> ${t(
                                  newUrgencyLevel?.name
                                )}`,
                              }));
                            }}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* OverdueKpiReason */}
                <div className="col-4">
                  <KTFormGroup
                    label={<>{t('OverdueKpiReason')}</>}
                    inputName="overdueKpiReason"
                    inputElement={
                      <FastField name="overdueKpiReason">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.overdueKpiReasons.map((item) => {
                              return { name: item.name, value: item.value };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('OverdueKpiReason')}`]: `${t(
                                    AppData.overdueKpiReasons.find(
                                      (item) => item.value === issueItem?.['overdue_kpi_reason']
                                    )?.name
                                  )} -> ${t(
                                    AppData.overdueKpiReasons.find(
                                      (item) => item.value === newValue
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

                {/* Note */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('Note')}</>}
                    inputName="note"
                    inputElement={
                      <FastField name="note">
                        {({ field, form, meta }) => (
                          <KTFormTextArea
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('Note')}`]: `${issueItem?.note ?? ''} -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('Note'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* ResponsibleTypeDescription */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('ResponsibleTypeDescription')}</>}
                    inputName="responsibleTypeDescription"
                    inputElement={
                      <FastField name="responsibleTypeDescription">
                        {({ field, form, meta }) => (
                          <KTFormTextArea
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('ResponsibleTypeDescription')}`]: `${
                                    issueItem?.responsible_type_description ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('ResponsibleTypeDescription'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* ReasonCausingError */}
                <div className="col-4">
                  <KTFormGroup
                    label={<>{t('ReasonCausingError')}</>}
                    inputName="reasonType"
                    inputElement={
                      <FastField name="reasonType">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={[
                              ...reasons.map((item) => {
                                return { name: item.reason, value: item?.reason };
                              }),
                              { name: t('NewReason'), value: 'NEW' },
                            ]}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              if (newValue != 'NEW') {
                                form.setFieldValue('reason', newValue);
                                fillTheFormByReason(newValue);
                                setChangeObj((prev) => ({
                                  ...prev,
                                  [`${t('ReasonCausingError')}`]: `${t(
                                    issueItem?.reason ?? ''
                                  )} -> ${newValue}`,
                                }));
                              } else {
                                form.setFieldValue('reason', '');
                              }
                            }}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* ReasonDescription */}
                {formikProps.getFieldProps('reasonType').value === 'NEW' ? (
                  <div className="col-4">
                    <KTFormGroup
                      label={<>{t('ReasonDescription')}</>}
                      inputName="reason"
                      inputElement={
                        <FastField name="reason">
                          {({ field, form, meta }) => (
                            <KTFormTextArea
                              {...field}
                              onChange={(value) => {
                                form.setFieldValue(field.name, value);
                                setChangeObj((prev) => {
                                  return {
                                    ...prev,
                                    [`${t('ReasonCausingError')}`]: `${
                                      issueItem?.reason ?? ''
                                    } -> ${value}`,
                                  };
                                });
                              }}
                              onBlur={() => form.setFieldTouched(field.name, true)}
                              enableCheckValid
                              isValid={_.isEmpty(meta.error)}
                              isTouched={meta.touched}
                              feedbackText={meta.error}
                              placeholder={`${_.capitalize(t('ReasonDescription'))}...`}
                              type={KTFormInputType.text}
                              disabled={current?.role === 'GUEST'}
                            />
                          )}
                        </FastField>
                      }
                    />
                  </div>
                ) : null}

                {/* UnHandleReasonDescription */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('UnHandleReasonDescription')}</>}
                    inputName="unHandleReasonDescription"
                    inputElement={
                      <FastField name="unHandleReasonDescription">
                        {({ field, form, meta }) => (
                          <KTFormTextArea
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('UnHandleReasonDescription')}`]: `${
                                    issueItem?.unhandle_reason_description ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('UnHandleReasonDescription'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                <div className="row">
                  {/* ErrorEquipmentCount */}
                  <div className="col-lg-2">
                    <KTFormGroup
                      label={<>{t('ErrorEquipmentCount')}</>}
                      inputName="productCount"
                      inputElement={
                        <Field name="productCount">
                          {({ field, form, meta }) => (
                            <KTFormInput
                              {...field}
                              onChange={(value) => {
                                if (/^[1-9]\d*$/.test(value)) {
                                  form.setFieldValue(field.name, value);
                                }
                                if (!!formikProps.getFieldProps('unitPrice').value) {
                                  formikProps
                                    .getFieldHelpers('price')
                                    .setValue(
                                      String(value * formikProps.getFieldProps('unitPrice').value)
                                    );
                                  setChangeObj((prev) => {
                                    return {
                                      ...prev,
                                      [`${t('Cost')}`]: `${issueItem?.price ?? ''} -> ${String(
                                        value * formikProps.getFieldProps('unitPrice').value
                                      )}`,
                                    };
                                  });
                                }
                                setChangeObj((prev) => {
                                  return {
                                    ...prev,
                                    [`${t('ErrorEquipmentCount')}`]: `${
                                      issueItem?.product_count ?? ''
                                    } -> ${value}`,
                                  };
                                });
                              }}
                              onBlur={() => form.setFieldTouched(field.name, true)}
                              enableCheckValid
                              isValid={_.isEmpty(meta.error)}
                              isTouched={meta.touched}
                              feedbackText={meta.error}
                              placeholder={`${_.capitalize(t('ErrorEquipmentCount'))}...`}
                              type={KTFormInputType.number}
                              disabled={current?.role === 'GUEST'}
                            />
                          )}
                        </Field>
                      }
                    />
                  </div>

                  {/* UnitPrice */}
                  <div className="col-lg-4">
                    <KTFormGroup
                      label={<>{t('UnitPrice')}</>}
                      inputName="unitPrice"
                      inputElement={
                        <Field name="unitPrice">
                          {({ field, form, meta }) => (
                            <KTFormInput
                              {...field}
                              onChange={(value) => {
                                if (/^[1-9]\d*$/.test(value)) {
                                  form.setFieldValue(field.name, value);
                                }

                                if (!!formikProps.getFieldProps('productCount').value) {
                                  formikProps
                                    .getFieldHelpers('price')
                                    .setValue(
                                      String(
                                        value * formikProps.getFieldProps('productCount').value
                                      )
                                    );
                                  setChangeObj((prev) => {
                                    return {
                                      ...prev,
                                      [`${t('Cost')}`]: `${issueItem?.price ?? ''} -> ${String(
                                        value * formikProps.getFieldProps('productCount').value
                                      )}`,
                                    };
                                  });
                                }
                                setChangeObj((prev) => {
                                  return {
                                    ...prev,
                                    [`${t('UnitPrice')}`]: `${
                                      issueItem?.unit_price ?? ''
                                    } -> ${value}`,
                                  };
                                });
                              }}
                              onBlur={() => form.setFieldTouched(field.name, true)}
                              enableCheckValid
                              isValid={_.isEmpty(meta.error)}
                              isTouched={meta.touched}
                              feedbackText={meta.error}
                              placeholder={`${_.capitalize(t('UnitPrice'))}...`}
                              type={KTFormInputType.text}
                              disabled={current?.role === 'GUEST'}
                            />
                          )}
                        </Field>
                      }
                    />
                  </div>

                  {/* Cost */}
                  <div className="col-lg-6">
                    <KTFormGroup
                      label={<>{t('Cost')}</>}
                      inputName="price"
                      inputElement={
                        <Field name="price">
                          {({ field, form, meta }) => (
                            <KTFormInput
                              {...field}
                              onChange={(value) => {
                                if (/^[1-9]\d*$/.test(value)) {
                                  form.setFieldValue(field.name, value);
                                }
                                setChangeObj((prev) => {
                                  return {
                                    ...prev,
                                    [`${t('Cost')}`]: `${issueItem?.price ?? ''} -> ${value}`,
                                  };
                                });
                              }}
                              onBlur={() => form.setFieldTouched(field.name, true)}
                              enableCheckValid
                              isValid={_.isEmpty(meta.error)}
                              isTouched={meta.touched}
                              feedbackText={meta.error}
                              placeholder={`${_.capitalize(t('Cost'))}...`}
                              type={KTFormInputType.text}
                              disabled={current?.role === 'GUEST'}
                            />
                          )}
                        </Field>
                      }
                    />
                  </div>
                </div>

                {/* KPI_h */}
                {/* <div className="col-lg-4 col-md-6">
              <KTFormGroup
                label={<>{t('KPI_h')}</>}
                inputName="kpiH"
                inputElement={
                  <FastField name="kpiH">
                    {({ field, form, meta }) => (
                      <KTFormInput
                        {...field}
                        onChange={(value) => form.setFieldValue(field.name, value)}
                        onBlur={() => form.setFieldTouched(field.name, true)}
                        enableCheckValid
                        isValid={_.isEmpty(meta.error)}
                        isTouched={meta.touched}
                        feedbackText={meta.error}
                        placeholder={`${_.capitalize(t('KPI_h'))}...`}
                        type={KTFormInputType.number}
                        disabled={current?.role === 'GUEST'}
                      />
                    )}
                  </FastField>
                }
              />
            </div> */}

                {/* HandlingMeasures */}
                <div className="col-4">
                  <KTFormGroup
                    label={<>{t('HandlingMeasures')}</>}
                    inputName="handlingMeasures"
                    inputElement={
                      <FastField name="handlingMeasures">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.handlingMeasures.map((item) => {
                              return { name: item.name, value: item.value };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('HandlingMeasures')}`]: `${t(
                                    AppData.handlingMeasures.find(
                                      (item) => item.value === issueItem?.['handling_measures']
                                    )?.name
                                  )} -> ${t(
                                    AppData.handlingMeasures.find((item) => item.value === newValue)
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

                {/* ProductStatus */}
                <div className="col-4">
                  <KTFormGroup
                    label={<>{t('ProductStatus')}</>}
                    inputName="productStatus"
                    inputElement={
                      <FastField name="productStatus">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.productStatus.map((item) => {
                              return { name: item.name, value: item.value };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('ProductStatus')}`]: `${t(
                                    AppData.productStatus.find(
                                      (item) => item.value === issueItem?.['product_status']
                                    )?.name
                                  )} -> ${t(
                                    AppData.productStatus.find((item) => item.value === newValue)
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

                {/* RepairPart */}
                <div className="col-lg-7">
                  <KTFormGroup
                    label={<>{t('RepairPart')}</>}
                    inputName="repairPart"
                    inputElement={
                      <FastField name="repairPart">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('RepairPart')}`]: `${
                                    issueItem?.repair_part ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('RepairPart'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* RepairPartCount */}
                <div className="col-lg-2">
                  <KTFormGroup
                    label={<>{t('Amount')}</>}
                    inputName="repairPartCount"
                    inputElement={
                      <FastField name="repairPartCount">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => {
                              if (/^[1-9]\d*$/.test(value)) {
                                form.setFieldValue(field.name, value);
                              }
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('Amount')}`]: `${
                                    issueItem?.repair_part_count ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('RepairPartCount'))}...`}
                            type={KTFormInputType.number}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* UnitCount */}
                <div className="col-lg-3">
                  <KTFormGroup
                    label={<>{t('UnitCount')}</>}
                    inputName="unit"
                    inputElement={
                      <FastField name="unit">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('UnitCount')}`]: `${issueItem?.unit ?? ''} -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('UnitCount'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* EquipmentStatus */}
                {/* <div className="col-lg-4 col-md-6">
              <KTFormGroup
                label={<>{t('EquipmentStatus')}</>}
                inputName="productStatus"
                inputElement={
                  <FastField name="productStatus">
                    {({ field, form, meta }) => (
                      <KTFormInput
                        {...field}
                        onChange={(value) => {
                          form.setFieldValue(field.name, value);
                          setChangeObj((prev) => {
                            return {
                              ...prev,
                              [`${t('EquipmentStatus')}`]: `${
                                issueItem?.product_status ?? ''
                              } -> ${value}`,
                            };
                          });
                        }}
                        onBlur={() => form.setFieldTouched(field.name, true)}
                        enableCheckValid
                        isValid={_.isEmpty(meta.error)}
                        isTouched={meta.touched}
                        feedbackText={meta.error}
                        placeholder={`${_.capitalize(t('EquipmentStatus'))}...`}
                        type={KTFormInputType.text}
                        disabled={current?.role === 'GUEST'}
                      />
                    )}
                  </FastField>
                }
              />
            </div> */}

                {/* ExpDate */}
                <div className="col-lg-4">
                  <KTFormGroup
                    label={<>{t('ExpDate')}</>}
                    inputName="expDate"
                    inputElement={
                      <FastField name="expDate">
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
                                    [`${t('ExpDate')}`]: `${
                                      issueItem?.mfg
                                        ? Utils.formatDateTime(issueItem?.exp_date, 'YYYY-MM-DD')
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
                            placeholder={`${_.capitalize(t('ExpDate'))}...`}
                            type={KTFormInputType.btdPicker}
                            btdPickerType={KTFormInputBTDPickerType.date}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* CompletionTime */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('CompletionTime')}</>}
                    inputName="completionTime"
                    inputElement={
                      <FastField name="completionTime">
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
                                    [`${t('CompletionTime')}`]: `${
                                      issueItem?.completion_time
                                        ? Utils.formatDateTime(
                                            issueItem?.completion_time,
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
                            placeholder={`${_.capitalize(t('CompletionTime'))}...`}
                            type={KTFormInputType.btdPicker}
                            btdPickerType={KTFormInputBTDPickerType.date}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* HandlingTime */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('HandlingTime')}</>}
                    inputName="handlingTime"
                    inputElement={
                      <FastField name="handlingTime">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => {
                              if (/^[1-9]\d*$/.test(value)) {
                                form.setFieldValue(field.name, value);
                              }
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('HandlingTime')}`]: `${
                                    issueItem?.handling_time ? issueItem?.handling_time : ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('HandlingTime'))}...`}
                            type={KTFormInputType.number}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* ResponsibleHandlingUnit */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('ResponsibleHandlingUnit')}</>}
                    inputName="responsibleHandlingUnit"
                    inputElement={
                      <FastField name="responsibleHandlingUnit">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('ResponsibleHandlingUnit')}`]: `${
                                    issueItem?.responsible_handling_unit ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('ResponsibleHandlingUnit'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* ReportingPerson */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('ReportingPerson')}</>}
                    inputName="reportingPerson"
                    inputElement={
                      <FastField name="reportingPerson">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('ReportingPerson')}`]: `${
                                    issueItem?.reporting_person ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('ReportingPerson'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* RemainStatus */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('RemainStatus')}</>}
                    inputName="remainStatus"
                    inputElement={
                      <FastField name="remainStatus">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.errorRemainStatus?.map((item) => {
                              return {
                                name: item.name,
                                value: item.value,
                              };
                            })}
                            onValueChanged={(newValue) => {
                              const { errorStatus, errorRemainStatus } = AppData;

                              const currentRemainStatus = errorRemainStatus.find(
                                (item) => item.value === issueItem?.['remain_status']
                              );
                              const newRemainStatus = errorRemainStatus.find(
                                (item) => item.value == newValue
                              );
                              const newStatus = errorStatus.find(
                                (item) => item.value === newRemainStatus?.status
                              );
                              const currentStatus = errorStatus.find(
                                (item) => item.value === issueItem?.['status']
                              );

                              form.setFieldValue(field.name, newValue);
                              formikProps.getFieldHelpers('status').setValue(newStatus?.value);

                              setChangeObj((prev) => ({
                                ...prev,
                                [`${t('Status')}`]: `${t(currentStatus?.name)} -> ${t(
                                  newStatus?.name
                                )}`,
                                [`${t('RemainStatus')}`]: `${t(currentRemainStatus?.name)} -> ${t(
                                  newRemainStatus?.name
                                )}`,
                              }));
                            }}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* OverdueKpi */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('OverdueKpi')}</>}
                    inputName="overdueKpi"
                    inputElement={
                      <FastField name="overdueKpi">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={[
                              { name: 'Yes', value: true },
                              { name: 'No', value: false },
                            ]}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                const data = [
                                  { name: 'Yes', value: true },
                                  { name: 'No', value: false },
                                ];
                                return {
                                  ...prev,
                                  [`${t('OverdueKpi')}`]: `${t(
                                    data.find((item) => item.value === issueItem?.['overdue_kpi'])
                                      ?.name
                                  )} -> ${t(data.find((item) => item.value === newValue)?.name)}`,
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

                {/* WarrantyStatus */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('WarrantyStatus')}</>}
                    inputName="warrantyStatus"
                    inputElement={
                      <FastField name="warrantyStatus">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={[
                              { name: 'UnderWarranty', value: 'UNDER' },
                              { name: 'OutOfWarranty', value: 'OVER' },
                            ]}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                const data = [
                                  { name: 'UnderWarranty', value: 'UNDER' },
                                  { name: 'OutOfWarranty', value: 'OVER' },
                                ];
                                return {
                                  ...prev,
                                  [`${t('WarrantyStatus')}`]: `${t(
                                    data.find(
                                      (item) => item.value === issueItem?.['warranty_status']
                                    )?.name
                                  )} -> ${t(data.find((item) => item.value === newValue)?.name)}`,
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

                {/* SSCDImpact */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('SSCDImpact')}</>}
                    inputName="impact"
                    inputElement={
                      <FastField name="impact">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={[
                              { name: 'Restriction', value: 'RESTRICTION' },
                              { name: 'Yes', value: 'YES' },
                              { name: 'No', value: 'No' },
                            ]}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                const data = [
                                  { name: 'Restriction', value: 'RESTRICTION' },
                                  { name: 'Yes', value: 'YES' },
                                  { name: 'No', value: 'No' },
                                ];
                                return {
                                  ...prev,
                                  [`${t('SSCDImpact')}`]: `${t(
                                    data.find((item) => item.value === issueItem?.['impact'])?.name
                                  )} -> ${t(data.find((item) => item.value === newValue)?.name)}`,
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

                {/* StopFighting */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('StopFighting')}</>}
                    inputName="stopFighting"
                    inputElement={
                      <FastField name="stopFighting">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={[
                              { name: 'Yes', value: true },
                              { name: 'No', value: false },
                            ]}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                const data = [
                                  { name: 'Yes', value: true },
                                  { name: 'No', value: false },
                                ];
                                return {
                                  ...prev,
                                  [`${t('StopFighting')}`]: `${t(
                                    data.find((item) => item.value === issueItem?.['stop_fighting'])
                                      ?.name
                                  )} -> ${t(data.find((item) => item.value === newValue)?.name)}`,
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

                {/* StopFightingDays */}
                {!!formikProps.getFieldProps('stopFighting').value ? (
                  <div className="col-lg-4 col-md-6">
                    <KTFormGroup
                      label={<>{t('StopFightingDays')}</>}
                      inputName="stopFightingDays"
                      inputElement={
                        <FastField name="stopFightingDays">
                          {({ field, form, meta }) => (
                            <KTFormInput
                              {...field}
                              onChange={(value) => {
                                form.setFieldValue(field.name, value);
                                setChangeObj((prev) => {
                                  return {
                                    ...prev,
                                    [`${t('StopFightingDays')}`]: `${
                                      issueItem?.stop_fighting_days ?? ''
                                    } -> ${value}`,
                                  };
                                });
                              }}
                              onBlur={() => form.setFieldTouched(field.name, true)}
                              enableCheckValid
                              isValid={_.isEmpty(meta.error)}
                              isTouched={meta.touched}
                              feedbackText={meta.error}
                              placeholder={`${_.capitalize(t('StopFightingDays'))}...`}
                              type={KTFormInputType.number}
                              disabled={current?.role === 'GUEST'}
                            />
                          )}
                        </FastField>
                      }
                    />
                  </div>
                ) : null}

                {/* UnhandleReason */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('UnhandleReason')}</>}
                    inputName="unhandleReason"
                    inputElement={
                      <FastField name="unhandleReason">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
                            // searchable={true}
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.errorUnhandleReason.map((item) => {
                              return { name: item.name, value: item.value };
                            })}
                            onValueChanged={(newValue) => {
                              form.setFieldValue(field.name, newValue);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('UnhandleReason')}`]: `${t(
                                    AppData.errorUnhandleReason.find(
                                      (item) => item.value === issueItem?.['unhandle_reason']
                                    )?.name
                                  )} -> ${t(
                                    AppData.errorUnhandleReason.find(
                                      (item) => item.value === newValue
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

                {/* LetterSendVmc */}
                {/* <div className="col-lg-4 col-md-6">
              <KTFormGroup
                label={<>{t('LetterSendVmc')}</>}
                inputName="letterSendVmc"
                inputElement={
                  <FastField name="letterSendVmc">
                    {({ field, form, meta }) => (
                      <KTFormInput
                        {...field}
                        onChange={(value) => form.setFieldValue(field.name, value)}
                        onBlur={() => form.setFieldTouched(field.name, true)}
                        enableCheckValid
                        isValid={_.isEmpty(meta.error)}
                        isTouched={meta.touched}
                        feedbackText={meta.error}
                        placeholder={`${_.capitalize(t('LetterSendVmc'))}...`}
                        type={KTFormInputType.text}
                        disabled={current?.role === 'GUEST'}
                      />
                    )}
                  </FastField>
                }
              />
            </div> */}

                {/* Date */}
                {/* <div className="col-lg-4 col-md-6">
              <KTFormGroup
                label={<>{t('Date')}</>}
                inputName="date"
                inputElement={
                  <FastField name="date">
                    {({ field, form, meta }) => (
                      <KTFormInput
                        {...field}
                        onChange={(value) => form.setFieldValue(field.name, value)}
                        onBlur={() => form.setFieldTouched(field.name, true)}
                        enableCheckValid
                        isValid={_.isEmpty(meta.error)}
                        isTouched={meta.touched}
                        feedbackText={meta.error}
                        placeholder={`${_.capitalize(t('Date'))}...`}
                        type={KTFormInputType.btdPicker}
                        btdPickerType={KTFormInputBTDPickerType.date}
                        disabled={current?.role === 'GUEST'}
                      />
                    )}
                  </FastField>
                }
              />
            </div> */}

                {/* MaterialStatus */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('MaterialStatus')}</>}
                    inputName="materialStatus"
                    inputElement={
                      <FastField name="materialStatus">
                        {({ field, form, meta }) => (
                          <KTFormInput
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('MaterialStatus')}`]: `${
                                    issueItem?.material_status ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('MaterialStatus'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* HandlingPlan */}
                <div className="col-lg-4 col-md-6">
                  <KTFormGroup
                    label={<>{t('HandlingPlan')}</>}
                    inputName="handlingPlan"
                    inputElement={
                      <FastField name="handlingPlan">
                        {({ field, form, meta }) => (
                          <KTFormTextArea
                            {...field}
                            onChange={(value) => {
                              form.setFieldValue(field.name, value);
                              setChangeObj((prev) => {
                                return {
                                  ...prev,
                                  [`${t('HandlingPlan')}`]: `${
                                    issueItem?.handling_plan ?? ''
                                  } -> ${value}`,
                                };
                              });
                            }}
                            onBlur={() => form.setFieldTouched(field.name, true)}
                            enableCheckValid
                            isValid={_.isEmpty(meta.error)}
                            isTouched={meta.touched}
                            feedbackText={meta.error}
                            placeholder={`${_.capitalize(t('HandlingPlan'))}...`}
                            type={KTFormInputType.text}
                            disabled={current?.role === 'GUEST'}
                          />
                        )}
                      </FastField>
                    }
                  />
                </div>

                {/* ErrorAlert */}
                {/* <div className="col-lg-4 col-md-6">
              <KTFormGroup
                label={<>{t('ErrorAlert')}</>}
                inputName="errorAlert"
                inputElement={
                  <FastField name="errorAlert">
                    {({ field, form, meta }) => (
                      <KTFormTextArea
                        {...field}
                        onChange={(value) => form.setFieldValue(field.name, value)}
                        onBlur={() => form.setFieldTouched(field.name, true)}
                        enableCheckValid
                        isValid={_.isEmpty(meta.error)}
                        isTouched={meta.touched}
                        feedbackText={meta.error}
                        placeholder={`${_.capitalize(t('ErrorAlert'))}...`}
                        type={KTFormInputType.text}
                        disabled={current?.role === 'GUEST'}
                      />
                    )}
                  </FastField>
                }
              />
            </div> */}
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
        );
      }}
    </Formik>
  );
}

ModalEditIssue.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onRefreshIssueList: PropTypes.func,
  issueItem: PropTypes.object,
  onExistDone: PropTypes.func,
  users: PropTypes.array,
};

export default ModalEditIssue;
