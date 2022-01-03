import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { toaster, appState } from '@app/services';
import { GoogleLogin } from '@app/shell/social';
import { Button, I } from '@app/components/core';

Header.propTypes = {
  config: PropTypes.object,
  ctx: PropTypes.object,
};
export default function Header({ config, ctx }) {
  const { auth, nav } = appState,
    { company, user } = ctx,
    navigate = useNavigate(),
    navigateTo = (page) => {
      navigate(`/${page.path}`);
    },
    {
      logout,
      staticPages: { home, impersonate, app },
    } = config,
    { pathname } = useLocation(),
    isAppPage = pathname.split('/').filter(Boolean)[0] === app.path,
    toggleLeftNav = () => {
      nav.dispatch({ path: 'leftNavToggle', value: Symbol() });
    },
    onFailure = (err, msg) => {
      console.log(err, msg);
    },
    onGoolgeLogin = ({ provider, token }) => {
      onLogin(token, provider);
    },
    onLogin = async (token, authority = 'GOOGLE') => {
      const { error, session } = await ctx.dataProvider.login(
        token,
        authority
      );
      if (error) {
        toaster.danger('Error logging in with social provider');
      } else {
        auth.dispatch({ value: session });
      }
    },
    onLogout = async () => {
      const { error } = await ctx.dataProvider.logout();
      if (!error) {
        auth.clear();
        navigateTo(home);
      } else toaster.danger('Error logging out');
    };

  return (
    <>
      {user && (
        <Button
          name="toggler"
          prepend="bars"
          minimal
          iconStyle="s"
          className="lg  mr-4"
          onClick={toggleLeftNav}
        />
      )}

      {user && (
        <>
          <I name="user" className="ml-4" styled="s" size="md" />
          <h5 className="m-1">{`${user.name} /`}</h5>
          <h4 className="uppercase">{company?.name}</h4>
        </>
      )}
      <div className="ml-auto flex-row">
        <div id="h_options" className="flex-row m-r-4" />
        <div id="h_buttons" className="m-r-4" />
        {user && !isAppPage && (
          <Button
            minimal
            prepend="browser"
            iconStyle="r"
            onClick={() => navigateTo(app)}
            text={app.title}
          />
        )}
        {user?.isOwner() && (
          <Button
            minimal
            prepend="user-friends"
            iconStyle="s"
            size="lg"
            className="hint-left-bottom"
            tooltip="Impersonate"
            onClick={() => navigateTo(impersonate)}
          />
        )}
        {user ? (
          <Button
            minimal
            text={logout.name}
            prepend="sign-out-alt"
            iconStyle="s"
            size="lg"
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

// const v = {
//   session: {
//     id: 'vlevchine22@gmail.com',
//     username: 'vlevchine22',
//     socialName: 'Vlad Komlev',
//     provider: authority,
//     user: {
//       id: 'vlevchine22@gmail.com',
//       username: 'vlevchine22',
//       name: 'Vlad Komlev',
//       roles: ['owner', 'power', 'dev', 'admin'],
//       uom: 'M',
//       locale: 'en-CA',
//     },
//     company: { id: 'host', name: 'App Host' },
//   },
//   versions: { lookups: '1', types: '1' },
// };
