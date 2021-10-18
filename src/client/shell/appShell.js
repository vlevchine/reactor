import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Outlet,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import { appState } from '@app/services';
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
  const { session, auth, nav } = appState,
    { username } = auth.get(),
    { user, globals: globs } = session.get();
  const [globals, setGlobals] = useState(globs),
    navigate = useNavigate(),
    { staticPages, headerLinks, headerOptions } = config,
    loc = useLocation(),
    pathToks = loc.pathname.split('/').filter(Boolean),
    path = pathToks[0] === root ? pathToks.slice(1) : pathToks,
    onOptionsSelect = (value, id) => {
      const globs = { ...globals, [id]: value };
      setFormats(globs);
      setGlobals(globs);
      session.dispatch({ path: 'globals', value: globs });
    },
    onNav = ({ requestRoute }) => {
      if (requestRoute) {
        const { key, id } = requestRoute;
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

  console.log('AppShell');

  return !username || !user ? ( //if user unauth
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
            dataid={id}
            prepend={icon}
            minimal
            hover
            //style={headerOptStyle[i]}
            className="info"
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
              className="info"
              onClick={(_, id) => {
                navigate(`/${id}`);
              }}
            />
          ))}
        </ButtonGroup>
      </Portal>
      <LeftNav config={config} onClick={onNav} />
      <Outlet />
      <div id="main-portal"></div>
    </>
  ) : (
    <Navigate to={dflt} replace />
  );
}
