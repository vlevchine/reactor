import { useState, forwardRef, Children } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '@app/helpers';
import Icon from './icon';
import { getIcon } from './helpers';

const sure = 'Are you sure?';
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
          ['icon icon-fa']: icon || info,
          ['i-before']: icon,
          ['i-after']: info,
          [`i-${iconStyle}`]: iconStyle,
          [`rotate-${rotate}`]: rotate,
        })}>
        {text && <span className="btn-text">{text}</span>}
        {children}
      </button>
    );
  }
);

const ConfirmButton = ({
  dataid,
  onClick,
  message = sure,
  ...rest
}) => {
  const [open, setOpen] = useState(),
    clicked = () => {
      setOpen((s) => !s);
    },
    confirmed = () => {
      clicked();
      onClick && onClick(dataid);
    };
  return (
    <div className="container-relative">
      {open && (
        <div className="popover-content">
          <Icon name="question-circle" />
          <span>{message}</span>
          <ButtonGroup minimal>
            <Button info="check-circle" onClick={confirmed} />
            <Button icon="times" onClick={clicked} />
          </ButtonGroup>
        </div>
      )}
      <Button {...rest} onClick={clicked} />
    </div>
  );
};

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
ConfirmButton.propTypes = {
  dataid: PropTypes.string,
  onClick: PropTypes.any,
  message: PropTypes.string,
};
ButtonGroup.propTypes = {
  minimal: PropTypes.bool,
  style: PropTypes.object,
  children: PropTypes.any,
};

export { Button, ConfirmButton, ButtonGroup };
export default Button;
