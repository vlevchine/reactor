import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { AUTH, NAV, SESSION } from '@app/constants'; //NAV,
import { useAppContext } from '@app/providers/contextProvider';
import { GoogleLogin } from '@app/shell/social';
import { Button, Icon } from '@app/components/core';
import '@app/App.css';

Header.propTypes = {
  dataProvider: PropTypes.object,
  config: PropTypes.object,
  store: PropTypes.object,
};
export default function Header({ config }) {
  const {
      store,
      dataProvider,
      notifier,
      useResources,
    } = useAppContext(),
    { username, socialName } = store.getState(AUTH),
    { user, company } = store.getState(SESSION),
    [signed, sign] = useState(!!username),
    navigate = useNavigate(),
    { title, rootPath } = config,
    appRoute = `/${rootPath}`,
    isAppPage = useLocation().pathname.startsWith(appRoute),
    { load } = useResources(),
    onFailure = (err, msg) => {
      console.log(err, msg);
    },
    onGoolgeLogin = ({ provider, token }) => {
      onLogin(token, provider);
    },
    onLogin = async (token, provider = 'GOOGLE') => {
      const { error, versions, session } = await dataProvider.login(
        token,
        provider
      );
      if (error) {
        notifier.danger('Error logging in with social provider');
      } else {
        load(versions);
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
        navigate('/');
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
        <Button minimal onClick={() => navigate('/')}>
          <span className="app-brand primary ">
            <Icon
              fa
              name="atom-alt"
              styled="sl"
              size="xxl"
              className="spin"
            />
            <h1>{title}</h1>
          </span>
        </Button>
      </div>
      <div id="h-toggler" />
      <span className="header-title">{company?.name}</span>
      {socialName && (
        <div style={{ margin: '0 1rem' }}>
          {<h5>{`Welcome, ${socialName} `}</h5>}
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
        </div>
      )}
      <div className="header-right">
        <div id="h_buttons" />
        {user && !isAppPage && (
          <Button
            minimal
            icon="user-friends"
            iconStyle="r"
            className="lg-1 primary max-xl"
            onClick={() => navigate(appRoute)}
            text={<h6>Main app</h6>}
          />
        )}
        {signed && (
          <Button
            minimal
            icon="user-friends"
            iconStyle="r"
            className="lg-1 primary max-xl"
            onClick={() => navigate('/impersonate')}
            text={<h6>Impersonate</h6>}
          />
        )}
        {signed ? (
          <Button
            minimal
            text={<h6>Logout</h6>}
            icon="sign-out"
            iconStyle="s"
            className="lg-2 primary max-xl"
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
