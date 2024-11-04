import { unwrapResult } from '@reduxjs/toolkit';
import eventApi from 'api/eventApi';
import { thunkGetListEvent } from 'app/eventSlice';
import { FastField, Formik } from 'formik';
import CellActivity from 'shared/components/CellActivity';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import KTFormTextArea from 'shared/components/OtherKeenComponents/Forms/KTFormTextArea';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import Global from 'shared/utils/Global';
import * as Yup from 'yup';

IssueActivityTab.propTypes = {};

function IssueActivityTab(props) {
  // MARK: --- Params ---
  const { issueDetail } = useSelector((state) => state?.issue);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const refFormik = useRef();
  const [filters, setFilters] = useState({
    subType: '',
    page: 0,
    limit: 20,
    issueId: issueDetail?.id,
  });
  const { events, isGettingEvent } = useSelector((state) => state?.event);

  // MARK: --- Functions ---
  async function getListEvent() {
    try {
      const res = unwrapResult(await dispatch(thunkGetListEvent(filters)));
      if (res.result === 'success') {
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function createEvent(params) {
    try {
      const res = await eventApi.createEvent({
        ...params,
        subType: 'COMMENT',
        type: 'ISSUE',
        projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
        issueId: issueDetail?.id,
      });
      if (res.result === 'success') {
        dispatch(thunkGetListEvent(filters));
        refFormik.current.handleReset();
      }
    } catch (error) {
      console.error(error);
    }
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    if (!!issueDetail?.id) {
      setFilters({ ...filters, issueId: issueDetail?.id });
      Global.gFiltersEventList = { ...filters, issueId: issueDetail?.id };
    }
  }, [issueDetail]);

  useEffect(() => {
    if (filters?.issueId) {
      getListEvent();
    }
  }, [filters]);

  return (
    <div className="bg-white p-4 rounded">
      <Formik
        initialValues={{
          content: '',
        }}
        validationSchema={Yup.object({
          // content: Yup.string().required(),
        })}
        enableReinitialize
        onSubmit={(values) => {
          createEvent(values);
        }}
      >
        {(formikProps) => {
          refFormik.current = formikProps;
          return (
            <div className="row">
              {/* {isGettingEvent ? (
                <Loading showBackground={false} message={`${t('Loading')}...`} />
              ) : ( */}
              <div className="col-12">
                {events?.map((item) => (
                  <CellActivity key={item?.id} event={item} />
                ))}
              </div>
              {/* )} */}

              <div className="col-12 mt-4">
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
              </div>

              <div>
                <Button
                  disabled={!formikProps.getFieldProps('content').value}
                  className="font-weight-bold"
                  variant="primary"
                  onClick={formikProps.handleSubmit}
                >
                  {t('Comment')}
                </Button>
              </div>
            </div>
          );
        }}
      </Formik>
    </div>
  );
}

export default IssueActivityTab;
