import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import './icon.css';

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
