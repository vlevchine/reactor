import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
//Navigatable page
//path=job, navigate, location={hash, search, host, origin, ...}, children
const NotFound = () => {
  const { pageName } = useParams();
  return (
    <section className="app-error">
      <h1>{`Sorry, requested page${
        pageName ? `: "${pageName}"` : ''
      } not found.`}</h1>
    </section>
  );
};

NotFound.propTypes = {
  uri: PropTypes.string,
  className: PropTypes.string,
};

export default NotFound;
