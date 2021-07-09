import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { appState } from '@app/services';
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

const ProtectedPage = ({ guard, children }) => {
  const auth = appState.auth.get(),
    secured = allowAccess(auth, guard);

  return secured.error ? (
    <Navigate
      to={'/error'}
      state={{ ...secured.status, loc: useLocation() }}
    />
  ) : (
    children
  );
};

ProtectedPage.propTypes = {
  guard: PropTypes.func,
  loginInfo: PropTypes.object,
  children: PropTypes.any,
};

export default ProtectedPage;
