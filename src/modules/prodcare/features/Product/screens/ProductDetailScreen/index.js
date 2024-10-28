import { unwrapResult } from '@reduxjs/toolkit';
import useRouter from 'hooks/useRouter';
import IssueHomePage from 'modules/prodcare/features/Issue/screens/IssueHomeScreen';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Utils from 'shared/utils/Utils';
import ModalEditProduct from '../../components/ModalEditProduct';
import ProductActivityTab from '../../components/ProductActivityTab';
import { clearProductDetail, thunkGetProductDetail } from '../../productSlice';

ProductDetailScreen.propTypes = {};

function ProductDetailScreen(props) {
  // MARK: --- Params ---
  const router = useRouter();
  const { productDetail } = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [modalProductEditShowing, setModalEditProductShowing] = useState(false);
  const { current } = useSelector((state) => state?.auth);
  const { customers } = useSelector((state) => state?.app);

  const rows = useMemo(() => {
    return [
      { label: t('Serial'), value: productDetail?.serial ?? '' },
      { label: t('ProductName'), value: productDetail?.name ?? '' },
      {
        label: t('Customer'),
        value: productDetail?.customer?.name
          ? `${productDetail?.customer?.military_region} - ${productDetail?.customer?.name}`
          : '',
      },
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
  }, [productDetail]);

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
            <IssueHomePage productId={productDetail?.id} />
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
