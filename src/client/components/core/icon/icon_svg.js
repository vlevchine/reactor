import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import './icon.css';
import { getIcon } from './';

SvgIcon.propTypes = {
  color: PropTypes.string,
  name: PropTypes.string,
  style: PropTypes.object,
  tooltip: PropTypes.string,
  ttPlace: PropTypes.string,
  styled: PropTypes.string,
  rotate: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  className: PropTypes.string,
  size: PropTypes.string,
};

export default function SvgIcon({
  //color,
  name,
  styled = 'r',
  style,
  className,
  rotate,
  tooltip,
  // ttPlace = 'top',
  size = '',
}) {
  // if (rotate) {
  //   styl.transform = `rotate(${rotate}deg)`;
  // }
  const named = `#${name}-${styled}`;

  return (
    <svg
      data-tip={tooltip}
      className={classNames(['icon', className], {
        [size]: size,
        [`r-${rotate}`]: rotate,
        ['container-relative hint']: tooltip,
      })}
      style={style}>
      <use href={named}></use>
    </svg>
  );
}

I.propTypes = {
  color: PropTypes.string,
  name: PropTypes.string,
  style: PropTypes.object,
  tooltip: PropTypes.string,
  ttPlace: PropTypes.string,
  styled: PropTypes.string,
  rotate: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  className: PropTypes.string,
  size: PropTypes.string,
};

export function I({
  //color,
  name,
  styled = 'r',
  style,
  className,
  rotate,
  tooltip,
  // ttPlace = 'top',
  size = '',
  ...rest
}) {
  return (
    <i
      {...rest}
      data-tip={tooltip}
      data-append={getIcon(name)}
      data-append-l={styled === 'l' || undefined}
      data-append-s={styled === 's' || undefined}
      className={classNames(['icon', className], {
        [size]: size,
        [`r-${rotate}`]: rotate,
        ['container-relative hint']: tooltip,
      })}
      style={style}></i>
  );
}
