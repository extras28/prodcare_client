import {
  thunkGetAllComponent,
  thunkGetAllCustomer,
  thunkGetAllProduct,
  thunkGetAllProject,
  thunkGetAllReason,
  thunkGetAllUser,
} from 'app/appSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AccountHelper from 'shared/helpers/AccountHelper';

DataCommonListener.propTypes = {};

const sTag = '[DataCommonListener]';

function DataCommonListener(props) {
  // MARK: --- Params ---
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.current);
  const { projects } = useSelector((state) => state.project);
  const { currentProject } = useSelector((state) => state.app);

  // MARK: --- Hooks ---
  useEffect(() => {
    if (!_.isEmpty(currentUser) && AccountHelper.checkAccessTokenValid()) {
      dispatch(thunkGetAllProject());
    }
  }, [currentUser, projects]);

  useEffect(() => {
    if (!_.isEmpty(currentUser) && AccountHelper.checkAccessTokenValid() && !!currentProject?.id) {
      dispatch(thunkGetAllProduct({ projectId: currentProject?.id }));
      dispatch(thunkGetAllComponent({ projectId: currentProject?.id }));
      dispatch(thunkGetAllReason({ projectId: currentProject?.id }));
    }
  }, [currentUser, currentProject]);

  useEffect(() => {
    if (!_.isEmpty(currentUser) && AccountHelper.checkAccessTokenValid()) {
      dispatch(thunkGetAllCustomer());
      dispatch(thunkGetAllUser());
    }
  }, [currentUser]);

  return <></>;
}

export default DataCommonListener;
