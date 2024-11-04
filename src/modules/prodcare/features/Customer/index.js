import { Route, Routes } from 'react-router-dom';
import CustomerDetailScreen from './screens/CustomerDetailScreen';
import CustomerHomePage from './screens/CustomerHomeScreen';

Customer.propTypes = {};

function Customer(props) {
  return (
    <Routes>
      <Route path="/" element={<CustomerHomePage />} />
      <Route path="/detail/:customerId" element={<CustomerDetailScreen />} />
    </Routes>
  );
}

export default Customer;
