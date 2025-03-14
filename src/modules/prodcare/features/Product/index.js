import { Route, Routes } from 'react-router-dom';
import ProductHomePage from './screens/ProductHomeScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import ProductListScreen from './screens/ProductListScreen';

Product.propTypes = {};

function Product(props) {
  return (
    <Routes>
      <Route path="/" element={<ProductListScreen />} />
      {/* <Route
        path="/"
        element={
          process.env.REACT_APP_ENVIRONMENT == 'DEV' ? <ProductListScreen /> : <ProductHomePage />
        }
      /> */}
      <Route path="/list" element={<ProductListScreen />} />
      <Route path="/detail/:productId" element={<ProductDetailScreen />} />
    </Routes>
  );
}

export default Product;
