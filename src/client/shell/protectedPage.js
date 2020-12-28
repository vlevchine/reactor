import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { AUTH } from '@app/constants';
import { codes } from './helpers';

const allowAccess = (info = {}, guard) => {
  const { isAuth, user, exp } = info,
    code = !guard
      ? 202
      : !isAuth
      ? 401
      : Date.now() > exp
      ? 440
      : !guard(user, isAuth)
      ? 403
      : 200;

  return {
    status: { code, message: codes.get(code) || 'UNKNOWN' },
    error: code > 399, //Ignore guard, proper use: code > 399,
  };
};

const ProtectedPage = ({ guard, store, children }) => {
  const auth = store.getState(AUTH),
    secured = allowAccess(auth, guard);

  return secured.error ? (
    <Navigate
      to={'/error'}
      store={store}
      state={{ ...secured.status, loc: useLocation() }}
    />
  ) : (
    children
  );
};

ProtectedPage.propTypes = {
  guard: PropTypes.func,
  loginInfo: PropTypes.object,
  store: PropTypes.object,
  children: PropTypes.any,
};

export default ProtectedPage;
