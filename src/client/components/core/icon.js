import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { getIcon } from './helpers';

const Icon = ({
  fa,
  name,
  styled = 'r',
  style = {},
  className,
  rotate,
  tooltip = '',
  ttPlace = 'top',
  size = '',
}) => {
  let klass = classNames(['icon', `i-${styled}`, className], {
      ['icon-fa']: fa,
      [`i-${size}`]: size,
    }),
    styl = { ...style };
  if (rotate) {
    styl.transform = `rotate(${rotate}deg)`;
  }

  return (
    <i
      data-before={getIcon(name)}
      className={klass}
      style={styl}
      data-tip={tooltip}
      data-place={ttPlace}
    />
  );
};

Icon.propTypes = {
  fa: PropTypes.bool,
  name: PropTypes.string,
  style: PropTypes.object,
  tooltip: PropTypes.string,
  ttPlace: PropTypes.string,
  styled: PropTypes.string,
  rotate: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  className: PropTypes.string,
  size: PropTypes.string,
};

const Info = ({ text, ...rest }) => {
  return (
    <Icon
      {...rest}
      tooltip={text}
      name="info-circle"
      className="container-relative hint"
    />
  );
};

Info.propTypes = {
  text: PropTypes.string,
};

export { Icon, Info };
export default Icon;
