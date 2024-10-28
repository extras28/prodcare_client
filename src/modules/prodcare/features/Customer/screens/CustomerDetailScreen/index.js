import useRouter from 'hooks/useRouter';
import ProductHomePage from 'modules/prodcare/features/Product/screens/ProductHomeScreen';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import ModalEditCustomer from '../../components/ModalEditCustomer';
import { clearCustomerDetail, thunkGetCustomerDetail } from '../../customerSlice';

CustomerDetailScreen.propTypes = {};

function CustomerDetailScreen(props) {
  // MARK: --- Params ---
  const router = useRouter();
  const { customerDetail } = useSelector((state) => state?.customer);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [modalCustomerEditShowing, setModalEditCustomerShowing] = useState(false);
  const { current } = useSelector((state) => state?.auth);

  const rows = useMemo(() => {
    return [
      { label: t('ManagingAuthority'), value: customerDetail?.military_region ?? '' },
      {
        label: t('Unit'),
        value: customerDetail?.name ?? '',
      },
      { label: t('Sign'), value: customerDetail?.sign ?? '' },
      {
        label: t('CodeNumber'),
        value: customerDetail?.code_number ?? '',
      },
      {
        label: t('Address'),
        value: customerDetail?.address ?? '',
      },
      {
        label: t('ContactPersonName'),
        value: customerDetail?.contact_person_name ?? '',
      },
      {
        label: t('Title'),
        value: customerDetail?.contact_person_title ?? '',
      },
      {
        label: t('Phone'),
        value: customerDetail?.phone ?? '',
      },
    ];
  }, [customerDetail]);

  // MARK: --- Hooks ---
  useEffect(() => {
    dispatch(thunkGetCustomerDetail({ customerId: router.query.customerId }));
    return () => {
      dispatch(clearCustomerDetail());
    };
  }, []);

  return (
    <div className="row">
      {/* customer detail */}
      <div className="col-4">
        <div className="bg-white rounded px-4 mb-4">
          {rows?.map((item, index) => (
            <div
              key={index}
              className={`${
                current?.role !== 'ADMIN' && index === rows?.length - 1 ? '' : 'border-bottom'
              } py-2`}
            >
              <p className="font-weight-bolder mb-1">{item?.label}</p>
              <p className={`${index === 0 ? 'text-primary' : ''} m-0`}>
                {item?.value || <>&nbsp;</>}
              </p>
            </div>
          ))}
          {current?.role === 'ADMIN' ? (
            <button
              type="button"
              className="btn btn-outline-secondary my-2 w-100"
              onClick={(e) => {
                e.preventDefault();
                setModalEditCustomerShowing(true);
              }}
            >
              {t('Edit')}
            </button>
          ) : null}
        </div>
      </div>

      <div className="col-8">
        <div className="bg-white rounded">
          <div className="p-4">
            <ProductHomePage customerId={customerDetail?.id} />
          </div>
        </div>
      </div>
      <ModalEditCustomer
        show={modalCustomerEditShowing}
        onClose={() => {
          setModalEditCustomerShowing(false);
        }}
        onExistDone={() => {
          dispatch(thunkGetCustomerDetail({ customerId: router.query.customerId }));
        }}
        customerItem={customerDetail}
        onRefreshCustomerList={() => {}}
      />
    </div>
  );
}

export default CustomerDetailScreen;
