import { Children } from 'react'; //forwardRef,
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import { I } from '..';
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
  text = '',
  intent,
  minimal,
  disabled,
  // name,
  // style,
  tooltip,
  tooltipPos,
  className,
  onClick,
  rotate,
  children,
  ...rest
}) {
  const clicked = (ev) => {
      ev.stopPropagation();
      onClick?.(ev, id);
    },
    klass = classNames(['btn', intent, size, className], {
      minimal,

      [`hint-${tooltipPos}`]: tooltipPos,
    });

  return (
    <button
      {...rest}
      type="button"
      tabIndex="-1"
      // name={name}
      // style={style}
      data-tip={tooltip}
      onClick={clicked}
      disabled={disabled}
      className={klass}>
      {prepend && (
        <I name={prepend} styled={iconStyle} rotate={rotate} />
      )}
      {text && <span>{text}</span>}
      {append && (
        <I name={append} styled={iconStyle} rotate={rotate} />
      )}
      {children}
    </button>
  );
}

export const ButtonGroup = ({
  minimal,
  size,
  intent,
  disabled,
  style,
  className,
  children,
}) => {
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
        return (
          <Type
            {...props}
            minimal={minimal}
            size={size}
            intent={intent}
            disabled={disabled}
          />
        );
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
  intent: PropTypes.string,
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
  disabled: PropTypes.bool,
  size: PropTypes.string,
  intent: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.any,
  className: PropTypes.string,
};

const btnProps = {
  className: PropTypes.string,
  text: PropTypes.string,
};
AddButton.propTypes = btnProps;
export function AddButton({
  className = 'muted',
  text = 'Add',
  ...rest
}) {
  return (
    <Button
      prepend="plus"
      text={text}
      className={classNames(['invert', className])}
      {...rest}
    />
  );
}

DeleteButton.propTypes = btnProps;
export function DeleteButton({
  className = 'danger',
  text = 'Remove',
  ...rest
}) {
  return (
    <Button
      {...rest}
      prepend="times"
      className={classNames(['invert', className])}
      text={text}
    />
  );
}

CancelButton.propTypes = btnProps;
export function CancelButton({
  className = 'muted',
  text = 'Cancel',
  ...rest
}) {
  return (
    <Button
      {...rest}
      prepend="times"
      className={classNames(['invert', className])}
      text={text}
    />
  );
}

SaveButton.propTypes = btnProps;
export function SaveButton({
  className = 'normal',
  text = 'Save',
  ...rest
}) {
  return (
    <Button
      {...rest}
      prepend="save"
      className={classNames(['invert', className])}
      text={text}
    />
  );
}
