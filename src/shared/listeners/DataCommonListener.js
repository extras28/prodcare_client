import {
  thunkGetAllComponent,
  thunkGetAllCustomer,
  thunkGetAllProduct,
  thunkGetAllProject,
} from 'app/appSlice';
import useRouter from 'hooks/useRouter';
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
      dispatch(thunkGetAllCustomer());
    }
  }, [currentUser, projects]);

  useEffect(() => {
    if (!_.isEmpty(currentUser) && AccountHelper.checkAccessTokenValid() && !!currentProject?.id) {
      dispatch(thunkGetAllProduct({ projectId: currentProject?.id }));
      dispatch(thunkGetAllComponent({ projectId: currentProject?.id }));
    }
  }, [currentUser, currentProject]);

  return <></>;
}

export default DataCommonListener;
