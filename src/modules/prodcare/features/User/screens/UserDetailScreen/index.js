import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import useRouter from 'hooks/useRouter';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { UserHelper } from 'shared/helpers/UserHelper';
import { clearUserDetail, thunkGetUserDetail } from '../../userSlice';
import ModalEditUser from '../../components/ModalEditUser';
import IssueHomePage from 'modules/prodcare/features/Issue/screens/IssueHomeScreen';
import Utils from 'shared/utils/Utils';

UserDetailScreen.propTypes = {};

function UserDetailScreen(props) {
  // MARK: --- Params ---
  const router = useRouter();
  const { userDetail } = useSelector((state) => state?.user);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { current } = useSelector((state) => state?.auth);
  const [modalUserEditShowing, setModalEditUserShowing] = useState(false);

  const rows = useMemo(() => {
    return [
      { label: t('Email'), value: userDetail?.email ?? '' },
      {
        label: t('Fullname'),
        value: userDetail?.name ?? '',
      },
      { label: t('EmployeeId'), value: userDetail?.employee_id ?? '' },
      {
        label: t('Title'),
        value: userDetail?.title ?? '',
      },
      {
        label: t('Phone'),
        value: userDetail?.phone ?? '',
      },
      {
        label: t('DateOfBirth'),
        value: userDetail?.dob ? Utils.formatDateTime(userDetail?.dob, 'YYYY-MM-DD') : '',
      },
      {
        label: t('Role'),
        value: userDetail?.role ? t(UserHelper.getUserRoleText(userDetail?.role)) : '',
      },
    ];
  }, [userDetail]);

  // MARK: --- Hooks ---
  useEffect(() => {
    dispatch(thunkGetUserDetail({ employeeId: router.query.employeeId }));
    return () => {
      dispatch(clearUserDetail());
    };
  }, []);

  return (
    <div className="row">
      {/* user detail */}
      <div className="col-4">
        <div className="bg-white rounded px-4 mb-4">
          {rows?.map((item, index) => (
            <div
              key={index}
              className={`${
                current?.role !== 'ADMIN' && index === rows?.length - 1 ? '' : 'border-bottom'
              } py-2`}
            >
              <p className="font-weight-bolder mb-1">{item?.label}</p>
              <p className={`${index === 0 ? 'text-primary' : ''} m-0`}>
                {item?.value || <>&nbsp;</>}
              </p>
            </div>
          ))}
          {current?.role === 'ADMIN' ? (
            <button
              type="button"
              className="btn btn-outline-secondary my-2 w-100"
              onClick={(e) => {
                e.preventDefault();
                setModalEditUserShowing(true);
              }}
            >
              {t('Edit')}
            </button>
          ) : null}
        </div>
      </div>

      <div className="col-8">
        <div className="bg-white rounded">
          <div className="p-4">
            <IssueHomePage email={userDetail?.email} />
          </div>
        </div>
      </div>
      <ModalEditUser
        show={modalUserEditShowing}
        onClose={() => {
          setModalEditUserShowing(false);
        }}
        onExistDone={() => {
          dispatch(thunkGetUserDetail({ userId: router.query.userId }));
        }}
        userItem={userDetail}
        onRefreshUserList={() => {}}
      />
    </div>
  );
}

export default UserDetailScreen;
