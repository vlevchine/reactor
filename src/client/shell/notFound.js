import PropTypes from 'prop-types';

//Navigatable page
//path=job, navigate, location={hash, search, host, origin, ...}, children
const NotFound = () => {
  return (
    <section className="app-error">
      <h1>Sorry, nothing here...</h1>
    </section>
  );
};

NotFound.propTypes = {
  uri: PropTypes.string,
  className: PropTypes.string,
};

export default NotFound;
