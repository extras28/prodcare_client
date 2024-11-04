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

ComponentDetailScreen.propTypes = {};

function ComponentDetailScreen(props) {
  // MARK: --- Params ---
  const router = useRouter();
  const { componentDetail } = useSelector((state) => state.component);
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
        label: t('Equipment'),
        value: `${componentDetail?.product?.name} ${
          componentDetail?.product?.serial ? '(' + componentDetail?.product?.serial + ')' : ''
        }`,
      },
      { label: t('ComponentLevel'), value: componentDetail?.level ?? '' },
    ];
  }, [componentDetail]);

  const issueList = useMemo(
    () => <IssueHomePage componentId={componentDetail?.id} />,
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
      <div className="col-4">
        <div className="bg-white rounded px-4 mb-4">
          {rows?.map((item, index) => (
            <div
              key={index}
              className={`${
                current?.role !== 'USER' && current?.role !== 'ADMIN' && index === rows?.length - 1
                  ? ''
                  : 'border-bottom'
              } py-2`}
            >
              <p className="font-weight-bolder mb-1">{item?.label}</p>
              <p className={`${index === 0 ? 'text-primary' : ''} m-0`}>
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

      <div className="col-8">
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
