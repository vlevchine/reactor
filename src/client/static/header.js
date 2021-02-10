import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { AUTH, NAV, SESSION } from '@app/constants'; //NAV,
import { useAppContext } from '@app/providers/contextProvider';
import { useResources } from '@app/providers/resourceManager';
import { GoogleLogin } from '@app/shell/social';
import { Button, Icon } from '@app/components/core';
import '@app/App.css';

Header.propTypes = {
  dataProvider: PropTypes.object,
  config: PropTypes.object,
  store: PropTypes.object,
};
export default function Header({ config }) {
  const { store, dataProvider, notifier } = useAppContext(),
    { username, socialName } = store.getState(AUTH),
    { user, company } = store.getState(SESSION),
    [signed, sign] = useState(!!username),
    navigate = useNavigate(),
    navigateTo = (page) => navigate(`/${page.path}`),
    { home, impersonate, app, logout } = config.staticPages,
    { pathname } = useLocation(),
    isAppPage = pathname.split('/').filter(Boolean)[0] === app.path,
    { load } = useResources(),
    onFailure = (err, msg) => {
      console.log(err, msg);
    },
    onGoolgeLogin = ({ provider, token }) => {
      onLogin(token, provider);
    },
    onLogin = async (token, provider = 'GOOGLE') => {
      const { error, session } = await dataProvider.login(
        token,
        provider
      );
      if (error) {
        notifier.danger('Error logging in with social provider');
      } else {
        load();
        store.dispatch({
          [AUTH]: { value: session },
        });
        sign(!!session.username);
      }
    },
    onLogout = async () => {
      //TBD: clear all other store topics? c
      const { error } = await dataProvider.logout();
      if (!error) {
        store.dispatch(AUTH);
        store.dispatch(SESSION);
        sign(false);
        navigateTo(home);
      } else notifier.danger('Error logging out');
    };

  useEffect(() => {
    store.dispatch(NAV, {
      value: { uom: user?.uom, locale: user?.locale },
    });
  }, [user]);

  return (
    <>
      <div className="app-brand">
        <Button minimal onClick={() => navigateTo(home)}>
          <span className="app-brand info">
            {/* <img src={window.location.origin + '/logo.jpg'} alt="Logo"/> */}
            <Icon
              name={'globe'}
              styled="s"
              size="xxxl"
              className="spin"
            />
            <h1>{home.title}</h1>
          </span>
        </Button>
      </div>
      <div id="h-toggler" />
      <span className="header-title info">{company?.name}</span>
      {socialName && (
        <div
          className="info"
          style={{
            margin: '0 1rem',
            fontSize: '0.9em',
            paddingTop: '1rem',
          }}>
          {<h6>{`Welcome, ${socialName} `}</h6>}
          <span>
            {user ? (
              <span>
                impersonated as &nbsp;
                <strong>
                  <i>{user.name}</i>
                </strong>
              </span>
            ) : (
              <i>[not impersonated]</i>
            )}
            {signed && pathname !== impersonate.path && (
              <Button
                minimal
                icon="user-friends"
                iconStyle="s"
                iconSize="lg"
                className="info"
                tooltip="Impersonate"
                onClick={() => navigateTo(impersonate)}
                // text={impersonate.title}
              />
            )}
          </span>
        </div>
      )}
      <div className="header-right">
        <div
          id="h_options"
          style={{ display: 'flex', margin: '0 1rem' }}
        />
        <div id="h_buttons" style={{ margin: '0 1rem' }} />
        {user && !isAppPage && (
          <Button
            minimal
            icon="browser"
            iconStyle="r"
            className="info"
            onClick={() => navigateTo(app)}
            text={app.title}
          />
        )}

        {signed ? (
          <Button
            minimal
            text={logout.tile}
            icon="sign-out-alt"
            iconStyle="s"
            iconSize="lg"
            className="info"
            tooltip="Sign out"
            tooltipPos="left"
            onClick={onLogout}
          />
        ) : (
          <GoogleLogin
            id={process.env.GOOGLE_ID}
            onSuccess={onGoolgeLogin}
            onFailure={onFailure}
          />
        )}
      </div>
    </>
  );
}
