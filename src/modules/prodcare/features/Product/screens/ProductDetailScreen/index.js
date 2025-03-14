import { unwrapResult } from '@reduxjs/toolkit';
import useRouter from 'hooks/useRouter';
import IssueHomePage from 'modules/prodcare/features/Issue/screens/IssueHomeScreen';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import AppData from 'shared/constants/AppData';
import Utils from 'shared/utils/Utils';
import ModalEditProduct from '../../components/ModalEditProduct';
import ProductActivityTab from '../../components/ProductActivityTab';
import { clearProductDetail, thunkGetProductDetail } from '../../productSlice';

ProductDetailScreen.propTypes = {};

function ProductDetailScreen(props) {
  // MARK: --- Params ---
  const router = useRouter();
  const { productDetail, issues } = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [modalProductEditShowing, setModalEditProductShowing] = useState(false);
  const { current } = useSelector((state) => state?.auth);
  const { customers } = useSelector((state) => state?.app);

  const rows = useMemo(() => {
    const count = issues.filter((item) => item.status != 'PROCESSED')?.length;
    const active = count > 0 ? 'DEFECTIVE' : 'GOOD';
    return [
      { label: t('Serial'), value: productDetail?.serial ?? '' },
      { label: t('ProductName'), value: productDetail?.name ?? '' },
      {
        label: t('Customer'),
        value: productDetail?.customer?.name
          ? `${productDetail?.customer?.name} - ${productDetail?.customer?.military_region}`
          : '',
      },
      { label: t('SoftwareVersion'), value: productDetail?.version ?? '' },
      {
        label: t('CurrentStatus'),
        value: productDetail?.status
          ? t(
              AppData.productCurrentStatus.find((item) => item?.value === productDetail?.status)
                ?.name
            )
          : '',
        className: `badge badge-${productDetail?.status === 'USING' ? 'primary' : 'warning'}`,
      },
      {
        label: t('Status'),
        value:
          active == 'GOOD'
            ? t('Good')
            : active == 'DEFECTIVE'
            ? t('HaveErrors')
            : t('OperationalWithErrors'),
        className: `badge badge-${
          active == 'GOOD' ? 'success' : active == 'DEFECTIVE' ? 'danger' : 'warning'
        }`,
      },
      { label: t('WarrantyStatus'), value: productDetail?.warranty_status ?? '' },
      {
        label: t('Mfg'),
        value: productDetail?.mfg ? Utils.formatDateTime(productDetail?.mfg, 'YYYY-MM-DD') : '',
      },
      {
        label: t('HandedOverTime'),
        value: productDetail?.handed_over_time
          ? Utils.formatDateTime(productDetail?.handed_over_time, 'YYYY-MM-DD')
          : '',
      },
    ];
  }, [productDetail, issues]);

  // MARK: --- Functions ---

  async function getProductDetail() {
    try {
      const res = unwrapResult(
        await dispatch(thunkGetProductDetail({ productId: router.query.productId }))
      );
    } catch (error) {
      console.error(`Get product detail error: ${error}`);
    }
  }

  // MARK: --- Hooks ---
  useEffect(() => {
    getProductDetail();
    return () => {
      dispatch(clearProductDetail());
    };
  }, []);

  return (
    <div className="row">
      {/* product detail */}
      <div className="col-4">
        <div className="bg-white rounded px-4 mb-4">
          {rows?.map((item, index) => (
            <div
              key={index}
              className={`${
                current?.role !== 'USER' && current?.role !== 'ADMIN' && index === rows?.length - 1
                  ? ''
                  : 'border-bottom'
              } py-2 d-flex justify-content-between`}
            >
              <span className="font-weight-bolder mb-1">{item?.label}</span>
              <span className={`${index === 0 ? 'text-primary' : ''} m-0 ${item.className}`}>
                {item?.value || <>&nbsp;</>}
              </span>
            </div>
          ))}
          {current?.role === 'USER' || current?.role === 'ADMIN' ? (
            <button
              type="button"
              className="btn btn-outline-secondary my-2 w-100"
              onClick={(e) => {
                e.preventDefault();
                setModalEditProductShowing(true);
              }}
            >
              {t('Edit')}
            </button>
          ) : null}
        </div>
        <ProductActivityTab />
      </div>

      <div className="col-8">
        <div className="bg-white rounded">
          <div className="p-4">
            <IssueHomePage name={productDetail?.name} productId={productDetail?.id} />
          </div>
        </div>
      </div>

      <ModalEditProduct
        show={modalProductEditShowing}
        customers={customers}
        onClose={() => {
          setModalEditProductShowing(false);
        }}
        onExistDone={() => {
          getProductDetail();
        }}
        productItem={productDetail}
      />
    </div>
  );
}

export default ProductDetailScreen;
