import { Navigate } from "react-router-dom";
import AccountHelper from "shared/helpers/AccountHelper";

// Route danh cho tai khoan chua dang nhap (Guest)
// Neu da dang nhap thi nhay ve man hinh root '/'
function GuestRoute(props) {
  // MARK: --- Params ---
  const isAuth = AccountHelper.checkAccessTokenValid();

  return !isAuth ? props.children : <Navigate to="/" />;
}

export default GuestRoute;
