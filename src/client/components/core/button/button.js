import { Children } from 'react'; //forwardRef,
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { Icon } from '..';
import './button.css';

//clip-icons defined in icon.css:
// plus, minus, bars,right-arrow,left-arrow, chevron-right, chevron-down
//symbol icons defined in icon/index.js
export default function Button({
  prepend,
  iconStyle = 'r',
  size,
  append,
  id,
  name,
  role,
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
}) {
  const clicked = (ev) => {
      ev.stopPropagation();
      onClick?.(ev, id);
    },
    klass = classNames(['btn', size, className], {
      minimal: minimal,
      [`hint-${tooltipPos}`]: tooltipPos,
    });

  return (
    <button
      type="button"
      tabIndex="-1"
      name={name}
      role={role}
      style={style}
      data-tip={tooltip}
      onClick={clicked}
      disabled={disabled}
      className={klass}>
      {prepend && (
        <Icon name={prepend} styled={iconStyle} rotate={rotate} />
      )}
      {text}
      {append && (
        <Icon name={append} styled={iconStyle} rotate={rotate} />
      )}
      {children}
    </button>
  );
}

const ButtonGroup = ({ minimal, style, className, children }) => {
  if (style) {
    console.log(style);
  }
  return (
    <span
      style={style}
      className={classNames(['button-group', className], {
        minimal: minimal,
      })}>
      {Children.map(children, (child) => {
        if (!child) return null;
        const Type = child.type,
          props = child.props;
        return <Type minimal={minimal} {...props} />;
      })}
    </span>
  );
};

Button.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  prepend: PropTypes.string,
  iconStyle: PropTypes.string,
  size: PropTypes.string,
  name: PropTypes.string,
  role: PropTypes.string,
  append: PropTypes.string,
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
  className: PropTypes.string,
};

export { ButtonGroup };

AddButton.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
};
export function AddButton({ className = 'muted', ...rest }) {
  return (
    <Button
      prepend="plus"
      text="Add"
      className={classNames(['invert', className])}
      {...rest}
    />
  );
}

DeleteButton.propTypes = {
  className: PropTypes.string,
};
export function DeleteButton({ className = 'danger', ...rest }) {
  return (
    <Button
      {...rest}
      prepend="times"
      className={classNames(['invert', className])}
      text="Remove"
    />
  );
}
