import { Component } from 'react';
import PropTypes from 'prop-types';

const renderError = (error) => <h3>Error!!! message: {error}</h3>;
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error?.message };
  }

  static propTypes = {
    children: PropTypes.node.isRequired,
    render: PropTypes.func,
  };

  render() {
    const { hasError, error } = this.state,
      { children, render = renderError } = this.props;

    return hasError ? render(error) : children;
  }
}

export default ErrorBoundary;
