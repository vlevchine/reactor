import PropTypes from 'prop-types';
import '@app/content/styles.css';

//Add new item - <Well>
const Well = ({ def, className = '' }) => {
  return (
    <div className={className}>
      <h4>Well</h4>
      <h4>{JSON.stringify(def)}</h4>
    </div>
  );
};

Well.propTypes = {
  uri: PropTypes.string,
  def: PropTypes.object,
  className: PropTypes.string,
};

export default Well;
