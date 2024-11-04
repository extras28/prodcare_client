import { Field, Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ClipLoader from 'react-spinners/ClipLoader';
import * as Yup from 'yup';
import BigInputField from 'shared/custom-fields/BigInputField';
import AppResource from 'shared/constants/AppResource';

function SignInForm({ onSubmit = null, onSignInGoogle = null }) {
  const { t } = useTranslation();
  const initialValues = {
    email: '',
    password: '',
  };
  
  const validationSchema = Yup.object().shape({
    username: Yup.string().required(t('UsernameIsRequired')),
    password: Yup.string().trim().required(t('PasswordIsRequired')),
  });

  const { isSigningIn } = useSelector((state) => state.auth);
  const [showModalForgotPassword, setShowModalForgotPassword] = useState(false);

  return (
    <div>
      <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
        {(formikProps) => {
          const { values, errors, touched, isSubmitting } = formikProps;

          return (
            <Form>
              {/* begin: Title */}
              <div className="pb-5 fv-plugins-icon-container">
                <h3 className="font-weight-bolder text-black font-size-h2 font-size-h1-lg">
                  {t('ProdCare')}
                </h3>
              </div>
              {/* end: Title */}

              <Field
                name="username"
                component={BigInputField}
                label={t('Username')}
                placeholder={`${t('Username')}...`}
              />

              <Field
                name="password"
                component={BigInputField}
                type="password"
                label={t('Password')}
                placeholder={`${t('Password')}...`}
              />

              <div className="pb-lg-0 pb-5 hover fv-plugins-icon-container">
                <button
                  type="submit"
                  className={`btn btn-primary font-weight-bolder font-size-h6 py-4 my-3 px-10 hover-opacity-80 d-flex flex-row align-items-center`}
                  style={{
                    backgroundColor: AppResource.colors.feature,
                    border: 0,
                  }}
                >
                  {isSigningIn && <ClipLoader color="#fff" className="mr-3" size={20} />} 
                  {t('SignIn')}
                </button>
              </div>

              {/* <p className="cursor-pointer" onClick={() => setShowModalForgotPassword(true)}>
                {t('ForgotPassword')}?
              </p> */}
            </Form>
          );
        }}
      </Formik>

      {/* Modal forgot password */}
      {/* <ModalForgotPassword
        show={showModalForgotPassword}
        onClose={() => {
          setShowModalForgotPassword(false);
        }}
      /> */}
    </div>
  );
}

SignInForm.propTypes = {
  onSubmit: PropTypes.func,
  onSignInGoogle: PropTypes.func,
};

export default SignInForm;
