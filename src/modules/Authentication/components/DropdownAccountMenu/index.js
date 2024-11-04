import { thunkSignOut } from 'app/authSlice';
import { t } from 'i18next';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PreferenceKeys from 'shared/constants/PreferenceKeys';
import AccountHelper from 'shared/helpers/AccountHelper';
import Swal from 'sweetalert2';
import ModalChangePassword from '../ModalChangePassword';

function DropdownAccountMenu(props) {
  // MARK: --- Params ---
  const currentLoggedInUser = useSelector((state) => state.auth?.current);
  const dispatch = useDispatch();
  const [showModalChangePassword, setShowModalChangePassword] = useState(false);

  // MARK: --- functions ---
  function handleSignOut(e) {
    e.preventDefault();
    Swal.fire({
      title: t('Confirm'),
      text: t('MessageConfirmSignOut'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t('Yes'),
      cancelButtonText: t('Cancel'),
      customClass: {
        confirmButton: 'btn btn-danger font-weight-bolder',
        cancelButton: 'btn btn-light font-weight-bolder',
      },
    }).then(async function (result) {
      if (result.value) {
        dispatch(thunkSignOut());
        AccountHelper.signOut();
      }
    });
  }

  return (
    <div>
      <div className="card card-custom min-w-225px shadow">
        <div className="card-body">
          {/* user */}
          <div className="text-center mb-0">
            <div className="symbol symbol-60 symbol-xl-90">
              <div
                className="symbol-label bg-white"
                style={{
                  backgroundImage: `url(${AccountHelper.getAccountAvatar(currentLoggedInUser)})`,
                  backgroundSize: 'contain',
                }}
              ></div>
              <i className="symbol-badge symbol-badge-bottom bg-success" />
            </div>

            <h4 className="font-weight-bolder my-2">
              {AccountHelper.getDisplayName(currentLoggedInUser) ??
                localStorage.getItem(PreferenceKeys.savedLoginName)}
            </h4>
            <div className="text-primary font-weight-bold mb-2">
              {t(currentLoggedInUser?.email)}
            </div>
            <div className="text-dark font-weight-bold mb-2">
              {t(currentLoggedInUser?.accountLevel)}
            </div>
          </div>

          <hr className="" />

          {/* nav */}
          {/* <div
            className="btn btn-light-primary font-weight-bold py-3 px-6 mb-2 text-center btn-block"
            style={{
              whiteSpace: 'nowrap',
            }}
            onClick={() => {
              // setShowModalAccountInfo(true);
            }}
          >
            {t('AccountInfo')}
          </div> */}
          <div
            className="btn btn-primary font-weight-bold py-3 px-6 mb-4 text-center btn-block"
            style={{
              whiteSpace: 'nowrap',
            }}
            onClick={() => {
              setShowModalChangePassword(true);
            }}
          >
            {t('ChangePassword')}
          </div>
          <a
            href="#"
            onClick={handleSignOut}
            className="btn btn-danger font-weight-bold py-3 px-6 mb-2 text-center btn-block"
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            {t('SignOut')}
          </a>
        </div>
      </div>

      {/* Modal change password */}
      <ModalChangePassword
        show={showModalChangePassword}
        onClose={() => {
          setShowModalChangePassword(false);
        }}
      />
    </div>
  );
}

export default DropdownAccountMenu;
