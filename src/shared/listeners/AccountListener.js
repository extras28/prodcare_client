import { thunkGetAccountInfor } from 'app/authSlice';
import _ from 'lodash';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AccountHelper from 'shared/helpers/AccountHelper';

AccountListener.propTypes = {};

const sTag = '[AccountListener]';

function AccountListener(props) {
  // MARK: --- Params ---
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.current);

  // MARK: --- Hooks ---
  useEffect(() => {
    if (_.isEmpty(currentUser) && AccountHelper.checkAccessTokenValid()) {
      dispatch(thunkGetAccountInfor());
    }
  }, [currentUser]);

  return <></>;
}

export default AccountListener;
