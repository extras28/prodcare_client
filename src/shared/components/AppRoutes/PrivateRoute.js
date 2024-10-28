import { Navigate } from 'react-router-dom';
import AccountHelper from 'shared/helpers/AccountHelper';

// Route yeu cau phai dang nhap
// Neu chua dang nhap nhay ve man hinh dang nhap '/sign-in'
function PrivateRoute(props) {
  // MARK: --- Params ---
  const isAuth = AccountHelper.checkAccessTokenValid();

  return isAuth ? props.children : <Navigate to="/auth" />;
}

export default PrivateRoute;
