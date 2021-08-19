import PropTypes from 'prop-types';
import { _ } from '@app/helpers';

Echo.propTypes = {
  dataid: PropTypes.string,
  className: PropTypes.string,
  value: PropTypes.any,
  style: PropTypes.object,
};

export default function Echo({
  //dataid,
  className,
  value,
  style,
}) {
  const txt =
    _.isObject(value) || _.isArray(value)
      ? JSON.stringify(value)
      : value;

  return (
    <div className={className} style={style}>
      {txt}
    </div>
  );
}
