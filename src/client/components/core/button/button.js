import { Children } from 'react'; //forwardRef,
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Icon } from '..';
//import { getIcon } from '../icon';
import './button.css';

const Button = ({
  icon,
  iconStyle = 'r',
  iconSize,
  info,
  id,
  name,
  text = '',
  minimal,
  disabled,
  style,
  tooltip,
  tooltipPos,
  className,
  onClick,
  rotate,
  children,
}) => {
  const clicked = (ev) => {
      onClick?.(ev, id);
    },
    klass = classNames(['btn', className], {
      minimal: minimal,
      hint: tooltip,
      [`hint-${tooltipPos}`]: tooltipPos,
    });

  return (
    <button
      type="button"
      name={name}
      style={style}
      data-tip={tooltip}
      onClick={clicked}
      disabled={disabled}
      className={klass}>
      {icon && (
        <Icon
          name={icon}
          size={iconSize}
          styled={iconStyle}
          rotate={rotate}
        />
      )}
      {text && <span className="btn-text">{text}</span>}
      {info && (
        <Icon
          name={info}
          size={iconSize}
          styled={iconStyle}
          rotate={rotate}
        />
      )}
      {children}
    </button>
  );
};

// const Button = forwardRef(
//   (
//     {
//       icon,
//       iconStyle = 'r',
//       iconSize,
//       fa = true,
//       info,
//       id,
//       name,
//       //delimiter,
//       rotate,
//       text = '',
//       minimal,
//       disabled,
//       style,
//       className,
//       onClick,
//       children,
//     },
//     ref
//   ) => {
//     const clicked = (ev) => {
//         onClick?.(ev, id);
//       },
//       klass = classNames(['btn', className], {
//         // ['icon-delimiter']: delimiter,
//         minimal: minimal,
//         ['with-icons']: icon || info,
//         ['i-fa']: fa,
//         [`i-${iconStyle}`]: iconStyle,
//         [`i-${iconSize}`]: iconSize,
//         [`rotate-${rotate}`]: rotate,
//       });

//     return (
//       <button
//         type="button"
//         name={name}
//         ref={ref}
//         style={style}
//         onClick={clicked}
//         disabled={disabled}
//         data-before={getIcon(icon)}
//         data-after={getIcon(info)}
//         className={klass}>
//         {text && <span className="btn-text">{text}</span>}
//         {children}
//       </button>
//     );
//   }
// );

const ButtonGroup = ({ minimal, style, children }) => {
  return (
    <div
      style={style}
      className={classNames(['button-group'], {
        minimal: minimal,
      })}>
      {Children.map(children, (child) => {
        const Type = child.type,
          props = child.props;
        return <Type minimal={minimal} {...props} />;
      })}
    </div>
  );
};

Button.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  icon: PropTypes.string,
  iconStyle: PropTypes.string,
  iconSize: PropTypes.string,
  name: PropTypes.string,
  info: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rotate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  header: PropTypes.bool,
  tooltip: PropTypes.string,
  tooltipPos: PropTypes.string,
  disabled: PropTypes.bool,
  style: PropTypes.object,
  onClick: PropTypes.func,
  minimal: PropTypes.bool,
  children: PropTypes.any,
};

ButtonGroup.propTypes = {
  minimal: PropTypes.bool,
  style: PropTypes.object,
  children: PropTypes.any,
};

export { ButtonGroup };
export default Button;
