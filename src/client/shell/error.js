import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@app/components/core';

export default function ErrorPage() {
  const navigate = useNavigate(),
    loc = useLocation(),
    { name, code = '', message, path } = loc.state || {},
    forbidden = code === 403;
  // <Navigate to={{ pathname: path }} state={logged}></Navigate>
  return (
    <section className="app-error">
      <h1>ERROR: {code}</h1>
      <h2>{name || 'UNKNOWN'}</h2>
      <article>
        <h4>{message}</h4>
        {forbidden && (
          <p>
            Current user has no rights to access this page. You can go
            back to previous page or impersonate user with different
            credentials
          </p>
        )}
      </article>

      {path && (
        <Button
          text="Previous page"
          intent="success"
          onClick={() => navigate(path)}
        />
      )}
    </section>
  );
}
