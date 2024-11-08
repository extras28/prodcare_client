import { Navigate, Route, Routes } from 'react-router-dom';
import UserDetailScreen from './screens/UserDetailScreen';
import UserHomePage from './screens/UserHomeScreen';

User.propTypes = {};

function User(props) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="home" />} />
      <Route path="home/*" element={<UserHomePage />} />
      <Route path="detail/:employeeId" element={<UserDetailScreen />} />
    </Routes>
  );
}

export default User;
