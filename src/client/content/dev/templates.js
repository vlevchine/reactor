import PropTypes from 'prop-types';
import '@app/content/styles.css';

//page-specifc config
export const config = {};

Templates.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  ctx: PropTypes.object,
  className: PropTypes.string,
};
export default function Templates({
  model,
  def,
  className = '',
  // ...rest
}) {
  return (
    <div className={className}>
      <h4>Templates</h4>
      <h4>{JSON.stringify(model)}</h4>
      <h4>{JSON.stringify(def)}</h4>
    </div>
  );
}
