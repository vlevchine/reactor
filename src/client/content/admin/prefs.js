import PropTypes from 'prop-types';
import '@app/content/styles.css';

//page-specifc config
export const config = {};

Prefs.propTypes = {
  def: PropTypes.object,
  model: PropTypes.object,
  ctx: PropTypes.object,
  className: PropTypes.string,
};
export default function Prefs({
  model,
  def,
  className = '',
  // ...rest
}) {
  return (
    <div className={className}>
      <h4>Prefs</h4>
      <h4>{JSON.stringify(model)}</h4>
      <h4>{JSON.stringify(def)}</h4>
    </div>
  );
}
