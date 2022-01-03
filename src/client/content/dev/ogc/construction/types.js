import PropTypes from 'prop-types';
import '@app/content/styles.css';

export const config = {
  entity: { type: 'Dev_Ogc_Construction_Types', common: 2 },
};

Dev_Ogc_Construction_Types.propTypes = {
  def: PropTypes.object,
  parentRoute: PropTypes.string,
  model: PropTypes.object,
  ctx: PropTypes.object,
  className: PropTypes.string,
};
export default function Dev_Ogc_Construction_Types({
  model,
  def,
  className = '',
  // ...rest
}) {
  return (
    <div className={className}>
      <h4>Dev_Ogc_Construction_Types</h4>
      <h4>{JSON.stringify(model)}</h4>
      <h4>{JSON.stringify(def)}</h4>
    </div>
  );
}
