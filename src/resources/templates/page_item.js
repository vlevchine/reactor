import PropTypes from 'prop-types';
import '@app/content/styles.css';

//Display/edit item details - <T_Page>
const T_Page = ({
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
      <h4>T_Page</h4>
      <h4>{JSON.stringify(lk)}</h4>
      <h4>{JSON.stringify(def)}</h4>
    </div>
  );
};

T_Page.propTypes = {
  def: PropTypes.object,
  lookups: PropTypes.object,
  data: PropTypes.object,
  cached: PropTypes.object,
  cache: PropTypes.object,
  store: PropTypes.object,
  className: PropTypes.string,
};

export default T_Page;
