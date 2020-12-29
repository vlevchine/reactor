/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Outlet,
  useLocation,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import { NAV, AUTH } from '@app/constants';
//import SideNav from '@app/shell/sideNav';
import { Accordion, Button, ButtonGroup } from '@app/components/core';
import { Portal } from '@app/components';
import { filterMenu } from './helpers';
import { classNames, findInItems } from '@app/helpers';

AppShell.propTypes = {
  config: PropTypes.object,
  plgConfig: PropTypes.object,
  dataProvider: PropTypes.object,
  store: PropTypes.object,
};

export default function AppShell(props) {
  const { config, store } = props,
    { sideCollapsed } = store.getState(NAV),
    { user } = store.getState(AUTH),
    navigate = useNavigate(),
    { defaultPage, welcomePage, routes, headerLinks } = config, //headerOptions
    path = useLocation()
      .pathname //navState.requestedRoute
      .slice(config.rootPath.length + 1)
      .split('/')
      .filter(Boolean),
    [collapsed, collapse] = useState(sideCollapsed),
    menuGuarded = useMemo(() => filterMenu(config, user), [user]),
    defPage = findInItems(routes, path, { exact: true }),
    selected = defPage
      ? findInItems(menuGuarded, defPage.key)
      : menuGuarded[0],
    onNav = (to) => {
      const item = routes.find((e) => e.id === to);
      item && navigate(item.route);
    };

  //where to if user unauth
  if (!user)
    return (
      <Navigate
        to={welcomePage.path}
        replace
        state={{ error: { code: 404, message: 'No session found.' } }}
      />
    );

  return path.length > 0 ? (
    <>
      <aside
        className={classNames(['app-sidenav'], {
          collapsed: collapsed,
        })}>
        {collapsed ? (
          <div>Menu</div>
        ) : (
          <Accordion
            items={menuGuarded}
            onSelect={onNav}
            expandAll
            selected={selected?.key}
            // className="lg-1"
          />
        )}
      </aside>
      <Portal id="h-toggler">
        <Button
          name="toggler"
          icon="bars"
          minimal
          className="lg"
          onClick={() => collapse((e) => !e)}
        />
      </Portal>
      <Portal id="h_buttons">
        <ButtonGroup minimal style={{ margin: '0 1rem' }}>
          {headerLinks.map(({ route, icon }) => (
            <Button
              key={route}
              id={route}
              icon={icon}
              iconStyle="s"
              className="lg-1 primary"
              onClick={(_, id) => {
                navigate(`/${id}`);
              }}
            />
          ))}
        </ButtonGroup>
      </Portal>
      <main id="appMain" className="app-main">
        <Outlet />
        <div id="main-portal"></div>
      </main>
    </>
  ) : (
    <Navigate to={defaultPage.route} />
  );
}

/* 
   onOptionsSelect = (value, id) => {
   const globs = { ...globals, [id]: value };
   setGlobals(globs);
   store.dispatch(NAV, { path: ['globals'], value: globs });
 },
         {headerOptions.map(({ id, icon }) => (style={{ fontSize: '18px', transform: 'scale(0.8)' }}
          <Select
            key={id}
            dataid={id}
            icon={icon}
            minimal
            style={{ width: '12rem' }}
            options={config[id]}
            value={globals[id]}
            display={(e) => <strong>{e.label}</strong>}
            onChange={onOptionsSelect}
          />
        ))} 
       */
