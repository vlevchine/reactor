import PropTypes from 'prop-types';

//Navigatable page
//path=job, navigate, location={hash, search, host, origin, ...}, children
const NotFound = ({ className }) => {
  return (
    <section className={className}>
      <h1>Sorry, nothing here...</h1>
    </section>
  );
};

NotFound.propTypes = {
  uri: PropTypes.string,
  className: PropTypes.string,
};

export default NotFound;
