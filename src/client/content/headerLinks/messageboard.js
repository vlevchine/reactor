import PropTypes from 'prop-types';
import '@app/content/styles.css';

export const config = {};
//Display/edit item details - <Messageboard>
const Messageboard = ({
  lookups = {},
  // data = {},
  // cached = {},
  def,
  className = '',
  // ...rest
}) => {
  const lk = lookups;
  return (
    <div className={className}>
      <h4>Messageboard</h4>
      <h4>{JSON.stringify(lk)}</h4>
      <h4>{JSON.stringify(def)}</h4>
    </div>
  );
};

Messageboard.propTypes = {
  def: PropTypes.object,
  lookups: PropTypes.object,
  data: PropTypes.object,
  cached: PropTypes.object,
  className: PropTypes.string,
};

export default Messageboard;
