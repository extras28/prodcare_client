import eventApi from 'api/eventApi';
import issueApi from 'api/issueApi';
import { FastField, Formik } from 'formik';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KeenSelectOption from 'shared/components/OtherKeenComponents/Forms/KeenSelectOption';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import { KTFormInputType } from 'shared/components/OtherKeenComponents/Forms/KTFormInput';
import KTFormTextArea from 'shared/components/OtherKeenComponents/Forms/KTFormTextArea';
import AppData from 'shared/constants/AppData';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import ToastHelper from 'shared/helpers/ToastHelper';
import Global from 'shared/utils/Global';
import * as Yup from 'yup';
import { thunkGetListIssue } from '../../issueSlice';
import { thunkGetAllReason } from 'app/appSlice';

function ModalEvaluateIssue({
  show = false,
  onClose = null,
  issueItem = null,
  onExistDone = null,
  reasons = [],
}) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { current } = useSelector((state) => state?.auth);
  const [changeObj, setChangeObj] = useState({});
  const refFormik = useRef(null);

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

  async function requestUpdateIssue(values) {
    try {
      const params = { ...values };
      if (!params.stopFighting) delete params.stopFightingDays;
      const res = await issueApi.updateIssue(params);
      if (res.result === 'success') {
        createEvent({
          subType: 'EDIT',
          issueId: values.id,
          content: JSON.stringify({ title: t('EvaluateIssue'), ...changeObj }),
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
        responsibleType: issueItem?.responsible_type || '',
        level: issueItem?.level || '',
        overdueKpiReason: issueItem?.overdue_kpi_reason || '',
        impact: issueItem?.impact || '',
        description: issueItem?.description || '',
        stopFighting: issueItem?.stop_fighting || '',
        unhandleReason: issueItem?.unhandle_reason || '',
        productStatus: issueItem?.product_status || '',
        handlingMeasures: issueItem?.handling_measures || '',
        reason: issueItem?.reason || '',
        reasonType: issueItem?.reason || '',
        scopeOfImpact: issueItem?.scope_of_impact || '',
        impactPoint: issueItem?.impact_point?.toString() || '',
        urgencyLevel: issueItem?.urgency_level || '',
        urgencyPoint: issueItem?.urgency_point?.toString() || '',
      }}
      validationSchema={Yup.object({
        description: Yup.string().required(t('Required')),
        responsibleType: Yup.string().required(t('Required')),
        level: Yup.string().required(t('Required')),
      })}
      enableReinitialize
      onSubmit={(values) => {
        requestUpdateIssue(values);
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
              <Modal.Title>{t('EvaluateIssue')}</Modal.Title>
              <div
                className="btn btn-xs btn-icon btn-light btn-hover-secondary cursor-pointer"
                onClick={handleClose}
              >
                <i className="far fa-times"></i>
              </div>
            </Modal.Header>

            <Modal.Body className="overflow-auto" style={{ maxHeight: '70vh' }}>
              <div className="row">
                {/* ErrorLevel */}
                <div className="col-4">
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

                {/* ErrorType */}
                <div className="col-4">
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

                {/* ScopeOfImpact */}
                <div className="col-4">
                  <KTFormGroup
                    label={<>{t('ScopeOfImpact')}</>}
                    inputName="scopeOfImpact"
                    inputElement={
                      <FastField name="scopeOfImpact">
                        {({ field, form, meta }) => (
                          <KeenSelectOption
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
                            fieldProps={field}
                            fieldHelpers={formikProps.getFieldHelpers(field.name)}
                            fieldMeta={meta}
                            name={field.name}
                            options={AppData.impactPoints.map((item) => {
                              return { name: item.name, value: item.value };
                            })}
                            onValueChanged={(newValue) => {
                              const { errorLevel, impactPoints } = AppData;

                              // Find new level and current impact point
                              const newErrorLevel = errorLevel.find((lv) => lv.score == newValue);
                              const newImpactPoint = impactPoints.find(
                                (item) => item.value == newValue
                              );
                              const currentImpactPoint = impactPoints.find(
                                (item) => item.value == issueItem?.['impact_point']
                              );
                              const currentErrorLevel = errorLevel.find(
                                (el) => el.value == issueItem?.['level']
                              );

                              // Set field values
                              form.setFieldValue(field.name, newValue);
                              formikProps.getFieldHelpers('level').setValue(newErrorLevel?.value);

                              // Update the change object
                              setChangeObj((prev) => ({
                                ...prev,
                                [`${t('ImpactPoint')}`]: `${t(currentImpactPoint?.name)} -> ${t(
                                  newImpactPoint?.name
                                )}`,
                                [`${t('ErrorLevel')}`]: `${t(currentErrorLevel?.name)} -> ${t(
                                  newErrorLevel?.name
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

                {/* SSCDImpact */}
                <div className="col-4">
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

                {/* UnhandleReason */}
                <div className="col-4">
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

                {/* StopFighting */}
                <div className="col-4">
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

                {/* ReasonCausingError */}
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
                {/* DescriptionByCustomer */}
                <div className="col-4">
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

ModalEvaluateIssue.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  onRefreshIssueList: PropTypes.func,
  issueItem: PropTypes.object,
  onExistDone: PropTypes.func,
  reasons: PropTypes.array,
};

export default ModalEvaluateIssue;
