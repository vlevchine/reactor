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
import { NAV, AUTH, SESSION } from '@app/constants';
import {
  Accordion,
  Button,
  ButtonGroup,
  Select,
} from '@app/components/core';
import { Portal } from '@app/components';
import { filterMenu } from './helpers';
import { classNames, findInItems } from '@app/helpers';
import appParams, { setFormats } from '@app/utils/formatter';

AppShell.propTypes = {
  config: PropTypes.object,
  plgConfig: PropTypes.object,
  dataProvider: PropTypes.object,
  store: PropTypes.object,
};
//const headerOptStyle = [{ width: '6.5rem' }, { width: '8rem' }];
export default function AppShell(props) {
  const { config, store } = props,
    navState = store.getState(NAV),
    { username } = store.getState(AUTH),
    { user } = store.getState(SESSION),
    [globals, setGlobals] = useState(navState.globals),
    navigate = useNavigate(),
    {
      staticPages,
      routes,
      headerLinks,
      headerOptions,
      defaultPage,
    } = config,
    { home } = staticPages,
    path = useLocation().pathname.split('/').filter(Boolean).slice(1), //starts with app.path
    [collapsed, collapse] = useState(navState.sideCollapsed),
    menuGuarded = useMemo(() => filterMenu(config, user), [user]),
    defPage = findInItems(routes, path, { exact: true }),
    selected = defPage
      ? findInItems(menuGuarded, defPage.key)
      : menuGuarded[0],
    onOptionsSelect = (value, id) => {
      const globs = { ...globals, [id]: value };
      setFormats(globs);
      setGlobals(globs);
      store.dispatch(NAV, { path: ['globals'], value: globs });
    },
    onNav = (ev, to) => {
      const item = routes.find((e) => e.id === to);
      item && navigate(item.route);
    };

  //where to if user unauth
  if (!username || !user)
    return (
      <Navigate
        to={`/${home.path}`}
        replace
        state={{ error: { code: 404, message: 'No session found.' } }}
      />
    );

  return path.length > 0 ? (
    <>
      <Portal id="sidenav">
        <div
          className={classNames(['sidenav'], {
            collapsed: collapsed,
          })}>
          {collapsed ? (
            <div>Menu</div>
          ) : (
            <Accordion
              items={menuGuarded}
              onSelect={onNav}
              selected={selected?.key}
              spec={{ label: (t) => t.label }}
              // className="lg"
            />
          )}
        </div>
      </Portal>

      <Portal id="h-toggler">
        <Button
          name="toggler"
          prepend="bars"
          minimal
          className="lg"
          iconStyle="s"
          onClick={() => collapse((e) => !e)}
        />
      </Portal>
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
          {headerLinks.map(({ route, icon }) => (
            <Button
              key={route}
              id={route}
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
      <Outlet />
      <div id="main-portal"></div>
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
            prepend={icon}
            minimal
            style={{ width: '12rem' }}
            options={config[id]}
            value={globals[id]}
            display={(e) => <strong>{e.label}</strong>}
            onChange={onOptionsSelect}
          />
        ))} 
       */
