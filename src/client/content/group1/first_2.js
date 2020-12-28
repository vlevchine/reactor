import PropTypes from 'prop-types';
import '@app/content/styles.css';

//Add new item - <First_2>
const First_2 = ({ def, className = '' }) => {
  return (
    <div className={className}>
      <h4>First_2</h4>
      <h4>{JSON.stringify(def)}</h4>
    </div>
  );
};

First_2.propTypes = {
  uri: PropTypes.string,
  def: PropTypes.object,
  className: PropTypes.string,
};

export default First_2;
