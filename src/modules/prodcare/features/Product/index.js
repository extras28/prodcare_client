import { Route, Routes } from 'react-router-dom';
import ProductHomePage from './screens/ProductHomeScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';

Product.propTypes = {};

function Product(props) {
  return (
    <Routes>
      <Route path="/" element={<ProductHomePage />} />
      <Route path="/detail/:productId" element={<ProductDetailScreen />} />
    </Routes>
  );
}

export default Product;
