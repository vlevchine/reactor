import Page from '@app/shell/page';
import TabbedPage from './tabbedPage';
import ProtectedPage from './protectedPage';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

export { Page, TabbedPage, ProtectedPage };

const error = {
  code: 401,
  message: 'You are not authorized to view requested page',
  name: 'AuthorizationError',
};
Unauthorized.propTypes = {
  message: PropTypes.string,
};
export function Unauthorized({ message }) {
  const err = { ...error };
  if (message) err.message = message;
  return <Navigate to="/error" replace state={err} />;
}
