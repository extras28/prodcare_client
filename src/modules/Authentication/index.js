import { Navigate, Route, Routes } from 'react-router-dom';
import AuthenticationBaseLayout from './components/AutheticationBaseLayout';
import SignInScreen from './screens/SignInScreen';

function Authentication(props) {
  return (
    <AuthenticationBaseLayout>
      <Routes>
        <Route path="/" element={<Navigate to="sign-in" />} />
        <Route path="sign-in/*" element={<SignInScreen />} />
      </Routes>
    </AuthenticationBaseLayout>
  );
}

export default Authentication;
