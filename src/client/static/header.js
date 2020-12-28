import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { AUTH, SESSION } from '@app/constants'; //NAV,
import { useAppContext } from '@app/providers/contextProvider';
import { GoogleLogin, GoogleLogout } from '@app/shell/social';
// import { useError } from '@app/shell/routerHooks';
import { Button, Icon } from '@app/components/core';
import '@app/App.css';

Header.propTypes = {
  dataProvider: PropTypes.object,
  config: PropTypes.object,
  store: PropTypes.object,
};
export default function Header({ config }) {
  const { store, dataProvider, useResources } = useAppContext(),
    { user, company, social } = store.getState(AUTH),
    { load } = useResources(),
    [signed, sign] = useState(!!social),
    navigate = useNavigate(),
    { title, rootPath } = config,
    appRoute = `/${rootPath}`,
    isAppPage = user && useLocation().pathname.startsWith(appRoute),
    onFailure = (err, msg) => {
      console.log(err, msg);
    },
    onLogin = async ({ token, provider }) => {
      const { error, versions, ...value } = await dataProvider.login({
        token,
        provider,
      });
      if (error) {
        store.dispatch(SESSION);
        navigate('/error', {
          state: { ...error, path: '/' },
        });
      } else {
        load(versions);
        store.dispatch({
          [SESSION]: { value: { username: value?.social?.email } },
          [AUTH]: { value: { social: value?.social } },
        });
        sign(!!value?.social);
      }
    },
    onLogout = () => {
      //TBD: clear all other store topics? clear db?
      store.dispatch(AUTH);
      navigate('/');
    };

  useEffect(() => {
    const sub = store.subscribe(AUTH, ({ social }) => {
      if (social !== signed) sign(!signed);
    });
    return () => store.unsubscribe(sub, AUTH);
  }, []);

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
      {social?.picture && (
        <img alt={company?.name} src={social.picture} />
      )}
      <span className="header-title">{company?.name}</span>
      {social && (
        <div style={{ margin: '0 1rem' }}>
          {<h5>{`Welcome, ${social.name} `}</h5>}
          {user ? (
            <span>
              impersonated as &nbsp;
              <strong>
                <i>{user.name}</i>
              </strong>
            </span>
          ) : (
            <span>not impersonated</span>
          )}
        </div>
      )}
      <div className="header-right">
        <div id="h_buttons" />
        {!isAppPage && (
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
          <GoogleLogout
            id={process.env.GOOGLE_ID}
            onSuccess={onLogout}
            onFailure={onFailure}
          />
        ) : (
          <GoogleLogin
            id={process.env.GOOGLE_ID}
            onSuccess={onLogin}
            onFailure={onFailure}
          />
        )}
      </div>
    </>
  );
}
