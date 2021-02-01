import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { getIcon } from '.';
import './icon.css';

export default function Icon({
  name,
  style = {},
  className,
  rotate,
  size = '',
}) {
  let klass = classNames([className], {
    [`${size}`]: size,
    [`r-${rotate}`]: rotate,
  });

  return (
    <i data-before={getIcon(name)} className={klass} style={style} />
  );
}

Icon.propTypes = {
  name: PropTypes.string,
  style: PropTypes.object,
  rotate: PropTypes.number,
  className: PropTypes.string,
  size: PropTypes.string,
};
