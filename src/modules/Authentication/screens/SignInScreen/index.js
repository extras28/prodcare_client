import { unwrapResult } from '@reduxjs/toolkit';
import { thunkSignIn } from 'app/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SignInForm from '../../components/SignInForm';
import { useTranslation } from 'react-i18next';
import KTBSDropdown, {
  KTBSDropdownAlignments,
} from 'shared/components/OtherKeenComponents/KTBSDropdown';
import AppData from 'shared/constants/AppData';
import Utils from 'shared/utils/Utils';
import LanguageHelper from 'shared/helpers/LanguageHelper';

SignInScreen.propTypes = {};

function SignInScreen(props) {
  // --- params: ---
  const { isSigningIn, current } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // --- functions: ---
  async function handleSubmit(values) {
    if (isSigningIn || values === null || values === undefined) {
      return;
    }
    const sha256Password = Utils.sha256(values.password);
    const params = { ...values, password: sha256Password };
    const res = unwrapResult(await dispatch(thunkSignIn(params)));
    const { result } = res;
    if (result === 'success') {
      navigate('/prodcare');
    }
    try {
    } catch (error) {
      console.log({ error });
    }
  }

  return (
    <div className="login-content flex-row-fluid d-flex flex-column p-10 bg-transparent">
      {/* begin::Top */}
      <div className="text-right d-flex justify-content-end align-items-center">
        <div className="top-signin text-right d-flex justify-content-end pb-lg-0"></div>
        {/* Language */}
        <div className="">
          {/* language */}
          <KTBSDropdown
            toggleElement={
              <div className="topbar-item">
                <div className="btn btn-clean btn-lg mr-1 d-flex align-items-center">
                  <h4 className="mb-0 mr-4">{LanguageHelper.getCurrentLanguage()}</h4>
                  <img
                    alt="icon"
                    src={LanguageHelper.getCurrentLanguageIcon()}
                    className="w-25px h-25px rounded"
                  />
                </div>
              </div>
            }
            alignment={KTBSDropdownAlignments.end}
            dropdownMenuClassName="dropdown-menu-sm"
            dropdownMenuItems={AppData.languageItems}
            selectedValue={LanguageHelper.getCurrentLanguage()}
            onChange={(newValue) => {
              LanguageHelper.changeLanguage(newValue);
            }}
          />
        </div>
      </div>
      {/* end::Top */}

      {/* begin::Wrapper */}
      <div className="d-flex flex-row-fluid flex-center justify-content-center">
        {/* begin::Sign In */}
        <div className="login-form bg-white p-8 w-lg-400px w-md-300px rounded-lg">
          {/* begin: Form */}
          <SignInForm onSubmit={handleSubmit} />
          {/* end: Form */}
        </div>
        {/* end::Sign In */}
      </div>
      {/* end::Wrapper */}
    </div>
  );
}

export default SignInScreen;
