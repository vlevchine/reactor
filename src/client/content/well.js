import PropTypes from 'prop-types';
import '@app/content/styles.css';

//Add new item - <Well>
const Well = ({ def, model }) => {
  return (
    <>
      <h4>Well</h4>
      <h6>{JSON.stringify(def)}</h6>
      <h6>{JSON.stringify(model)}</h6>
    </>
  );
};

Well.propTypes = {
  uri: PropTypes.string,
  def: PropTypes.object,
  model: PropTypes.object,
};

export default Well;
