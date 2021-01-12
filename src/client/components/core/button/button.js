import { forwardRef, Children } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { getIcon } from '../helpers';
import '../styles.css';
import './button.css';

const Button = forwardRef(
  (
    {
      icon,
      iconStyle = 'r',
      info,
      id,
      name,
      delimiter,
      rotate,
      text = '',
      minimal,
      disabled,
      style,
      className,
      onClick,
      children,
    },
    ref
  ) => {
    const clicked = (ev) => {
      onClick?.(ev, id);
    };

    return (
      <button
        type="button"
        name={name}
        ref={ref}
        style={style}
        onClick={clicked}
        disabled={disabled}
        data-before={getIcon(icon)}
        data-after={getIcon(info)}
        className={classNames(['btn', className], {
          ['icon-delimiter']: delimiter,
          minimal: minimal,
          ['with-icons i-fa']: icon || info,
          [`i-${iconStyle}`]: iconStyle,
          [`rotate-${rotate}`]: rotate,
        })}>
        {text && <span className="btn-text">{text}</span>}
        {children}
      </button>
    );
  }
);

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
  name: PropTypes.string,
  info: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rotate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  header: PropTypes.bool,
  delimiter: PropTypes.bool,
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

export { Button, ButtonGroup };
export default Button;
