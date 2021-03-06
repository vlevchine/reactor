import PropTypes from 'prop-types';
import {
  GoogleLogin as Google_login,
  useGoogleLogout,
  useGoogleLogin,
} from 'react-google-login';
import { Button } from '@app/components/core';

const extractGoogle = (res) => {
  const { idpId, id_token } = res.getAuthResponse();
  return { provider: idpId.toUpperCase(), token: id_token };
};

GoogleLogin.propTypes = {
  id: PropTypes.string,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  isSignedIn: PropTypes.bool,
};
export function GoogleLogin({ id, onSuccess, onError, isSignedIn }) {
  const onLogin = (res) => onSuccess(extractGoogle(res)),
    onFailure = (err) =>
      onError?.(err, 'Error logging in with Google');
  return (
    <Google_login
      clientId={id}
      buttonText="Login with Google"
      onSuccess={onLogin}
      onFailure={onFailure}
      isSignedIn={isSignedIn}
      theme="dark"
    />
  );
}

GoogleLogout.propTypes = {
  onError: PropTypes.func,
  id: PropTypes.string,
  onSuccess: PropTypes.func,
};
export function GoogleLogout({ id, onSuccess, onError }) {
  const onFailure = (err) =>
      onError(err, 'Error logging out with Google'),
    { signOut } = useGoogleLogout({
      clientId: id,
      onLogoutSuccess: onSuccess,
      onFailure,
    });

  return (
    <Button
      minimal
      text={<h5>Logout</h5>}
      prepend="sign-out"
      iconStyle="s"
      className="lg primary max-xl"
      onClick={signOut}
    />
  );
}

export function useSocialLogin0(
  id,
  keepSigned,
  onSuccess,
  onFailure
) {
  const onLogin = (res) => onSuccess(extractGoogle(res)),
    onLoad = (ev) => {
      console.log(ev);
    };

  return useGoogleLogin({
    clientId: id,
    scope: 'profile email',
    onSuccess: onLogin,
    onFailure,
    onLoad,
    //autoLoad: keepSigned,
    fetchBasicProfile: true,
    isSignedIn: keepSigned,
  });
}

export function useSocialLogin(id, keepSigned, onSuccess, onFailure) {
  setTimeout(() => {
    if (keepSigned) {
      onSuccess({ token: '123', provider: 'GOOGLE' });
    } else onFailure({ message: 'Google connect error' });
  }, 100);
}

{
  /* <FacebookLogin
  appId={process.env.FACEBOOK_APP_ID}
  //autoLoad
  fields="name,email,picture"
  //onClick={componentClicked}
  callback={onSuccessFacebook}
/>; */
}
