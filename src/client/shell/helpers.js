import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { appState } from '@app/services';

const codes = new Map([
  [200, 'OK'],
  [201, 'Created'],
  [202, 'Accepted'],
  [400, 'Bad Request'],
  [401, 'Unauthorized'], //login credentials are wrong
  [403, 'Forbidden'],
  [404, 'Not Found'],
  [406, 'Not acceptable'],
  [412, 'Precondition Failed'],
  [440, 'Login Time-out'],
]);

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

//hooks
const relativePath = (root = '') =>
    useLocation()
      .pathname //appState.nav.requestRoute
      .slice(root.length + 1)
      .split('/')
      .filter(Boolean),
  useRelativePath = (root) => relativePath(root),
  useParentPath = (path = '') => {
    const loc = useLocation().pathname;
    return loc.slice(0, loc.length - path.length);
  };
const usePageEnter = ({ id, key }, root) => {
  const loc = relativePath(root),
    pageId = loc[loc.indexOf(id) + 1];
  useEffect(() => {
    if (pageId) appState.nav.dispatch({ path: key, value: pageId });
  }, [pageId]);
  return pageId;
};

const toError = (navigate, path) => (error) =>
  navigate('/error', {
    state: { ...error, path },
  });

export {
  codes,
  allowAccess,
  usePageEnter,
  toError,
  useRelativePath,
  useParentPath,
};
