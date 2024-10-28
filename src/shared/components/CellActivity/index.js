import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import KTTooltip from 'shared/components/OtherKeenComponents/KTTooltip';
import Utils from 'shared/utils/Utils';
import { FastField, Formik } from 'formik';
import * as Yup from 'yup';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import KTFormTextArea from 'shared/components/OtherKeenComponents/Forms/KTFormTextArea';
import { Button } from 'react-bootstrap';
import AccountHelper from 'shared/helpers/AccountHelper';
import eventApi from 'api/eventApi';
import ToastHelper from 'shared/helpers/ToastHelper';
import { useDispatch } from 'react-redux';
import { thunkGetListEvent } from 'app/eventSlice';
import Global from 'shared/utils/Global';
import Swal from 'sweetalert2';

CellActivity.propTypes = {};

function CellActivity(props) {
  // MARK: --- Params ---
  const { event } = props;
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const dispatch = useDispatch();

  // MARK: ---- Functions ---
  async function updateEvent(values) {
    try {
      const res = await eventApi.updateEvent(values);
      if (res.result === 'success') {
        dispatch(thunkGetListEvent(Global.gFiltersEventList));
        setEditMode(false);
        ToastHelper.showSuccess(t('Success'));
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleDeleteEvent() {
    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmDeleteEvent'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t('Yes'),
      cancelButtonText: t('Cancel'),
      customClass: {
        confirmButton: 'btn btn-danger font-weight-bolder',
        cancelButton: 'btn btn-light font-weight-bolder',
      },
    }).then(async function (result) {
      if (result.value) {
        try {
          const res = await eventApi.deleteEvent({
            eventIds: [event['id']],
          });
          const { result } = res;
          if (result == 'success') {
            ToastHelper.showSuccess(t('Success'));
            dispatch(thunkGetListEvent(Global.gFiltersEventList));
          }
        } catch (error) {
          console.log(`Delete Event error: ${error?.message}`);
        }
      }
    });
  }

  return (
    <Formik
      initialValues={{
        id: event?.id,
        content: event?.content,
      }}
      validationSchema={Yup.object({
        content: Yup.string().required(),
      })}
      enableReinitialize
      onSubmit={(values) => {
        updateEvent(values);
      }}
    >
      {(formikProps) => (
        <div className="d-flex w-100 mb-4">
          {/* user avatar */}
          <div
            className="mt-1"
            style={{
              backgroundImage: `url(${AccountHelper.getAccountAvatar(event?.account)})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              width: '28px',
              height: '28px',
              borderRadius: '9999px',
              flexShrink: 0,
            }}
          ></div>

          <div className="ml-4 border border-dashed border-secondary rounded py-2 px-4 flex-grow-1">
            <div className="d-flex justify-content-between">
              {/* account */}
              <span className="">
                <span className="font-weight-bolder mr-2">{event?.account?.name}</span>
                <span className="text-muted d-none d-md-inline">{event?.account?.employee_id}</span>
                <span className="mx-1">·</span>
                <span className="text-dark-50">
                  {Utils.formatTimeDifference(event?.timeDifferenceInSeconds)}
                </span>
              </span>

              {event?.sub_type !== 'CREATE' && event?.sub_type !== 'EDIT' ? (
                <div className="d-flex justify-content-between align-items-center">
                  {/* tag */}
                  {/* <div className="mr-3 d-none d-md-flex">
                  <div className="badge badge-secondary">{t('Creator')}</div>
                </div> */}

                  {/* tool */}
                  <KTTooltip text={t('Edit')}>
                    <div
                      className="btn btn-icon btn-sm btn-circle btn-hover-primary"
                      onClick={(e) => {
                        setEditMode((prev) => !prev);
                      }}
                    >
                      <i className="far fa-pen p-0 icon-1x" />
                    </div>
                  </KTTooltip>
                  <KTTooltip text={t('Delete')}>
                    <div
                      className="btn btn-icon btn-sm btn-circle btn-hover-danger"
                      onClick={(e) => {
                        handleDeleteEvent();
                      }}
                    >
                      <i className="far fa-trash p-0 icon-1x" />
                    </div>
                  </KTTooltip>
                </div>
              ) : null}
            </div>

            {/* content */}
            {editMode ? null : (
              <div className="d-flex">
                <i
                  className={`fa-regular fa-${
                    event?.sub_type === 'CREATE'
                      ? 'circle-plus text-success'
                      : event?.sub_type === 'EDIT'
                      ? 'pen-to-square'
                      : 'comment text-primary'
                  } mr-2`}
                ></i>
                <div>
                  {event?.sub_type === 'EDIT' ? (
                    <div>
                      {/* Display the title */}
                      {JSON.parse(event?.content).title && (
                        <span>{JSON.parse(event?.content).title}:</span>
                      )}

                      {/* Display the rest of the key-value pairs */}
                      {Object.keys(JSON.parse(event?.content)).map((key) => {
                        // Skip the title key
                        if (key === 'title') return null;

                        return (
                          <div key={key}>
                            <span className="text-warning">{key}:</span>{' '}
                            {JSON.parse(event?.content)[key]}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    t(event?.content)
                  )}
                </div>
              </div>
            )}

            {editMode ? (
              <div>
                <KTFormGroup
                  additionalClassName="mb-1"
                  inputName="content"
                  inputElement={
                    <FastField name="content">
                      {({ field, form, meta }) => (
                        <KTFormTextArea
                          {...field}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          onBlur={() => form.setFieldTouched(field.name, true)}
                          enableCheckValid
                          isValid={_.isEmpty(meta.error)}
                          isTouched={meta.touched}
                          feedbackText={meta.error}
                          placeholder={`${_.capitalize(t('Comment'))}...`}
                        />
                      )}
                    </FastField>
                  }
                />
                <div>
                  <Button
                    disabled={!formikProps.getFieldProps('content').value}
                    className="font-weight-bold mr-2"
                    variant="primary"
                    onClick={formikProps.handleSubmit}
                  >
                    {t('Comment')}
                  </Button>
                  <Button
                    className="font-weight-bold"
                    variant="secondary"
                    onClick={() => {
                      setEditMode(false), formikProps.handleReset();
                    }}
                  >
                    {t('Cancel')}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Formik>
  );
}

export default CellActivity;
