import { unwrapResult } from '@reduxjs/toolkit';
import eventApi from 'api/eventApi';
import { thunkGetListEvent } from 'app/eventSlice';
import { FastField, Formik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import KTFormGroup from 'shared/components/OtherKeenComponents/Forms/KTFormGroup';
import KTFormTextArea from 'shared/components/OtherKeenComponents/Forms/KTFormTextArea';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import Global from 'shared/utils/Global';
import * as Yup from 'yup';
import CellActivity from '../../../../../../shared/components/CellActivity';

ModalProductActivity.propTypes = {};

function ModalProductActivity({
  show = false,
  onClose = null,
  productItem = null,
  onExistDone = null,
}) {
  // MARK: --- Params ---
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    subType: '',
    page: 0,
    limit: 20,
    productId: productItem?.id,
  });
  const { events, isGettingEvent } = useSelector((state) => state?.event);
  const dispatch = useDispatch();
  const refFormik = useRef();

  // MARK: --- Functions ---
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
        type: 'PRODUCT',
        projectId: JSON.parse(localStorage.getItem(PreferenceKeys.currentProject))?.id,
        productId: productItem?.id,
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
    if (!!productItem?.id) {
      setFilters({ ...filters, productId: productItem?.id });
      Global.gFiltersEventList = { ...filters, productId: productItem?.id };
    }
  }, [productItem?.id]);

  useEffect(() => {
    if (!!filters?.productId) {
      getListEvent();
    }
  }, [filters]);

  return (
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
              <Modal.Title>{productItem?.name}</Modal.Title>
              <div
                className="btn btn-xs btn-icon btn-light btn-hover-secondary cursor-pointer"
                onClick={handleClose}
              >
                <i className="far fa-times"></i>
              </div>
            </Modal.Header>
            <Modal.Body>
              <div className="row">
                <div className="col-12 overflow-auto" style={{ maxHeight: '65vh' }}>
                  {events?.map((item) => (
                    <CellActivity key={item?.id} event={item} />
                  ))}
                </div>

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
            </Modal.Body>
          </Modal>
        );
      }}
    </Formik>
  );
}

export default ModalProductActivity;
