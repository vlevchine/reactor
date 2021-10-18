import PropTypes from 'prop-types';
import '@app/content/styles.css';

export const config = {
  entity: { type: 'Well', common: 2 },
};

Well.propTypes = {
  def: PropTypes.object,
  parentRoute: PropTypes.string,
  model: PropTypes.object,
  ctx: PropTypes.object,
  className: PropTypes.string,
};
export default function Well({
  model,
  def,
  className = '',
  // ...rest
}) {
  return (
    <div className={className}>
      <h4>Well</h4>
      <h4>{JSON.stringify(model)}</h4>
      <h4>{JSON.stringify(def)}</h4>
    </div>
  );
}
