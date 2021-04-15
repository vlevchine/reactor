import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { nanoid } from 'nanoid';
import { classNames } from '@app/helpers';
import './styles.css';

Popover.propTypes = {
  id: PropTypes.string,
  cmdClose: PropTypes.any,
  target: PropTypes.object,
  content: PropTypes.object,
  className: PropTypes.string,
  minimal: PropTypes.bool,
  place: PropTypes.string,
  light: PropTypes.bool,
  style: PropTypes.object,
  appendType: PropTypes.string,
  onClose: PropTypes.func,
  withIcon: PropTypes.bool,
  hover: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default function Popover({
  id,
  cmdClose,
  target,
  content,
  minimal,
  hover,
  disabled,
  place,
  onClose,
  className,
  style,
}) {
  const [open, setOpen] = useState(false),
    handleChange = () => {
      setOpen(!open);
      if (open) onClose?.();
    },
    _id = useMemo(() => id || nanoid(4), []),
    close = () => {
      setOpen(false);
      onClose?.();
    },
    onBlur = (ev) => {
      setTimeout(
        (tgt) => {
          if (!tgt.contains(document.activeElement)) {
            close();
          }
        },
        0,
        ev.currentTarget
      );
    };
  useEffect(() => {
    cmdClose && close();
  }, [cmdClose]);

  return (
    <div
      className={classNames(['popover-wrapper', className], {
        minimal,
        hover: hover && !disabled,
        disabled,
        [place]: place,
      })}
      style={style}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
      role="button"
      tabIndex="0"
      onBlur={onBlur}
      onMouseEnter={() => hover && setOpen(true)}
      onMouseLeave={() => hover && setOpen(false)}>
      <label htmlFor={_id}>{target}</label>
      {!disabled && (
        <input
          id={_id}
          type="checkbox"
          autoComplete="off"
          hidden
          checked={open}
          onChange={handleChange}
        />
      )}
      <div className="popover-options">{content}</div>
    </div>
  );
}
