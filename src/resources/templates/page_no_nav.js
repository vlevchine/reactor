import PropTypes from 'prop-types';
import '@app/content/styles.css';

export const config = {};

T_Page.propTypes = {
  uri: PropTypes.string,
  def: PropTypes.object,
  className: PropTypes.string,
};
export default function T_Page({ def, className = '' }) {
  return (
    <div className={className}>
      <h4>T_Page</h4>
      <h4>{JSON.stringify(def)}</h4>
    </div>
  );
}
