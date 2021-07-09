import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { getIcon } from '.';
import './icon.css';

export default function Icon({
  name,
  style = {},
  className,
  rotate,
  size,
  tooltip,
}) {
  let klass = classNames([className, size], {
    [`r-${rotate}`]: rotate,
    ['container-relative hint']: tooltip,
  });

  return (
    <i
      data-before={getIcon(name)}
      data-tip={tooltip}
      className={klass}
      style={style}
    />
  );
}

Icon.propTypes = {
  name: PropTypes.string,
  style: PropTypes.object,
  rotate: PropTypes.number,
  className: PropTypes.string,
  size: PropTypes.string,
  tooltip: PropTypes.string,
  ttPlace: PropTypes.string,
};
