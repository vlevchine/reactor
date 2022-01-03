import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@app/components/core';

ErrorPage.propTypes = {
  name: PropTypes.string,
  code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  message: PropTypes.string,
  path: PropTypes.string,
};
export default function ErrorPage({
  name,
  code = '',
  message,
  path,
}) {
  const navigate = useNavigate(),
    { state } = useLocation(),
    _code = String(code || state?.code || ''),
    _name = name || state?.name || '',
    _path = path || state?.path,
    _message = message || state?.message || '',
    forbidden = _code === '403';

  // <Navigate to={{ pathname: path }} state={logged}></Navigate>
  return (
    <section className="app-error">
      <h1>ERROR: {_code}</h1>
      <h2>{_name || 'UNKNOWN'}</h2>
      <article>
        <h4>{_message}</h4>
        {forbidden && (
          <p>
            Current user has no rights to access this page. You can go
            back to previous page or impersonate user with different
            credentials
          </p>
        )}
      </article>

      {_path && (
        <Button
          text="Previous page"
          intent="success"
          onClick={() => navigate(path)}
        />
      )}
    </section>
  );
}
