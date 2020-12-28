import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@app/components/core';

const ErrorPage = () => {
  const navigate = useNavigate(),
    { err = {}, message, path } = useLocation().state,
    forbidden = err.code === 403;
  // <Navigate to={{ pathname: path }} state={logged}></Navigate>
  return (
    <>
      <h1>ERROR {err.name || err.code || 'UNKNOWN'}</h1>
      <br />
      <article>
        <h4>{message}</h4>
        <h5>{err.message}</h5>
        {forbidden && (
          <p>
            Current user has no rights to access this page. You can go
            back to previous page or impersonate user with different
            credentials
          </p>
        )}
      </article>
      <br />
      {path && (
        <Button
          text="Previous page"
          intent="success"
          onClick={() => navigate(path)}
        />
      )}
    </>
  );
};

ErrorPage.propTypes = {
  path: PropTypes.string,
  code: PropTypes.number,
  message: PropTypes.string,
  store: PropTypes.object,
};

export default ErrorPage;
