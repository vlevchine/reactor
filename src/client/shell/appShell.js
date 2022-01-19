import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { appState, useNavigation } from '@app/services';
import { useAppContext } from '@app/providers';
import LeftNav from '@app/static/leftNav';
import { Button, ButtonGroup, Select } from '@app/components/core';
import { Portal } from '@app/components';
import appParams, { setFormats } from '@app/utils/formatter';
import '@app/content/styles.css';

AppShell.propTypes = {
  config: PropTypes.object,
  dflt: PropTypes.string,
  root: PropTypes.string,
  routes: PropTypes.array,
};
export default function AppShell({ dflt, root, config, routes }) {
  //Globals initially set by ctx, then if changed ctx globals reset here
  //user/session setting not updated - so could return to those if needed
  const ctx = useAppContext(),
    { company, user } = ctx,
    { nav } = appState;
  const [globals, setGlobals] = useState(ctx.globals),
    { Outlet, navigate, Navigate, pathname } = useNavigation(),
    {
      staticPages,
      headerLinks,
      headerOptions,
      guards,
      menu,
    } = config,
    pathToks = pathname.split('/').filter(Boolean),
    path = pathToks[0] === root ? pathToks.slice(1) : pathToks,
    menuGuarded = useMemo(() => {
      return filterMenu(menu, guards, company?.allowedPages, user);
    }, [user]),
    onOptionsSelect = (value, id) => {
      if (globals[id] === value) return;
      const globs = { ...globals, [id]: value };
      setFormats(globs);
      setGlobals(globs);
      ctx.globals = globs;
      nav.dispatch({ path: 'globals', value: globs });
    },
    onNav = (data) => {
      if (data?.requestRoute) {
        const { key, id } = data.requestRoute;
        let route = routes.find((e) => e.key === key)?.route;
        if (route?.includes(':id')) route = route.replace(':id', id);
        if (route) navigate(route);
      }
    };

  useEffect(() => {
    const n_sub = nav.subscribe(onNav);
    //if (n) navigate(['.', n.route, n.id].join('/'));
    return () => nav.unsubscribe(n_sub);
  }, []);

  return !user ? ( //if user unauth
    <Navigate
      to={`/${staticPages.home.path}`}
      replace
      state={{ error: { code: 404, message: 'No session found.' } }}
    />
  ) : path.length > 0 ? (
    <>
      <Portal id="h_options">
        {headerOptions.map(({ id, icon }) => (
          <Select
            key={id}
            id={id}
            prepend={icon}
            underline
            intent="info"
            innerStyle={{ width: id === 'uom' ? '9ch' : '12ch' }}
            options={appParams[id]}
            value={globals[id]}
            onChange={onOptionsSelect}
          />
        ))}
      </Portal>
      <Portal id="h_buttons">
        <ButtonGroup minimal>
          {headerLinks.map(({ id, icon }) => (
            <Button
              key={id}
              id={id}
              prepend={icon}
              iconStyle="r"
              onClick={(_, id) => {
                navigate(`/${id}`);
              }}
            />
          ))}
        </ButtonGroup>
      </Portal>
      <main className="app-content fade-in">
        <Outlet />
      </main>
      <LeftNav
        config={config}
        ctx={ctx}
        menu={menuGuarded}
        onClick={onNav}
      />
      {/*      <div id="main-portal"></div>*/}
    </>
  ) : (
    <Navigate to={dflt} replace />
  );
}

function passPage(key, pages, lengths) {
  const length = key.split('.').length;
  return pages.find((p, i) =>
    lengths[i] > length ? p.startsWith(key) : key.startsWith(p)
  );
}
function filterMenu(items = [], guards = [], pages = [], user) {
  const p_length = pages.map((p) => p.split('.').length);
  return user
    ? items.reduce((acc, e) => {
        const pass =
          passPage(e.key, pages, p_length) && //(p) => e.key.startsWith(p)) &&
          user.authorized(guards[e.key]);
        if (pass) {
          const item = { ...e };
          acc.push(item);
          if (e.items) {
            item.items = filterMenu(e.items, guards, pages, user);
          } else if (e.tabs) {
            item.tabs = filterMenu(e.tabs, guards, pages, user);
          }
        }
        return acc;
      }, [])
    : [];
}
