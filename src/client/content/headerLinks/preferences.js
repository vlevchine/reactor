import PropTypes from 'prop-types';
import '@app/content/styles.css';

//Display/edit item details - <Preferences>
const Preferences = ({
  lookups = {},
  // data = {},
  // cached = {},
  // cache,
  // store,
  def,
  className = '',
  // ...rest
}) => {
  const lk = lookups;
  return (
    <div className={className}>
      <h4>Preferences</h4>
      <h4>{JSON.stringify(lk)}</h4>
      <h4>{JSON.stringify(def)}</h4>
    </div>
  );
};

Preferences.propTypes = {
  def: PropTypes.object,
  lookups: PropTypes.object,
  data: PropTypes.object,
  cached: PropTypes.object,
  cache: PropTypes.object,
  store: PropTypes.object,
  className: PropTypes.string,
};

export default Preferences;
