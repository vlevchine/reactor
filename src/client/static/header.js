import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToaster, appState } from '@app/services';
import { useAppContext } from '@app/providers/contextProvider';
import { GoogleLogin } from '@app/shell/social';
import { Button, Icon } from '@app/components/core';
import '@app/App.css';

Header.propTypes = {
  config: PropTypes.object,
};
export default function Header({ config }) {
  const { dataProvider } = useAppContext(),
    { auth, nav, session: sess } = appState,
    { username, socialName } = auth.get(),
    { user, company } = sess.get(),
    [signed, sign] = useState(!!username),
    navigate = useNavigate(),
    toaster = useToaster(),
    navigateTo = (page) => navigate(`/${page.path}`),
    {
      logout,
      staticPages: { home, impersonate, app },
    } = config,
    { pathname } = useLocation(),
    isAppPage = pathname.split('/').filter(Boolean)[0] === app.path,
    onFailure = (err, msg) => {
      console.log(err, msg);
    },
    onGoolgeLogin = ({ provider, token }) => {
      onLogin(token, provider);
    },
    onLogin = async (token, authority = 'GOOGLE') => {
      const { error, session } = await dataProvider.login(
        token,
        authority
      );
      if (error) {
        toaster.danger('Error logging in with social provider');
      } else {
        auth.dispatch({ value: session });
        sign(!!session.username);
      }
    },
    onLogout = async () => {
      const { error } = await dataProvider.logout();
      if (!error) {
        auth.dispatch();
        sess.dispatch();
        sign(false);
        navigateTo(home);
      } else toaster.danger('Error logging out');
    };

  useEffect(() => {
    sess.dispatch({
      path: 'globals',
      value: user?.settings,
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
      <Button
        name="toggler"
        prepend="bars"
        minimal
        className="lg"
        // iconStyle="s"
        onClick={() => {
          nav.dispatch({ path: 'leftNavToggle', value: Symbol() });
        }}
      />
      <span className="header-title info">{company?.name}</span>
      {socialName && (
        <>
          <div
            className="info"
            style={{
              margin: '0 1rem',
              fontSize: '0.9em',
              paddingTop: '0.25rem',
            }}>
            <h6>{`Welcome, ${socialName} `}</h6>
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
            </span>
          </div>
          {signed && pathname !== impersonate.path && (
            <Button
              minimal
              prepend="user-friends"
              iconStyle="s"
              size="xl"
              className="info hint-left-bottom"
              tooltip="Impersonate"
              onClick={() => navigateTo(impersonate)}
              // text={impersonate.title}
            />
          )}
        </>
      )}
      <div className="header-right">
        <div
          id="h_options"
          className="flex-row"
          style={{ margin: '0 1rem' }}
        />
        <div id="h_buttons" style={{ margin: '0 1rem' }} />
        {user && !isAppPage && (
          <Button
            minimal
            prepend="browser"
            iconStyle="r"
            className="info"
            onClick={() => navigateTo(app)}
            text={app.title}
          />
        )}

        {signed ? (
          <Button
            minimal
            text={logout.name}
            prepend="sign-out-alt"
            iconStyle="s"
            size="lg"
            className="info"
            tooltip="Sign out"
            tooltipPos="left-bottom"
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
