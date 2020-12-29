import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV } from '@app/constants';
import { _ } from '@app/helpers';

const { intersect } = _;

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

const authorized = (user, guard) => {
  if (!guard) return true;
  const { roles = [] } = user,
    { inRole = [], offRole } = guard;
  return offRole
    ? !intersect(roles, offRole)
    : intersect(roles, inRole);
};
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
  },
  filterMenu = ({ menu, guards }, user) =>
    (user ? menu : []).reduce((acc, e) => {
      const pass = !e.noNav &&
        authorized(user, guards[e.key]) && { ...e };
      if (pass) {
        if (e.items) {
          pass.items = e.items.filter((t) => {
            const tabsAllow =
              !t.tabs ||
              t.tabs.filter((tb) => authorized(user, guards[tb]))
                .length > 0;
            return tabsAllow && authorized(user, guards[t.key]);
          });
        }
        if (
          e.tabs &&
          !e.tabs.filter((tb) => authorized(user, guards[tb])).length
        )
          pass.items = [];

        if (!pass.items || pass.items.length) acc.push(pass);
      }
      return acc;
    }, []);

//hooks
const relativePath = (root = '') =>
  useLocation()
    .pathname //navState.requestedRoute
    .slice(root.length + 1)
    .split('/')
    .filter(Boolean);
const usePageEnter = ({ id, key }, root, store) => {
  const loc = relativePath(root),
    pageId = loc[loc.indexOf(id) + 1];
  useEffect(() => {
    if (pageId) store.dispatch(NAV, { path: key, value: pageId });
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
  filterMenu,
  usePageEnter,
  authorized,
  toError,
  relativePath,
};
