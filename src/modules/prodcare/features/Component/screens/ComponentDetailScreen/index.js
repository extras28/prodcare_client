import { unwrapResult } from '@reduxjs/toolkit';
import useRouter from 'hooks/useRouter';
import IssueHomePage from 'modules/prodcare/features/Issue/screens/IssueHomeScreen';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Utils from 'shared/utils/Utils';
import ModalEditComponent from '../../components/ModalEditComponent';
import ComponentActivityTab from '../../components/ComponentActivityTab';
import { clearComponentDetail, thunkGetComponentDetail } from '../../componentSlice';
import AppData from 'shared/constants/AppData';

ComponentDetailScreen.propTypes = {};

function ComponentDetailScreen(props) {
  // MARK: --- Params ---
  const router = useRouter();
  const { componentDetail, issues } = useSelector((state) => state.component);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [modalComponentEditShowing, setModalEditComponentShowing] = useState(false);
  const { current } = useSelector((state) => state?.auth);
  const { customers, products } = useSelector((state) => state?.app);

  const rows = useMemo(() => {
    return [
      { label: t('ComponentName'), value: componentDetail?.name ?? '' },
      { label: t('Serial'), value: componentDetail?.serial ?? '' },
      {
        label: t('Product'),
        value: `${componentDetail?.product?.name} ${
          componentDetail?.product?.serial ? '(' + componentDetail?.product?.serial + ')' : ''
        }`,
        onClick: () => {
          router.navigate(`/prodcare/operating/product/detail/${componentDetail?.product_id}`);
        },
        className: 'text-primary cursor-pointer',
      },
      {
        label: t('Status'),
        value:
          componentDetail?.situation == 'GOOD'
            ? t('Good')
            : componentDetail?.situation == 'DEFECTIVE'
            ? t('HaveErrors')
            : t('OperationalWithErrors'),
        valueClassName: `badge badge-${
          componentDetail?.situation == 'GOOD'
            ? 'success'
            : componentDetail?.situation == 'DEFECTIVE'
            ? 'danger'
            : 'warning'
        }`,
      },
      {
        label: t('CurrentStatus'),
        value: componentDetail?.status
          ? t(
              AppData.productCurrentStatus.find((item) => item?.value === componentDetail?.status)
                ?.name
            )
          : '',
        valueClassName: `badge badge-${
          componentDetail?.status === 'USING'
            ? 'primary'
            : componentDetail?.status === 'REPAIRING'
            ? 'danger'
            : 'warning'
        }`,
      },
      { label: t('ComponentLevel'), value: componentDetail?.level ?? '' },
      { label: t('Note'), value: componentDetail?.description ?? '' },
    ];
  }, [componentDetail]);

  const issueList = useMemo(
    () => (
      <IssueHomePage
        name={`${componentDetail?.name} - ${componentDetail?.serial}`}
        productId={componentDetail?.product_id}
        componentId={componentDetail?.id}
        customerId={componentDetail?.product?.customer?.id}
      />
    ),
    [componentDetail]
  );

  // MARK: --- Functions ---

  async function getComponentDetail() {
    try {
      const res = unwrapResult(
        await dispatch(thunkGetComponentDetail({ componentId: router.query.componentId }))
      );
    } catch (error) {
      console.error(`Get component detail error: ${error}`);
    }
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    getComponentDetail();

    return () => {
      dispatch(clearComponentDetail());
    };
  }, []);

  return (
    <div className="row">
      {/* component detail */}
      <div className="col-3">
        <div className="bg-white rounded px-4 mb-4">
          {rows?.map((item, index) => (
            <div
              key={index}
              className={`${
                current?.role === 'GUEST' && index === rows?.length - 1 ? '' : 'border-bottom'
              } py-2 ${item?.className}`}
              onClick={item?.onClick}
            >
              <p className="font-weight-bolder mb-1 text-dark-75">{item?.label}</p>
              <p className={`${index === 0 ? 'text-primary' : ''} m-0 ${item?.valueClassName}`}>
                {item?.value || <>&nbsp;</>}
              </p>
            </div>
          ))}
          {current?.role === 'USER' || current?.role === 'ADMIN' ? (
            <button
              type="button"
              className="btn btn-outline-secondary my-2 w-100"
              onClick={(e) => {
                e.preventDefault();
                setModalEditComponentShowing(true);
              }}
            >
              {t('Edit')}
            </button>
          ) : null}
        </div>
        <ComponentActivityTab />
      </div>

      <div className="col-9">
        <div className="bg-white rounded">
          <div className="p-4">{issueList}</div>
        </div>
      </div>

      <ModalEditComponent
        show={modalComponentEditShowing}
        customers={customers}
        products={products}
        onClose={() => {
          setModalEditComponentShowing(false);
        }}
        onExistDone={() => {
          getComponentDetail();
        }}
        componentItem={componentDetail}
      />
    </div>
  );
}

export default ComponentDetailScreen;
