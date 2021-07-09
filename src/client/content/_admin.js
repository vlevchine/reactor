import PropTypes from 'prop-types';
import '@app/content/styles.css';

export const config = {};
//Display/edit item details - <Admin>
const Admin = ({
  def,
  model,
  //ctx,
  // ...rest
}) => {
  return (
    <div>
      <h3>{def.title}</h3>
      <h4>Model</h4>
      <p>{JSON.stringify(model)}</p>
      <h4>Def</h4>
      <p>{JSON.stringify(def)}</p>
    </div>
  );
};

Admin.propTypes = {
  def: PropTypes.object,
  ctx: PropTypes.object,
  model: PropTypes.object,
};

export default Admin;
